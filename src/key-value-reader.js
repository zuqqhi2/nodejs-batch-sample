const Fs = require('fs');
const Lazy = require('lazy');

class KeyValueReader {

  /**
   * Set file path
   * @param {string} filePath - set file path to read
   */
  constructor(filePath) {
    this.filePath = /^[0-9a-zA-Z/_.-]+$/.test(filePath) ? filePath : '';
  }

  /**
   * Read each lines and run function
   * @param {Object} processFunc - function which is called for each lines
   * @param {Object} callback - function which is called at the end
   */
  executeForEach(processFunc, callback) {
    let processLineNum = 0;
    const readStream = Fs.createReadStream(this.filePath, { bufferSize: 256 * 1024 });

    try {
      new Lazy(readStream).lines.forEach((line) => {
        let skipFlg = false;

        // Get key value
        const keyValueData = line.toString().split('\t');
        const key = keyValueData[0];
        const value = keyValueData[1];
        if (!/^[0-9a-z]+$/.test(key) || !/^[0-9a-z]+$/.test(value)) skipFlg = true;

        processLineNum += !skipFlg ? 1 : 0;
        processFunc(key, value, processLineNum, skipFlg);
      }).on('pipe', () => { callback(null, processLineNum) });
    } catch (e) {
      callback(e);
    }
  }
}

module.exports = KeyValueReader;
