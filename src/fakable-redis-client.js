const Redis = require('redis');
const FakeRedis = require('fakeredis');

class FakableRedisClient {

  /**
   * Setting parameters and create Redis client instance
   * @param {string} hostname - Redis server host name
   * @param {number} port - Redis server port number
   * @param {string} password - Redis server password
   * @param {Object} logger - logger for error logging
   * @param {boolean} fakeFlg - if it's true, use fake
   */
  constructor(hostname, port, password, logger, fakeFlg) {
    this.logger = logger;
    this.password = password;
    this.redisFactory = Redis;
    this.client = undefined;

    if (fakeFlg) this.redisFactory = FakeRedis;

    // Validation
    if (!/^[0-9a-z.-_]+$/.test(hostname)) return;
    if (isNaN(port)) return;

    // Create instance of redis client
    try {
      this.client = this.redisFactory.createClient(port, hostname);
      this.client.on('error', (e) => { this.logger.error(e); });
    } catch (e) {
      this.logger.error(e);
      this.client = undefined;
    }
  }

  /**
   * Authentication
   * @param {Object} callback - callback function which is called at the end
   */
  auth(callback) {
    const logger = this.logger;
    this.client.auth(this.password, (e) => {
      if (e) {
        logger.error(e);
        callback(e);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Set key-value pair
   * @param {string} key - key-value's key
   * @param {string} value - key-value's value
   */
  set(key, value) {
    this.client.set(key, value);
  }

  /**
   * Set key-value expire
   * @param {string} key - key which will be set expire
   * @param {number} expireSec - expire seconds
   */
  expire(key, expireSec) {
    this.client.expire(key, expireSec);
  }

  get(key, callback) {
    this.client.get(key, (e, value) => {
      if (e) {
        this.logger.error(e);
        callback(e, null);
      } else {
        callback(null, value);
      }
    });
  }
}

module.exports = FakableRedisClient;
