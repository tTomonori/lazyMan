const fs = require('fs');
const path = require('path');

const CommonReader = require('../modules/common/CommonReader');

const allowedExtname = ['.mp4', 'wav', '.mp3'];

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
          type: 'directory',
          name: dirent.name,
          physicsName: dirent.name,
        });
      }
      else {
        // ファイル
        let pathInfo = path.parse(dirent.name);
        if (!allowedExtname.includes(pathInfo.ext)) { continue; }
        let info = await this.readInfo(pathInfo.name);
        fileInfo.push({
          type: pathInfo.ext,
          name: info ? info.dispName : dirent.name,
          physicsName: dirent.name,
        });
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
   * ファイルの情報ファイルを読み込む
   * @param {String} name fileInfoPathからの相対パス
   * @returns {Object}
   */
  static async readInfo (name) {
  let json = await CommonReader.loadJson(`${fileInfoPath}/${name}.json`);
  return json;
  }
};