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
}