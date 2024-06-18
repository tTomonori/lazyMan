import FolderDisplay from './FolderDisplay.js';

import ct from '../../constTable.js';

const BACK_KEY = '/back';

/**
 * @typedef {Object} DirectoryDisplayOption オプション
 * @property {function(DirectoryDispElement):void} onSelectFile ファイル選択時
 */

export default class DirectoryDisplay {
  /**
   * @param {jQueryElement} dom 
   * @param {DirectoryDisplayOption} option 
   */
  constructor (dom, option) {
    this.host = dom;
    this.option = option;
    this.folderDisplay = new FolderDisplay(dom, {
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
    /** @type {import('../../../scripts/type.js').DirectoryInfo} */
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
    this.directoryInfo = await this.fetchDirectoryInfo(path);
    let dispInfo = this.createDirectoryDispInfo(this.directoryInfo);
    this.folderDisplay.open(dispInfo);
  }
  /**
   * サーバからディレクトリ情報を取得
   * @param {String} path 
   * @returns {Promise<import('../../../scripts/type.js').DirectoryInfo>}
   */
  async fetchDirectoryInfo (path) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './openFolder',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ path: path }),
      })
      .done((/** @type {import('../../../scripts/type.js').DirectoryInfo} */data) => {
        res(data);
      });
    });
  }
  /**
   * ディレクトリ情報を表示用に整形
   * @param {import('../../../scripts/type.js').DirectoryInfo} data 
   * @returns {import('./FolderDisplay.js').DirectoryDispInfo}
   */
  createDirectoryDispInfo (data) {
    let back = [];
    if (!this.isRoot(data.current)) {
      // 親ディレクトリへ移動ボタン
      back = [{
        type: FolderDisplay.directoryElementType.UI,
        key: BACK_KEY,
        name: '',
        icon: ct.path.icon + 'returnArrow.png',
        displayOption: { height: '20px' },
      }]
    }
    let folders = data.folders.map(info => ({
      type: FolderDisplay.directoryElementType.FOLDER,
      key: info.physicsName,
      name: info.name,
      icon: ct.path.icon + 'folder.png',
    }));
    let files = data.files.map(info => ({
      type: FolderDisplay.directoryElementType.FILE,
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