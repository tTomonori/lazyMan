require('../../src/@types/type');
const fs = require('fs');
const path = require('path');

/** @enum {String} ディレクトリ要素の種類 */
const DirectoryElementType = {
  FOLDER: 'folder',
  FILE: 'file',
};

const CommonReader = require('../modules/common/CommonReader');
const FolderReader = require('./FolderReader');

const PLAYLIST_FILE_PATH = __dirname + '/../../_data/PlayList.json';
const MAX_BACKUP_NUM = 10;

/** @type {Object} */
let playListInfo;

module.exports = class PlayListReader {
  /** @type {HierarchyInfo} */
  static get playListRootInfo () { return playListInfo.root; }
  /** @type {Array<Object>} */
  static get backupInfo () { return playListInfo.backup; }
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

  /**
   * 指定したプレイリスト情報を取得
   * @param {String} targetPath 
   * @returns {PlayListInfo}
   */
  static async readPlayList (targetPath) {
    let target = this.getDirectoryElement(targetPath);
    let info = await this.createPlayListInfoFromDirectoryElement(target);
    return info;
  }

  /** ------------------------------------------------------------------------------------------ */
  // プレイリスト操作処理
  static async addMusicToPlayList (playListPath, musicPath) {
    let target = this.getDirectoryElement(playListPath);
    if (target.data.list.some(listElem => listElem === musicPath)) {
      // 追加済みの曲は追加不可
      return;
    }
    target.data.list.push(musicPath);
    await this.wirtePlayListFile();
  }

  /** ------------------------------------------------------------------------------------------ */
  // 要素の種類をまとめたフォルダ操作処理
  /**
   * 移動
   * @param {String} targetPath 移動させる要素へのパス
   * @param {String} toPath 移動先のフォルダへのパス
   * @returns {PlayListFolderInfo} 移動させた要素の移動前の親フォルダ情報
   */
  static async moveElement (targetPath, toPath) {
    let target = this.getElement(targetPath);
    switch (target.type) {
      case DirectoryElementType.FOLDER:
        await this.moveFolder(targetPath, toPath);
        break;
      case DirectoryElementType.FILE:
        await this.movePlayList(targetPath, toPath);
        break;
    }
  }

  /**
   * 並び替え
   * @param {String} targetHierarchyPath 並び変える要素の親へのパス
   * @param {String} targetPhysics 並び変える要素名
   * @param {String} toPhysics 並び替え先の次の位置の要素名
   * @returns {PlayListFolderInfo} 並び替えた要素の親フォルダ情報
   */
  static async arrangeElement (targetHierarchyPath, targetPhysics, toPhysics) {
    let target = this.getElement(targetHierarchyPath + '/' + targetPhysics);
    switch (target.type) {
      case DirectoryElementType.FOLDER:
        await this.arrangeFolder(targetHierarchyPath, targetPhysics, toPhysics);
        break;
      case DirectoryElementType.FILE:
        await this.arrangePlayList(targetHierarchyPath, targetPhysics, toPhysics);
        break;
    }
  }

  /**
   * 名称変更
   * @param {String} targetPath 名称を変更する要素名
   * @param {String} newName 新しい名称
   * @returns {PlayListFolderInfo} 名称を変更した要素の親フォルダ情報
   */
  static async renameElement (targetPath, newName) {
    let target = this.getElement(targetPath);
    switch (target.type) {
      case DirectoryElementType.FOLDER:
        await this.renameFolder(targetPath, newName);
        break;
      case DirectoryElementType.FILE:
        await this.renamePlayList(targetPath, newName);
        break;
    }
  }

  /**
   * 削除
   * @param {String} targetPath 削除する要素名
   * @returns {PlayListFolderInfo} 削除した要素の親フォルダ情報
   */
  static async deleteElement (targetPath) {
    let target = this.getElement(targetPath);
    switch (target.type) {
      case DirectoryElementType.FOLDER:
        await this.deleteFolder(targetPath);
        break;
      case DirectoryElementType.FILE:
        await this.deletePlayList(targetPath);
        break;
    }
  }

  /** ------------------------------------------------------------------------------------------ */
  // 要素の種類ごとのフォルダ操作処理
  /**
   * フォルダ作成
   * @param {String} folderPath 新規作成する階層
   * @param {String} folderName 新規フォルダ名
   */
  static async createPlayListFolder (folderPath, folderName) {
    let currentFolder = this.getHierarchy(folderPath);
    // 名称が重複したらエラー
    if (this.getElementFromHierarchy(folderName, currentFolder)) {
      return null;
    }
    let newFolder = this.createHierarchyInfo(folderName);
    currentFolder.folders.push(newFolder);
    await this.wirtePlayListFile();
  }

  /**
   * リスト作成
   * @param {String} folderPath 新規作成する階層
   * @param {String} playListName 新規プレイリスト名
   */
  static async createPlayList (folderPath, playListName) {
    let currentFolder = this.getHierarchy(folderPath);
    // 名称が重複したらエラー
    if (this.getElementFromHierarchy(playListName, currentFolder)) {
      return null;
    }
    let newFolder = this.createFileInfo(playListName);
    currentFolder.files.push(newFolder);
    await this.wirtePlayListFile();
  }

  /**
   * フォルダ移動
   * @param {String} folderPath 移動させるフォルダへのパス
   * @param {String} toPath 移動先のフォルダへのパス
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
    await this.wirtePlayListFile();
  }

  /**
   * リスト移動
   * @param {String} playListPath 移動させるプレイリストへのパス
   * @param {String} toPath 移動先のフォルダへのパス
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
    await this.wirtePlayListFile();
  }

  /**
   * フォルダ並び替え
   * @param {String} targetPath 並び変えるフォルダの親へのパス
   * @param {String} targetName 並び変えるフォルダ名
   * @param {String} toName 並び替え先の位置にあるフォルダ名(''の場合は末尾へ移動)
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

    await this.wirtePlayListFile();
  }

  /**
   * リスト並び替え
   * @param {String} targetPath 並び変えるフォルダの親へのパス
   * @param {String} targetName 並び変えるフォルダ名
   * @param {String} toName 並び替え先の次の位置のフォルダ名(''の場合は末尾へ移動)
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

    await this.wirtePlayListFile();
  }

  /**
   * フォルダ名称変更
   * @param {String} targetPath 名称変更するフォルダへのパス
   * @param {String} newName 変更後の名称
   */
  static async renameFolder (targetPath, newName) {
    let targetFolder = this.getHierarchy(targetPath);
    // 名称が重複したらエラー
    if (this.getElementFromHierarchy(newName, targetFolder)) {
      return null;
    }
    targetFolder.name = newName;
    targetFolder.physicsName = newName;

    await this.wirtePlayListFile();
  }

  /**
   * リスト名称変更
   * @param {String} targetPath 名称変更するリストへのパス
   * @param {String} newName 変更後の名称
   */
  static async renamePlayList (targetPath, newName) {
    let parentFolder = this.getHierarchy(path.dirname(targetPath));
    // 名称が重複したらエラー
    if (this.getElementFromHierarchy(newName, parentFolder)) {
      return null;
    }
    let target = this.getDirectoryElement(targetPath);
    target.name = newName;
    target.physicsName = newName;

    await this.wirtePlayListFile();
  }

  /**
   * フォルダ削除
   * @param {String} targetPath 削除するフォルダへのパス
   */
  static async deleteFolder (targetPath) {
    let parentFolder = this.getHierarchy(path.dirname(targetPath));
    let physicsName = path.basename(targetPath);
    // 削除対象のインデックス
    let targetIndex = parentFolder.folders.findIndex(elem => elem.physicsName === physicsName);
    // 削除
    let target = parentFolder.folders.splice(targetIndex, 1)[0];

    this.backupObject(target);
    await this.wirtePlayListFile();
  }

  /**
   * リスト削除
   * @param {String} targetPath 削除するリストへのパス
   */
  static async deletePlayList (targetPath) {
    let parentFolder = this.getHierarchy(path.dirname(targetPath));
    let physicsName = path.basename(targetPath);
    // 削除対象のインデックス
    let targetIndex = parentFolder.files.findIndex(elem => elem.physicsName === physicsName);
    // 削除
    let target = parentFolder.files.splice(targetIndex, 1)[0];

    this.backupObject(target);
    await this.wirtePlayListFile();
  }

  /** ------------------------------------------------------------------------------------------ */

  /** プレイリストフォルダ情報読み込み */
  static async readPlayListFile () {
    let json = await CommonReader.loadJson(PLAYLIST_FILE_PATH);
    playListInfo = json;
  }
  /** プレイリストフォルダ情報を書き込む */
  static async wirtePlayListFile () {
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
    };
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
      data: { list: [] },
    };
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

  /**
   * ディレクトリ要素情報をプレイリスト情報に変換
   * @param {DirectoryElementInfo} elemInfo 
   * @returns {PlayListInfo}
   */
  static async createPlayListInfoFromDirectoryElement (elemInfo) {
    let list =[];
    for (let filePath of elemInfo.data.list) {
      let fileName = path.basename(filePath);
      let fileInfo = await FolderReader.readFile(fileName);
      list.push({
        path: filePath,
        fileInfo: fileInfo,
      });
    }
    return {
      type: 'file',
      name: elemInfo.name,
      physicsName: elemInfo.name,
      list: list,
    };
  }

  /**
   * 誤操作のリカバリ用にデータをバックアップ
   * @param {Object} obj バックアップするデータ
   */
  static backupObject (obj) {
    let backup = this.backupInfo;
    backup.unshift(obj);
    backup.splice(MAX_BACKUP_NUM);
  }
}