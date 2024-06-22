export default class PlayListClient {
  /**
   * 新規フォルダ作成
   * @param {String} folderPath 作成する階層のパス
   * @param {String} name 新規フォルダ名
   * @param {function(Object):void} callback 
   */
  static newFolder(folderPath, name, callback) {
    $.ajax({
      url: './playList/createPlayListFolder',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ path: folderPath, name: name }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      callback(data);
    });
  }
  /**
   * 新規プレイリスト作成
   * @param {String} folderPath 作成する階層のパス
   * @param {String} name 新規プレイリスト名
   * @param {function(Object):void} callback 
   */
  static newPlayList(folderPath, name, callback) {
    $.ajax({
      url: './playList/createPlayList',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ path: folderPath, name: name }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      callback(data);
    });
  }
  /**
   * 要素を移動する
   * @param {String} targetPath 移動する要素のパス
   * @param {String} toPath 移動先の要素のパス
   * @param {function(Object):void} callback 
   */
  static moveElement (targetPath, toPath, callback) {
    $.ajax({
      url: './playList/moveElement',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ targetPath: targetPath, toPath: toPath }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      callback(data);
    });
  }
  /**
   * 要素の並び替え
   * @param {String} folderPath 並び変える要素の階層のパス
   * @param {String} target 並び変える要素の相対パス
   * @param {String} to 移動先の次の要素の相対パス
   * @param {function(Object):void} callback 
   */
  static arrangeElement (folderPath, target, to, callback) {
    $.ajax({
      url: './playList/arrangeElement',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ targetPath: folderPath, targetName: target, toName: to }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      callback(data);
    });
  }
  /**
   * 要素の名称変更
   * @param {String} targetPath 変更する要素のパス
   * @param {String} newName 変更後の名称
   * @param {function(Object):void} callback 
   */
  static renameElement (targetPath, newName, callback) {
    $.ajax({
      url: './playList/renameElement',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ targetPath: targetPath, newName: newName }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      callback(data);
    });
  }
  /**
   * 要素の削除
   * @param {String} targetPath 削除する要素のパス
   * @param {function(Object):void} callback 
   */
  static deleteElement (targetPath, callback) {
    $.ajax({
      url: './playList/deleteElement',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ targetPath: targetPath }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      callback(data);
    });
  }
} 