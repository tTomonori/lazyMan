const fs = require('fs');
const path = require('path');

const CommonReader = require('../modules/common/CommonReader');

const PLAYLIST_FILE_PATH = __dirname + '/../../_data/PlayList.json';

let playListRootInfo;

module.exports = class PlayListReader {
  /** プレイリストフォルダ情報読み込み */
  static async readPlayList () {
    let json = await CommonReader.loadJson(PLAYLIST_FILE_PATH);
    playListRootInfo = json;
  }
  /** プレイリストフォルダ情報を書き込む */
  static async writeFolder () {
    await CommonReader.writeJson(PLAYLIST_FILE_PATH, playListRootInfo);
  }
  /**
   * パスを階層分けしてArrayで返す
   * @param {String} path 
   * @returns {Array<String>}
   */
  static ditectHierarchy (targetPath) {
    targetPath = path.normalize(targetPath);
    return targetPath.split(/\\|\./g).filter(route => route !== '');
  }
  /**
   * 指定したパスの情報を取得
   * @param {String|Array<String>} targetPath 
   * @returns {HierarchyInfo}
   */
  static getElement (targetPath) {
    let hierarchy = Array.isArray(targetPath) ? targetPath : this.ditectHierarchy(targetPath);
    // フォルダ探索
    let current = playListRootInfo.root;
    for (let route of hierarchy) {
      let nextFolder = current.folders.find(elem => elem.name === route);
      current = nextFolder;
    }
    return current;
  }
  /**
   * 指定したプレイリストフォルダ情報を取得
   * @param {String} targetPath 
   * @returns {DirectoryInfo}
   */
  static readPlayListFolder (targetPath) {
    // フォルダ探索
    let currentFolder = this.getElement(targetPath);
    // フォルダ情報整形
    let folders = currentFolder.folders.map(elem => ({
      type: 'folder',
      name: elem.name,
      physicsName: elem.physicsName,
    }));
    return {
      current: path.normalize(targetPath),
      parent: path.dirname(targetPath),
      folders: folders,
      files: currentFolder.files,
    };
  }

  /**
   * プレイリストフォルダ作成
   * @param {String} folderPath 新規作成する階層
   * @param {String} folderName 新規フォルダ名
   * @returns {PlayListFolderInfo} 新規フォルダの親フォルダ情報
   */
  static async createPlayListFolder (folderPath, folderName) {
    let currentFolder = this.getElement(folderPath);
    let newFolder = this.createFolderInfo(folderName);
    currentFolder.elements.push(newFolder);
    this.writeFolder();
    return currentFolder;
  }

  /**
   * プレイリストフォルダ移動
   * @param {String} folderPath 移動させるフォルダへのパス
   * @param {String} toPath 移動先のフォルダへのパス
   * @returns {PlayListFolderInfo} 移動させたフォルダの移動前のフォルダ情報
   */
  static moveFolder (folderPath, toPath) {
    let currentFolder = this.getElement(folderPath);
    let toFolder = this.getElement(toPath);
    toFolder.ele
  }

  /** プレイリスト移動 */

  /** プレイリストフォルダ削除 */

  /** プレイリスト削除 */

  /**
   * プレイリストフォルダ情報取得
   * @param {String} name フォルダ名
   * @returns {FolderInfo}
   */
  static createFolderInfo (name) {
    let newName = name.replace(/\/\\\./g, '');
    return {
      type: 'folder',
      name: newName,
      physicsName: newName,
      elements: [],
    }
  }
}