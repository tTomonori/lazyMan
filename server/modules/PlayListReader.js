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
  static getHierarchy (targetPath) {
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
    let currentFolder = this.getHierarchy(targetPath);
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
    let currentFolder = this.getHierarchy(folderPath);
    // 名称が重複したらエラー
    if (this.getElement(folderName, currentFolder)) {
      return null;
    }
    let newFolder = this.createHierarchyInfo(folderName);
    currentFolder.folders.push(newFolder);
    await this.writeFolder();
    return this.createDirectoryInfoFromHierarchy(path.normalize(folderPath), currentFolder);
  }

  /**
   * プレイリスト作成
   * @param {String} folderPath 新規作成する階層
   * @param {String} playListName 新規プレイリスト名
   * @returns {PlayListFolderInfo} 新規プレイリストの親フォルダ情報
   */
  static async createPlayList (folderPath, playListName) {
    let currentFolder = this.getHierarchy(folderPath);
    // 名称が重複したらエラー
    if (this.getElement(playListName, currentFolder)) {
      return null;
    }
    let newFolder = this.createDirectoryElementInfo(playListName);
    currentFolder.files.push(newFolder);
    await this.writeFolder();
    return this.createDirectoryInfoFromHierarchy(path.normalize(folderPath), currentFolder);
  }

  /**
   * プレイリストフォルダ移動
   * @param {String} folderPath 移動させるフォルダへのパス
   * @param {String} toPath 移動先のフォルダへのパス
   * @returns {PlayListFolderInfo} 移動させたフォルダの移動前の親フォルダ情報
   */
  static async moveFolder (folderPath, toPath) {
    let currentNormal = path.normalize(folderPath);
    let toNomal = path.normalize(toPath);
    let parentNormal = path.dirname(folderPath);
    // 移動先が子孫の場合はエラー
    if (toNomal.startsWith(currentNormal)) {
      return null;
    }
    let currentFolder = this.getHierarchy(currentNormal);
    let toFolder = this.getHierarchy(toNomal);
    let parentFolder = this.getHierarchy(parentNormal);
    // 名称が重複したらエラー
    if (this.getElement(currentFolder.name, toFolder)) {
      return null;
    }
    // 移動先に追加
    toFolder.folders.push(currentFolder);
    // 元の親から削除
    parentFolder.folders = parentFolder.folders.filter(elem => elem.name !== currentFolder.name);
    await this.writeFolder();
    return this.createDirectoryInfoFromHierarchy(path.dirname(folderPath), parentFolder);
  }

  /**
   * プレイリスト移動
   * @param {String} playListPath 移動させるプレイリストへのパス
   * @param {String} toPath 移動先のフォルダへのパス
   * @returns {PlayListFolderInfo} 移動させたプレイリストの移動前の親フォルダ情報
   */
  static async movePlayList (playListPath, toPath) {
    let parentNormal = path.dirname(playListPath);
    let toNomal = path.normalize(toPath);
    let parentFolder = this.getHierarchy(parentNormal);
    let toFolder = this.getHierarchy(toNomal);
    let playListName = path.basename(playListPath)
    // 名称が重複したらエラー
    if (this.getElement(playListName, toFolder)) {
      return null;
    }
    // 移動先に追加
    let targetPlayList = parentFolder.files.find(file => file.name === playListName);
    toFolder.files.push(targetPlayList);
    // 元の親から削除
    parentFolder.files = parentFolder.files.filter(elem => elem.name !== playListName);
    await this.writeFolder();
    return this.createDirectoryInfoFromHierarchy(path.dirname(playListPath), parentFolder);
  }

  /**
   * プレイリストフォルダ並び替え
   * @param {String} targetPath 並び変えるフォルダの親へのパス
   * @param {String} targetName 並び変えるフォルダ名
   * @param {String} nextName 並び替え先の次の位置のフォルダ名(''の場合は末尾へ移動)
   * @returns {PlayListFolderInfo} 並び替えたプレイリストフォルダの親フォルダ情報
   */
  static async arrangeFolder (targetPath, targetName, nextName) {
    let indexNumberOf = /** @type {function(Array<HierarchyInfo>)} */(folders, name) => {
      return folders.findIndex(elem => elem.name === name);
    }
    let parentFolder = this.getHierarchy(targetPath);
    // 元の位置から削除
    let targetIndex = indexNumberOf(parentFolder.folders, targetName);
    let target = parentFolder.folders.splice(targetIndex, 1)[0];

    // 移動先の位置へ移動
    let nextIndex = !nextName ? parentFolder.folders.length : indexNumberOf(parentFolder.folders, nextName);
    parentFolder.folders.splice(nextIndex, 0, target);

    await this.writeFolder();
    return this.createDirectoryInfoFromHierarchy(targetPath, parentFolder);
  }

  /**
   * プレイリスト並び替え
   * @param {String} targetPath 並び変えるフォルダの親へのパス
   * @param {String} targetName 並び変えるフォルダ名
   * @param {String} nextName 並び替え先の次の位置のフォルダ名(''の場合は末尾へ移動)
   * @returns {PlayListFolderInfo} 並び替えたプレイリストの親フォルダ情報
   */
  static async arrangePlayList (targetPath, targetName, nextName) {
    let indexNumberOf = /** @type {function(Array<HierarchyInfo>)} */(folders, name) => {
      return folders.findIndex(elem => elem.name === name);
    }
    let parentFolder = this.getHierarchy(targetPath);
    // 元の位置から削除
    let targetIndex = indexNumberOf(parentFolder.files, targetName);
    let target = parentFolder.files.splice(targetIndex, 1)[0];

    // 移動先の位置へ移動
    let nextIndex = !nextName ? parentFolder.files.length : indexNumberOf(parentFolder.files, nextName);
    parentFolder.files.splice(nextIndex, 0, target);

    await this.writeFolder();
    return this.createDirectoryInfoFromHierarchy(targetPath, parentFolder);
  }

  /** プレイリストフォルダ名称変更 */

  /** プレイリストフォルダ削除 */

  /** プレイリスト削除 */

  /**
   * フォルダ情報生成
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

  /**
   * 階層情報取生成
   * @param {String} name 階層名
   * @returns {FolderInfo}
   */
  static createHierarchyInfo (name) {
    let newName = name.replace(/\/\\\./g, '');
    return {
      type: 'folder',
      name: newName,
      physicsName: newName,
      folders: [],
      files: [],
    }
  }

  /**
   * ディレクトリ要素情報取生成
   * @param {String} name 名称
   * @returns {FolderInfo}
   */
  static createDirectoryElementInfo (name) {
    let newName = name.replace(/\/\\\./g, '');
    return {
      type: 'file',
      name: newName,
      physicsName: newName,
    }
  }

  /**
   * 指定した名称のフォルダがファイルを取得
   * @param {String} name 
   * @param {HierarchyInfo} hierarchy 
   */
  static getElement (name, hierarchy) {
    let target;
    target = hierarchy.folders.find(elem => elem.name === name);
    if (!target) {
      target = hierarchy.files.find(elem => elem.name === name);
    }
    return target;
  }

  /**
   * 階層情報からディレクトリ情報を生成
   * @param {String} targetPath 階層へのパス
   * @param {HierarchyInfo} hierarchy 階層情報
   * @returns {DirectoryInfo}
   */
  static createDirectoryInfoFromHierarchy (targetPath, hierarchy) {
    return {
      current: path.normalize(targetPath),
      parent: path.dirname(targetPath),
      folders: hierarchy.folders.map(folder => ({ type: folder.type, name: folder.name, physicsName: folder.physicsName })),
      files: hierarchy.files,
    };
  }
}