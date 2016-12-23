const Chai   = require('chai');
const Log4js = require('log4js');

const assert = Chai.assert
const expect = Chai.expect
Chai.should()

const KeyValueReader = require('../src/key-value-reader');

Log4js.configure('./test/config/logging.json');
logger = Log4js.getLogger();


const filePath = './test/data/key-value.dat';
const invalidFilePath = 'f(^o^;)';

describe('KeyValueReader', () => {

  describe('constructor', () => {
    it('should set filePath', () => {
      const reader = new KeyValueReader(filePath);

      reader.filePath.should.equal(filePath);
    });

    it('should not set filePath', () => {
      const reader = new KeyValueReader(invalidFilePath);

      reader.filePath.should.equal('');
    });
  });

  describe('executeForEach', () => {
    it('should call callback without err', (done) => {
      const reader =new KeyValueReader(filePath);
      const expected = [
        {'key' : 'abc', 'value' : '123', 'skipFlg' : false, 'processLineNum' : 1},
        {'key' : 'm(_ _)m', 'value' : 'orz', 'skipFlg' : true, 'processLineNum' : 1},
        {'key' : 'def', 'value' : '456', 'skipFlg' : false, 'processLineNum' : 2},
        {'key' : '012', 'value' : 'xyz', 'skipFlg' : false, 'processLineNum' : 3}
      ];

      let counter = 0;
      processFunc = (key, value, processLineNum, skipFlg) => {
        key.should.equal(expected[counter]['key']);
        value.should.equal(expected[counter]['value']);
        skipFlg.should.equal(expected[counter]['skipFlg']);
        processLineNum.should.equal(expected[counter]['processLineNum']);
        counter += 1;
      };

      reader.executeForEach(processFunc, () => { done(); } );
    });
  });
});
