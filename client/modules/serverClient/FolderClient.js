export default class FolderClient {
  /**
   * フォルダ情報取得
   * @param {String} folderPath 情報を取得するフォルダのパス
   * @param {function(DirectoryInfo):void}} callback 
   */
  static readFolder (folderPath, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './folder/openFolder',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ path: folderPath }),
      })
        .done((data) => {
          callback(data);
          res(data);
        });
    });
  }
  /**
   * ファイル情報取得
   * @param {String} fileName 情報を取得するファイル名
   * @param {function(MusicFileInfo):void}} callback 
   */
  static readFile(fileName, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './folder/openFile',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ name: fileName }),
      })
        .done((data) => {
          callback(data);
          res(data);
        });
    });
  }
  /**
   * ファイル情報を保存
   * @param {import('../../scripts/type.js').FileInfo} info 
   */
  static writeFile (info, callback) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './folder/saveFile',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ info: info }),
      })
        .done((data) => {
          callback(data);
          res(data);
        });
    });
  }
}