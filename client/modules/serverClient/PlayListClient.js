export default class PlayListClient {
  /**
   * プレイリストフォルダ情報を取得
   * @param {String} targetPath 情報を取得するプレイリストフォルダのパス
   * @param {function(DirectoryInfo):void}} callback 
   */
  static readPlayListFolder(targetPath, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './playList/openPlayListFolder',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ path: targetPath }),
      })
        .done((data) => {
          callback(data);
          res(data);
        });
    });
  }
  /**
   * プレイリスト情報を取得
   * @param {String} targetPath 情報を取得するプレイリストのパス
   * @param {function(PlayListInfo):void}} callback 
   */
  static readPlayList(targetPath, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './playList/openPlayList',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ path: targetPath }),
      })
        .done((data) => {
          callback(data);
          res(data);
        });
    });
  }
  /**
   * 新規フォルダ作成
   * @param {String} folderPath 作成する階層のパス
   * @param {String} name 新規フォルダ名
   * @param {function(Object):void} callback 
   */
  static newFolder(folderPath, name, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './playList/createPlayListFolder',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ path: folderPath, name: name }),
      })
        .done((/** @type {DirectoryInfo} */data) => {
          callback(data);
          res(data);
        });
    });
  }
  /**
   * 新規プレイリスト作成
   * @param {String} folderPath 作成する階層のパス
   * @param {String} name 新規プレイリスト名
   * @param {function(Object):void} callback 
   */
  static newPlayList(folderPath, name, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './playList/createPlayList',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ path: folderPath, name: name }),
      })
        .done((/** @type {DirectoryInfo} */data) => {
          callback(data);
          res(data);
        });
    });
  }
  /**
   * 要素を移動する
   * @param {String} targetPath 移動する要素のパス
   * @param {String} toPath 移動先の要素のパス
   * @param {function(Object):void} callback 
   */
  static moveElement(targetPath, toPath, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './playList/moveElement',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ targetPath: targetPath, toPath: toPath }),
      })
        .done((/** @type {DirectoryInfo} */data) => {
          callback(data);
          res(data);
        });
    });
  }
  /**
   * 要素の並び替え
   * @param {String} folderPath 並び変える要素の階層のパス
   * @param {String} target 並び変える要素の相対パス
   * @param {String} to 移動先の次の要素の相対パス
   * @param {function(Object):void} callback 
   */
  static arrangeElement(folderPath, target, to, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './playList/arrangeElement',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ targetPath: folderPath, targetName: target, toName: to }),
      })
        .done((/** @type {DirectoryInfo} */data) => {
          callback(data);
          res(data);
        });
    });
  }
  /**
   * 要素の名称変更
   * @param {String} targetPath 変更する要素のパス
   * @param {String} newName 変更後の名称
   * @param {function(Object):void} callback 
   */
  static renameElement(targetPath, newName, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './playList/renameElement',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ targetPath: targetPath, newName: newName }),
      })
        .done((/** @type {DirectoryInfo} */data) => {
          callback(data);
          res(data);
        });
    });
  }
  /**
   * 要素の削除
   * @param {String} targetPath 削除する要素のパス
   * @param {function(Object):void} callback 
   */
  static deleteElement(targetPath, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './playList/deleteElement',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ targetPath: targetPath }),
      })
        .done((/** @type {DirectoryInfo} */data) => {
          callback(data);
          res(data);
        });
    });
  }
  /** ------------------------------------------------------------------------------------------ */
  // プレイリスト
  /**
   * プレイリストに曲追加
   * @param {String} playListPath 対象のプレイリストへのパス
   * @param {String} musicPath 追加するファイルへのパス
   * @param {function(Object):void} callback 
   */
  static addMusicToPlayList(playListPath, musicPath, callback = () => {}) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './playList/addMusicToPlayList',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ playListPath: playListPath, musicPath: musicPath }),
      })
        .done((/** @type {DirectoryInfo} */data) => {
          callback(data);
          res(data);
        });
    });
  }
} 