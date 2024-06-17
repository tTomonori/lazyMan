const fs = require('fs');

module.exports = {
  /**
   * jsonを読み込む
   * @param {String} path
   */
  loadJson: async (path) => {
    return new Promise((res, rej) => {
      if (!fs.existsSync(path)) { return res(null); }
      const json = fs.readFileSync(path);
      const data = JSON.parse(json);
      res(data);
    });
  },
  /**
   * jsonを書き込む
   * @param {String} path 
   * @param {Object} json 
   */
  writeJson: async (path, json) => {
    return new Promise(async (res, rej) => {
      await fs.writeFileSync(path, JSON.stringify(json));
      res();
    });
  }
}