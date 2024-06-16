export default {
  /**
   * jsonを読み込む
   * @param {String} path 
   */
  loadJson: async (path) => {
    return new Promise((res, rej) => {
      fetch(path)
      .then(response => response.text())
      .then(data => {
        res(JSON.parse(data));
      })
      .catch(error => {
        rej(error);
      });
    });
  },
}