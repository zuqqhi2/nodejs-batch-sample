// ===== Preparing ===============================

// Libraries
const Async = require('async');
const Log4js = require('log4js');
const Mailer = require('nodemailer');
const CommandLineArgs = require('command-line-args');

// Dependent classes
const FakableRedisClient = require('./fakable-redis-client');
const KeyValueReader = require('./key-value-reader');

// Logger
Log4js.configure('./config/logging.json');
const logger = Log4js.getLogger();

// Command line arguments
const optionDefinitions = [
  { name: 'env', alias: 'e', type: String },
  { name: 'fakeredis', alias: 'f', type: Boolean },
];
const cmdOptions = CommandLineArgs(optionDefinitions);

const targetEnv = cmdOptions.env ? cmdOptions.env : 'staging';
const fakeRedisFlg = cmdOptions.fakeredis;
logger.info('[Option]');
logger.info('  > targetEnv :', targetEnv);
logger.info('  > fakeRedisFlg :', fakeRedisFlg);

// App config
const conf = require('../config/app_config.json')[targetEnv];

if (!conf) {
  logger.error('Please add', targetEnv, 'setting for app_config');
  process.exit(1);
}

// Alert mail func
const transporter = Mailer.createTransport(conf.alertMail.smtpUrl);
const sendAlertMail = (err, callback) => {
  const msg = err.message;
  const stackStr = err.stack;

  const mailOptions = {
    from: conf.alertMail.from,
    to: conf.alertMail.to,
    subject: conf.alertMail.subject,
    text: conf.alertMail.text
  };
  mailOptions.subject = mailOptions.subject.replace(/#{msg}/g, msg);
  mailOptions.text = mailOptions.text.replace(/#{msg}/g, msg);
  mailOptions.text = mailOptions.text.replace(/#{stack}/g, stackStr);
  transporter.sendMail(mailOptions, (e) => {
    if (e) logger.error(err);
    callback();
  });
};

// Function when it catches fatal error
process.on('uncaughtException', (e) => {
  logger.error(e);
  sendAlertMail(e, (() => { process.exit(1); }));
});


// ===== Main Logic ==============================
logger.info('START  ALL');

// Initialize classes
const redisCli = new FakableRedisClient(
  conf.redis.hostname,
  conf.redis.port,
  conf.redis.password,
  logger,
  fakeRedisFlg
);

const keyValueReader = new KeyValueReader(conf.keyValueFilePath);

Async.waterfall([
  // 1. Redis Authentication
  (callback) => {
    logger.info('START  Redis Authentication');
    redisCli.auth(callback);
  },
  // 2. Insert all mapping got by 1st step
  (callback) => {
    logger.info('FINISH Redis Authentication');
    logger.info('START  Upload Key-Value Data');
    // Define function
    const expireSec = conf.redis.expireDay * 24 * 60 * 60;
    const processFunc = (key, value, processLineNum, skipFlg) => {
      const keyName = conf.redis.keyPrefix + key;
      if (skipFlg) {
        logger.warn('  > Skip : key=>', keyName, 'value=>', value);
      } else {
        if (Math.floor(Math.random() * 1000) + 1 <= 1) {
          logger.info('  > Key/Value/Expire(sec) sampling(0.1%):', keyName, value, expireSec);
        }
        redisCli.set(keyName, value);
        redisCli.expire(keyName, expireSec);
        if (processLineNum % 10 === 0) logger.info(processLineNum, 'are processed...');
      }
    };

    // Read key-value data and upload them to Redis
    keyValueReader.executeForEach(processFunc, callback);
  }
], (e, result) => {
  logger.info('FINISH Upload Key-Value Data');
  if (e) {
    logger.info('Finished to insert:', result);
    logger.error(e);
    sendAlertMail(e, (() => { process.exit(1); }));
  } else {
    logger.info('Finished to insert:', result);
    logger.info('FINISH ALL');
    process.exit(0);
  }
});
