const fs = require('fs');
const path = require('path');

const CommonReader = require('../modules/common/CommonReader');

let playListRootInfo;

module.exports = class PlayListReader {
  static async readPlayList () {
    let json = await CommonReader.loadJson(__dirname + '/../../_data/PlayList.json');
    playListRootInfo = json;
  }
  /**
   * 指定したプレイリストフォルダ情報を取得
   * @param {String} targetPath 
   * @returns {DirectoryInfo}
   */
  static readPlayListFolder (targetPath) {
    targetPath = path.normalize(targetPath);
    let hierarchy = targetPath.split(/\\|\./g).filter(route => route !== '');
    // フォルダ探索
    let currentFolder = playListRootInfo.root;
    for (let route of hierarchy) {
      let nextFolder = currentFolder.elements.find(elem => elem.name === route);
      currentFolder = nextFolder;
    }
    let folders = [];
    let files = [];
    for (let element of currentFolder.elements) {
      switch (element.type) {
        case 'folder':
          folders.push({
            type: 'folder',
            name: element.name,
            physicsName: element.name,
          });
          break;
        case 'playList':
          files.push({
            type: 'list',
            name: element.name,
            physicsName: element.name,
          });
          break;
      }
    }
    // フォルダ情報整形
    return {
      current: targetPath,
      parent: path.dirname(targetPath),
      folders: folders,
      files: files,
    }
  }
}