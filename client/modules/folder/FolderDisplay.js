import ListDisplay from './ListDisplay.js'
import ct from '../../constTable.js';
window.folderCss = window.folderCss || $('<link rel="stylesheet" href="./client/css/folder.css">').appendTo('head');

const ICONMAP = {
  'back': 'returnArrow.png',
  'directory': 'folder.png',
  '.mp4': 'musicFile.png',
  '.wav': 'musicFile.png',
  '.mp3': 'musicFile.png',
}

const BACK_KEY = '/back';

/**
 * @typedef {Object} ListDisplayOption
 * @property {fuction(String):void} onClick
 * @property {fuction(FolderInfo|FileInfo):void} onDoubleClick
 * @property {fuction(String,String):void} onDrop
 * @property {Boolean} isDraggable
 * @property {String} lineMargin
 */

export default class FolderDisplay extends ListDisplay {
  constructor (dom, option) {
    super(dom, option);
    super.setOption({
      createElement: (key) => { return this.createElement(key); },
      onDoubleClick: (key) => {
        let info;
        if (key === BACK_KEY) {
          info = { type: ct.folderInfo.DIRECTORY, name: '', physicsName: '..' };
        }
        else {
          info = this.getInfo(key);
        }
        option.onDoubleClick(info);
      },
      isDraggable: option.isDraggable || false,
    });
    /** @type {directoryInfo} */
    this.directoryInfo = {};
  }
  getCurrentPath () {
    return this.directoryInfo.current;
  }
  isRoot () {
    return ['', '\\', '/', '.'].includes(this.directoryInfo.current);
  }
  /** フォルダを開く */
  open (path) {
    $.ajax({
      url: './openFolder',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ path: path }),
    })
    .done((data) => {
      this.directoryInfo = data;
      this.updateView();
    });
  }
  /** this.directoryInfoの値で表示を更新する */
  updateView () {
    let list = this.isRoot() ? [] : [BACK_KEY];
    list.push(...this.directoryInfo.folders.map(data => data.physicsName));
    list.push(...this.directoryInfo.files.map(data => data.physicsName));
    super.updateList(list);
  }
  /** フォルダ,ファイルの表示要素を生成 */
  createElement (key) {
    let elementData;
    if (key === BACK_KEY) { elementData = { type: 'back', name: '' }; }
    else { elementData = this.getInfo(key) || { name: key }; }

    let element = $('<div>');
    element.css({ height: key === BACK_KEY ? '20px' : '50px' });
    // アイコン
    let img = $('<img>');
    img.addClass('FolderDisplayIcon');
    img.prop('src', `/client/image/icon/${ICONMAP[elementData.type]}`);
    element.append(img);
    // 表示名
    let name = $('<div>')
    name.addClass('FolderDisplayName');
    name.text(elementData.name || elementData.physicsName);
    element.append(name);
    return element;
  }
  /**
   * フォルダ,ファイルの情報を返す
   * @param {String} physicsName 物理名
   * @returns {FolderInfo|FileInfo}
   */
  getInfo (physicsName) {
    let returns;
    returns = this.directoryInfo.files.find(data => data.physicsName === physicsName);
    if (!returns) {
      returns = this.directoryInfo.folders.find(data => data.physicsName === physicsName);
    }
    return returns;
  }
}