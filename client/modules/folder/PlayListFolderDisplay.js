import FolderDisplay from './FolderDisplay.js';
import ct from '../../constTable.js';

const BACK_KEY = '/back';
const NEW_KEY = '/new';

/**
 * @typedef {Object} PlayListFolderDisplayOption
 * @property {function(import('./FolderDisplay.js').DirectoryDispElement):void} onPlayListSelected
 * @property {function(import('./FolderDisplay.js').DirectoryDispElement,import('./FolderDisplay.js').DirectoryDispElement):void} onDrop
 * @property {Boolean} isEditable
 */

export default class PlayListFolderDisplay {
  /**
   * @param {jQuery} dom 
   * @param {PlayListFolderDisplayOption} option 
   */
  constructor (dom, option) {
    this.host = dom;
    this.option = option;
    this.folderDisplay = new FolderDisplay(dom, {
      createElement: null,
      onSelectFolder: (elem) => { this.open(this.getCurrentPath() + '/' + elem.key); },
      onSelectFile: (elem) => { this.option.onPlayListSelected(elem); },
      onSelectUi: (elem) => {
        if (elem.key === BACK_KEY) {
          this.open(this.getCurrentPath() + '/..');
        }
        else if (elem.key === NEW_KEY) {

        }
      },
      folderClickThreshold: 1,
      fileClickThreshold: 1,
      uiClickThreshold: 1,
      onDrop: (dragged, dropped) => {},
      isDraggable: option.isEditable,
      lineMargin: '10px',
    });
    /** @type {import('../../../scripts/type.js').DirectoryInfo} */
    this.directoryInfo = null;
  }
  setEditMode (editMode) {
    this.option.isEditable = editMode === ct.editMode.EDITABLE;
    this.folderDisplay.setOption({ isDraggable: this.option.isEditable });
    let dispInfo = this.createDirectoryDispInfo(this.directoryInfo);
    this.folderDisplay.open(dispInfo);
  }
  getCurrentPath () {
    return this.directoryInfo.current;
  }
  isRoot () {
    return ['', '\\', '/', '.'].includes(this.directoryInfo.current);
  }
  /**
   * 指定したパスのフォルダを表示
   * @param {String} path 
   */
  async open (path) {
    this.directoryInfo = await this.fetchPlayListFolderInfo(path);
    let dispInfo = this.createDirectoryDispInfo(this.directoryInfo);
    this.folderDisplay.open(dispInfo);
  }
  /**
   * サーバからプレイリストフォルダ情報を取得
   * @param {String} path 
   * @returns {Promise<import('../../../scripts/type.js').DirectoryInfo>}
   */
  async fetchPlayListFolderInfo (path) {
    return new Promise((res, rej) => {
      $.ajax({
        url: './openPlayListFolder',
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
    let head = [];
    let tail = [];
    if (!this.isRoot(data.current)) {
      // 親ディレクトリへ移動ボタン
      head = [{
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
      icon: ct.path.icon + 'musicList.png',
    }));
    if (this.option.isEditable) {
      // フォルダ新規作成ボタン
      tail = [{
        type: FolderDisplay.directoryElementType.UI,
        key: NEW_KEY,
        name: '',
        icon: ct.path.icon + 'plus.png',
        displayOption: { height: '20px' },
      }]
    }

    return {
      name: data.current,
      elements: [...head, ...folders, ...files, ...tail],
    };
  }
}