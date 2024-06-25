import FolderClient from '../serverClient/FolderClient.js';
import DirectoryDisplay from './DirectoryDisplay.js';

import ct from '../../constTable.js';

const BACK_KEY = '/back';

/**
 * @typedef {Object} DirectoryExplorerOption オプション
 * @property {function(DirectoryDispElement):void} onSelectFile ファイル選択時
 */

export default class DirectoryExplorer {
  /**
   * @param {jQueryElement} dom 
   * @param {DirectoryExplorerOption} option 
   */
  constructor (dom, option) {
    this.host = dom;
    this.option = option;
    this.directoryDisplay = new DirectoryDisplay(dom, {
      createElement: null,
      onSelectFolder: (elem) => { this.open(this.getCurrentPath() + '/' + elem.key); },
      onSelectFile: (elem) => { this.option.onSelectFile(elem); },
      onSelectUi: (elem) => {
        if (elem.key === BACK_KEY) {
          this.open(this.getCurrentPath() + '/..');
        }
      },
      folderClickThreshold: 1,
      fileClickThreshold: 1,
      uiClickThreshold: 1,
      onDrop: () => {},
      isDraggable: false,
      lineMargin: '10px',
    });
    /** @type {import('../../../scripts/type.d.ts').DirectoryInfo} */
    this.directoryInfo = null;
  }
  getCurrentPath () {
    return this.directoryInfo ? this.directoryInfo.current : '';
  }
  isRoot (path) {
    return ['', '\\', '/', '.'].includes(path);
  }
  /**
   * 指定したパスのフォルダを表示
   * @param {String} path 
   */
  async open (path) {
    FolderClient.readFolder(path, (data) => {
      this.directoryInfo = data;
      let dispInfo = this.createDirectoryDispInfo(this.directoryInfo);
      this.directoryDisplay.open(dispInfo);
    });
  }
  /**
   * ディレクトリ情報を表示用に整形
   * @param {import('../../../scripts/type.js').DirectoryInfo} data 
   * @returns {import('./DirectoryDisplay.js').DirectoryDispInfo}
   */
  createDirectoryDispInfo (data) {
    let back = [];
    if (!this.isRoot(data.current)) {
      // 親ディレクトリへ移動ボタン
      back = [{
        type: DirectoryDisplay.directoryElementType.UI,
        key: BACK_KEY,
        name: '',
        icon: ct.path.icon + 'returnArrow.png',
        displayOption: { height: '20px' },
      }]
    }
    let folders = data.folders.map(info => ({
      type: DirectoryDisplay.directoryElementType.FOLDER,
      key: info.physicsName,
      name: info.name,
      icon: ct.path.icon + 'folder.png',
    }));
    let files = data.files.map(info => ({
      type: DirectoryDisplay.directoryElementType.FILE,
      key: info.physicsName,
      name: info.name,
      icon: ct.path.icon + 'musicFile.png',
    }));

    return {
      name: data.current,
      elements: [...back, ...folders, ...files],
    };
  }
}