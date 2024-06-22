const fs = require('fs');
const path = require('path');

/** @enum {String} ディレクトリ要素の種類 */
const DirectoryElementType = {
  FOLDER: 'folder',
  FILE: 'file',
};

const CommonReader = require('../modules/common/CommonReader');

const PLAYLIST_FILE_PATH = __dirname + '/../../_data/PlayList.json';

/** @type {Object} */
let playListInfo;

module.exports = class PlayListReader {
  /** @type {HierarchyInfo} */
  static get playListRootInfo () { return playListInfo.root; }
  /**
   * 指定したプレイリストフォルダ情報を取得
   * @param {String} targetPath 
   * @returns {DirectoryInfo}
   */
  static readPlayListFolder (targetPath) {
    // フォルダ探索
    let currentFolder = this.getHierarchy(targetPath);
    return this.createDirectoryInfoFromHierarchy(targetPath, currentFolder)
  }

  /** ------------------------------------------------------------------------------------------ */
  // 要素の種類をまとめた処理
  /**
   * 移動
   * @param {String} targetPath 移動させる要素へのパス
   * @param {String} toPath 移動先のフォルダへのパス
   * @returns {PlayListFolderInfo} 移動させた要素の移動前の親フォルダ情報
   */
  static moveElement (targetPath, toPath) {
    let target = this.getElement(targetPath);
    switch (target.type) {
      case DirectoryElementType.FOLDER:
        return this.moveFolder(targetPath, toPath);
      case DirectoryElementType.FILE:
        return this.movePlayList(targetPath, toPath);
    }
  }

  /**
   * 並び替え
   * @param {String} targetHierarchyPath 並び変える要素の親へのパス
   * @param {String} targetPhysics 並び変える要素名
   * @param {String} toPhysics 並び替え先の次の位置の要素名
   * @returns {PlayListFolderInfo} 並び替えた要素の親フォルダ情報
   */
  static arrangeElement (targetHierarchyPath, targetPhysics, toPhysics) {
    let target = this.getElement(targetHierarchyPath + '/' + targetPhysics);
    switch (target.type) {
      case DirectoryElementType.FOLDER:
        return this.arrangeFolder(targetHierarchyPath, targetPhysics, toPhysics);
      case DirectoryElementType.FILE:
        return this.arrangePlayList(targetHierarchyPath, targetPhysics, toPhysics);
    }
  }

  /**
   * 名称変更
   * @param {String} targetPath 名称を変更する要素名
   * @param {String} newName 新しい名称
   * @returns {PlayListFolderInfo} 名称を変更した要素の親フォルダ情報
   */
  static renameElement (targetPath, newName) {

  }

  /**
   * 削除
   * @param {String} targetPath 削除する要素名
   * @returns {PlayListFolderInfo} 削除した要素の親フォルダ情報
   */
  static deleteElement (targetPath) {

  }

  /** ------------------------------------------------------------------------------------------ */
  // 要素の種類ごとの処理
  /**
   * フォルダ作成
   * @param {String} folderPath 新規作成する階層
   * @param {String} folderName 新規フォルダ名
   * @returns {PlayListFolderInfo} 新規フォルダの親フォルダ情報
   */
  static async createPlayListFolder (folderPath, folderName) {
    let currentFolder = this.getHierarchy(folderPath);
    // 名称が重複したらエラー
    if (this.getElementFromHierarchy(folderName, currentFolder)) {
      return null;
    }
    let newFolder = this.createHierarchyInfo(folderName);
    currentFolder.folders.push(newFolder);
    await this.writeFolder();
    return this.createDirectoryInfoFromHierarchy(path.normalize(folderPath), currentFolder);
  }

  /**
   * リスト作成
   * @param {String} folderPath 新規作成する階層
   * @param {String} playListName 新規プレイリスト名
   * @returns {PlayListFolderInfo} 新規プレイリストの親フォルダ情報
   */
  static async createPlayList (folderPath, playListName) {
    let currentFolder = this.getHierarchy(folderPath);
    // 名称が重複したらエラー
    if (this.getElementFromHierarchy(playListName, currentFolder)) {
      return null;
    }
    let newFolder = this.createFileInfo(playListName);
    currentFolder.files.push(newFolder);
    await this.writeFolder();
    return this.createDirectoryInfoFromHierarchy(path.normalize(folderPath), currentFolder);
  }

  /**
   * フォルダ移動
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
    if (this.getElementFromHierarchy(currentFolder.name, toFolder)) {
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
   * リスト移動
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
    if (this.getElementFromHierarchy(playListName, toFolder)) {
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
   * フォルダ並び替え
   * @param {String} targetPath 並び変えるフォルダの親へのパス
   * @param {String} targetName 並び変えるフォルダ名
   * @param {String} toName 並び替え先の位置にあるフォルダ名(''の場合は末尾へ移動)
   * @returns {PlayListFolderInfo} 並び替えたプレイリストフォルダの親フォルダ情報
   */
  static async arrangeFolder (targetPath, targetName, toName) {
    let parentFolder = this.getHierarchy(targetPath);
    // 元のインデックス
    let targetIndex = parentFolder.folders.findIndex(elem => elem.physicsName === targetName);
    // 移動先のインデックス
    let toIndex = parentFolder.folders.findIndex(elem => elem.physicsName === toName);
    // 元の位置から削除
    let target = parentFolder.folders.splice(targetIndex, 1)[0];
    // 移動先の位置へ移動
    parentFolder.folders.splice(toIndex, 0, target);

    await this.writeFolder();
    return this.createDirectoryInfoFromHierarchy(targetPath, parentFolder);
  }

  /**
   * リスト並び替え
   * @param {String} targetPath 並び変えるフォルダの親へのパス
   * @param {String} targetName 並び変えるフォルダ名
   * @param {String} toName 並び替え先の次の位置のフォルダ名(''の場合は末尾へ移動)
   * @returns {PlayListFolderInfo} 並び替えたプレイリストの親フォルダ情報
   */
  static async arrangePlayList (targetPath, targetName, toName) {
    let parentFolder = this.getHierarchy(targetPath);
    // 元のインデックス
    let targetIndex = parentFolder.files.findIndex(elem => elem.physicsName === targetName);
    // 移動先のインデックス
    let toIndex = parentFolder.files.findIndex(elem => elem.physicsName === toName);
    // 元の位置から削除
    let target = parentFolder.files.splice(targetIndex, 1)[0];
    // 移動先の位置へ移動
    parentFolder.files.splice(toIndex, 0, target);

    await this.writeFolder();
    return this.createDirectoryInfoFromHierarchy(targetPath, parentFolder);
  }

  /** フォルダ名称変更 */

  /** リスト名称変更 */

  /** フォルダ削除 */

  /** リスト削除 */


  /** ------------------------------------------------------------------------------------------ */

  /** プレイリストフォルダ情報読み込み */
  static async readPlayList () {
    let json = await CommonReader.loadJson(PLAYLIST_FILE_PATH);
    playListInfo = json;
  }
  /** プレイリストフォルダ情報を書き込む */
  static async writeFolder () {
    await CommonReader.writeJson(PLAYLIST_FILE_PATH, playListInfo);
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
   * 指定したパスの要素情報を取得
   * @param {String|Array<String>} targetPath 
   * @returns {HierarchyInfo|DirectoryElementInfo}
   */
  static getElement (targetPath) {
    let hierarchyPath = Array.isArray(targetPath) ? targetPath : this.ditectHierarchy(targetPath);
    let physicsName = hierarchyPath.pop();
    let hierarchy = this.getHierarchy(hierarchyPath);

    let target = hierarchy.folders.find(elem => elem.physicsName === physicsName);
    if (!target) {
      target = hierarchy.files.find(elem => elem.physicsName === physicsName);
    }
    return target;
  }
  /**
   * 指定したパスの階層情報を取得
   * @param {String|Array<String>} targetPath 
   * @returns {HierarchyInfo}
   */
  static getHierarchy (targetPath) {
    let hierarchy = Array.isArray(targetPath) ? targetPath : this.ditectHierarchy(targetPath);
    // フォルダ探索
    let current = this.playListRootInfo;
    for (let route of hierarchy) {
      let nextFolder = current.folders.find(elem => elem.name === route);
      current = nextFolder;
    }
    return current
  }
  /**
   * 指定したパスのファイル情報を取得
   * @param {String|Array<String>} targetPath 
   * @returns {DirectoryElementInfo}
   */
  static getDirectoryElement (targetPath) {
    let hierarchyPath = Array.isArray(targetPath) ? targetPath : this.ditectHierarchy(targetPath);
    let physicsName = hierarchyPath.pop();
    let hierarchy = this.getHierarchy(hierarchyPath);
    return hierarchy.files.find(elem => elem.physicsName === physicsName);
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
   * ファイル情報取生成
   * @param {String} name 名称
   * @returns {FolderInfo}
   */
  static createFileInfo (name) {
    let newName = name.replace(/\/\\\./g, '');
    return {
      type: 'file',
      name: newName,
      physicsName: newName,
    }
  }

  /**
   * 階層情報から指定した名称のフォルダかファイルを取得
   * @param {String} physicsName 物理名
   * @param {HierarchyInfo} hierarchy 
   * @returns {HierarchyInfo|DirectoryElementInfo}
   */
  static getElementFromHierarchy (physicsName, hierarchy) {
    let target;
    target = hierarchy.folders.find(elem => elem.physicsName === physicsName);
    if (!target) {
      target = hierarchy.files.find(elem => elem.physicsName === physicsName);
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