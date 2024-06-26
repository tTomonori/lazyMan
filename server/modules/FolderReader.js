const fs = require('fs');
const path = require('path');

const CommonReader = require('../modules/common/CommonReader');

const allowedExtname = ['.mp4', '.wav', '.mp3'];

let folderRootPath;
let fileInfoPath;

module.exports = class FolderReader {
  static setRoot (json) {
    folderRootPath = json.folderRootPath;
    fileInfoPath = json.fileInfoPath;
  }
  /**
   * フォルダの情報を読み込む
   * @param {String} targetPath folderRootPathからの相対パス
   * @returns {DirectoryInfo} 
   */
  static async readFolder (targetPath) {
    targetPath = path.normalize(targetPath);
    let dirents = await fs.readdirSync(folderRootPath + '/' + targetPath, { encoding: 'utf8', withFileTypes: true, recursive: false });
    let folderInfo = [];
    let fileInfo = [];
    for (let dirent of dirents) {
      // ディレクトリ
      if (dirent.isDirectory()) {
        folderInfo.push({
          type: 'folder',
          name: dirent.name,
          physicsName: dirent.name,
        });
      }
      else {
        // ファイル
        let pathInfo = path.parse(dirent.name);
        if (!allowedExtname.includes(pathInfo.ext)) { continue; }
        let info = await this.readInfo(pathInfo.name);
        if (!info) { info = this.createFileInfo(pathInfo.base); }
        fileInfo.push(info);
      }
    }

    return {
      current: targetPath,
      parent: path.dirname(targetPath),
      folders: folderInfo,
      files: fileInfo,
    };
  }
  /**
   * ファイル情報を読み込む
   * @param {String} physicsName ファイル名
   */
  static async readFile (physicsName) {
    let pathInfo = path.parse(physicsName);
    let info = await this.readInfo(pathInfo.name);
    if (!info) { info = this.createFileInfo(pathInfo.base); }
    return info;
  }
  /**
   * ファイル情報を保存する
   * @param {FileInfo} info 
   */
  static async saveFile (info) {
    let fileInfo = {
      type: info.type,
      name: info.name,
      physicsName: info.physicsName,
      data: info.data,
    };
    await this.writeFileInfo(fileInfo);
  }
  /**
   * ファイルの情報ファイルを読み込む
   * @param {String} name fileInfoPathからの相対パス
   * @returns {Object}
   */
  static async readInfo (name) {
  let json = await CommonReader.loadJson(`${fileInfoPath}/${name}.json`);
  return json;
  }
  /**
   * ファイル情報を書き出す
   * @param {FileInfo} info 
   */
  static async writeFileInfo (info) {
    let pathInfo = path.parse(info.physicsName);
    await CommonReader.writeJson(`${fileInfoPath}/${pathInfo.name}.json`, info);
  }
  /**
   * ファイル情報を生成する
   * @param {Stirng} physicsName 
   * @returns {FileInfo}
   */
  static createFileInfo(physicsName) {
    let pathInfo = path.parse(physicsName);
    return {
      type: 'file',
      fileType: 'music',
      ext: pathInfo.ext,
      name: physicsName,
      physicsName: physicsName,
      data: {
        lyricsSize: null,
        lyrics : '',
      },
    }
  }
};