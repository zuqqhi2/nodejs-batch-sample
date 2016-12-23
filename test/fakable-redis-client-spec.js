const Chai   = require('chai');
const Log4js = require('log4js');

const assert = Chai.assert
const expect = Chai.expect
Chai.should()

const FakableRedisClient = require('../src/fakable-redis-client');

Log4js.configure('./test/config/logging.json');
logger = Log4js.getLogger();

// Redis setting for unit test
const hostname = 'sample.host';
const port = 6379;
const password = 'test';
const invalidHostname = '(^_^;)';
const invalidPort = 'abc';


describe('FakableRedisClient', () => {

  describe('constructor', () => {

    it('should set client', () => {      
      const client = new FakableRedisClient(hostname, port, password, logger, true);
      
      client.password.should.equal(password);
      client.client.should.not.be.undefined;
    });

    it('should not set client', () => {
      const client1 = new FakableRedisClient(invalidHostname, port, password, logger, true);
      const client2 = new FakableRedisClient(hostname, invalidPort, password, logger, true);

      client1.password.should.equal(password);
      expect(client1.client).equal(undefined);
      client2.password.should.equal(password);
      expect(client2.client).equal(undefined);
    });

  });


  describe('auth', () => {
    it('should success authentication', (done) => {
      const client = new FakableRedisClient(hostname, port, password, logger, true);
      
      client.auth((e) => {
        expect(e).equal(null);
        done();
      });
    });
  });

  
  describe('set', () => {
    it('should get abcdef0', (done) => {
      const testKey = 'test';
      const testValue = 'abcdef0';
      const client = new FakableRedisClient(hostname, port, password, logger, true);

      client.set(testKey, testValue);
      client.get(testKey, (e, result) => {
        result.should.equal(testValue);
        done();
      });
    });
  });

  
  describe('expire', () => {
    it("shouldn't get the value after 1.1 sec", (done) => {
      const testKey = 'test';
      const testValue = 'abcdef0';
      const expireSec = 1;
      const client = new FakableRedisClient(hostname, port, password, logger, true);
      
      client.set(testKey, testValue);
      client.expire(testKey, expireSec);
      setTimeout(() => {
        client.get(testKey, (e, result) => {
          expect(result).equal(null);
          done();
        });
      }, 1100);
    });
  });

});
