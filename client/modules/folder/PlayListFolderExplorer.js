import PlayListClient from '../serverClient/PlayListClient.js';
import DirectoryDisplay from './DirectoryDisplay.js';
import Popup from '../ui/Popup.js';
import ct from '../../constTable.js';
import gd from '../../globalData.js';

const BACK_KEY = '/back';
const NEW_KEY = '/new';

/**
 * @typedef {Object} PlayListFolderExplorerOption
 * @property {function(String):void} onPlayListSelected (<選択したプレイリストへのパス>) => {}
 * @property {function(key):void} onMenuClick
 * @property {Boolean} isEditable
 */

export default class PlayListFolderExplorer {
  /**
   * @param {jQuery} dom 
   * @param {PlayListFolderExplorerOption} option 
   */
  constructor (dom, option) {
    this.host = dom;
    this.option = option;
    this.directoryDisplay = new DirectoryDisplay(dom, {
      createElement: null,
      onSelectFolder: (elem) => { this.open(this.getCurrentPath() + '/' + elem.key); },
      onSelectFile: (elem) => { this.option.onPlayListSelected(this.directoryInfo.current + '/' + elem.key); },
      onSelectUi: (elem) => {
        if (elem.key === BACK_KEY) {
          this.open(this.getCurrentPath() + '/..');
        }
        else if (elem.key === NEW_KEY) {
          this.onSelectPlus();
        }
      },
      onMenuClick: (elem) => { this.onMenuClick(elem); },
      folderClickThreshold: 1,
      fileClickThreshold: 1,
      uiClickThreshold: 1,
      isMenuDisplayed: this.isEditable(),
      onDrop: (dragged, dropped) => { this.onDrop(dragged, dropped); },
      isDraggable: this.isEditable(),
      lineMargin: '10px',
    });
    /** @type {DirectoryInfo} */
    this.directoryInfo = null;
    // オブザーバ追加
    gd.subject.addObserver({ dom: this.host[0], receiver: (msg, prm) => {
      if (msg !== gd.modeManager.CHANGEMODE_MESSAGE) { return; }
      this.setEditMode();
    }});
  }
  isEditable () {
    if (!this.option.isEditable) { return false; }
    return gd.modeManager.mode === gd.modeManager.MODE.EDITABLE;
  }
  setEditMode () {
    if (!this.option.isEditable) { return; }
      let isEditable = this.isEditable();
    this.directoryDisplay.setOption({
      isDraggable: isEditable,
      isMenuDisplayed: isEditable,
    });
    let dispInfo = this.createDirectoryDispInfo(this.directoryInfo);
    this.directoryDisplay.open(dispInfo);
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
    this.displayInfo(await this.fetchPlayListFolderInfo(path));
  }
  /**
   * 指定したディレクトリ情報を表示
   * @param {DirectoryInfo} directoryInfo 
   */
  displayInfo (directoryInfo) {
    this.directoryInfo = directoryInfo;
    let dispInfo = this.createDirectoryDispInfo(directoryInfo);
    this.directoryDisplay.open(dispInfo);
  }
  /**
   * サーバからプレイリストフォルダ情報を取得
   * @param {String} path 
   * @returns {DirectoryInfo}
   */
  async fetchPlayListFolderInfo (path) {
    return await PlayListClient.readPlayListFolder(path);
  }
  /** 新規ボタン押下時 */
  async onSelectPlus () {
    Popup.popupInput('新規作成', ['フォルダ', 'プレイリスト', 'キャンセル'], (input, key, uncover) => {
      if (!input) { return; }
      switch (key) {
        case 'フォルダ':
          PlayListClient.newFolder(this.directoryInfo.current, input, (data) => { this.displayInfo(data); uncover(); });
          break;
        case 'プレイリスト':
          PlayListClient.newPlayList(this.directoryInfo.current, input, (data) => { this.displayInfo(data); uncover(); });
          break;
        case 'キャンセル':
          uncover();
          break;
      }
    });
  }
  /**
   * ドラッグ&ドロップ時
   * @param {import('./DirectoryDisplay.js').DirectoryDispElement} dragged 
   * @param {import('./DirectoryDisplay.js').DirectoryDispElement} dropped 
   */
  async onDrop (dragged, dropped) {
    let draggedType = dragged.type === DirectoryDisplay.directoryElementType.UI ? dragged.key : dragged.type;
    let droppedType = dropped.type === DirectoryDisplay.directoryElementType.UI ? dropped.key : dropped.type;
    switch (`${draggedType}→${droppedType}`) {
      case `${DirectoryDisplay.directoryElementType.FOLDER}→${DirectoryDisplay.directoryElementType.FOLDER}`:
        Popup.popupChoice(`${dragged.name} → ${dropped.name}`, ['並び替え', '移動', 'キャンセル'], (key, uncover) => {
          switch (key) {
            case '並び替え':
              PlayListClient.arrangeElement(this.directoryInfo.current, dragged.key, dropped.key, (data) => { this.displayInfo(data); uncover() });
              break;
            case '移動':
              PlayListClient.moveElement(this.directoryInfo.current + '/' + dragged.key, this.directoryInfo.current + './' + dropped.key, (data) => { this.displayInfo(data); uncover(); });
              break;
            case 'キャンセル':
              uncover();
              break;
          }
        });
        break;
      case `${DirectoryDisplay.directoryElementType.FOLDER}→${BACK_KEY}`:
        PlayListClient.moveElement(this.directoryInfo.current + '/' + dragged.key, this.directoryInfo.current + '/..', (data) => { this.displayInfo(data); });
        break;
      case `${DirectoryDisplay.directoryElementType.FILE}→${DirectoryDisplay.directoryElementType.FOLDER}`:
        PlayListClient.moveElement(this.directoryInfo.current + '/' + dragged.key, this.directoryInfo.current + '/' + dropped.key, (data) => { this.displayInfo(data); });
        break;
      case `${DirectoryDisplay.directoryElementType.FILE}→${DirectoryDisplay.directoryElementType.FILE}`:
        PlayListClient.arrangeElement(this.directoryInfo.current, dragged.key, dropped.key, (data) => { this.displayInfo(data); });
        break;
      case `${DirectoryDisplay.directoryElementType.FILE}→${BACK_KEY}`:
        PlayListClient.moveElement(this.directoryInfo.current + '/' + dragged.key, this.directoryInfo.current + '/..', (data) => { this.displayInfo(data); });
        break;
    }
  }
  /**
   * メニューボタンがクリックされた
   * @param {import('./DirectoryDisplay.js').DirectoryDispElement} elem 
   */
  onMenuClick (elem) {
    Popup.popupChoice('メニュー', ['削除', '名称変更', '閉じる'], (key, uncover) => {
      switch (key) {
        case '削除':
          Popup.popupChoice('本当に削除する？', ['削除', 'キャンセル'], (key, uncover) => {
            switch (key) {
              case '削除':
                PlayListClient.deleteElement(this.directoryInfo.current + '/' + elem.name, (data) => { this.displayInfo(data); uncover(); });
                break;
              case 'キャンセル':
                uncover();
                break;
            }
          });
          break;
        case '名称変更':
          Popup.popupInput('名称変更', ['変更', 'キャンセル'], (input, key, uncover) => {
            switch (key) {
              case '変更':
                PlayListClient.renameElement(this.directoryInfo.current + '/' + elem.name, input, (data) => { this.displayInfo(data); uncover(); });
                break;
              case 'キャンセル':
                uncover();
                break;
            }
          }, { text: elem.name });
          break;
        case '閉じる':
          uncover();
          break;
      }
    });
  }
  /**
   * ディレクトリ情報を表示用に整形
   * @param {DirectoryInfo} data 
   * @returns {import('./DirectoryDisplay.js').DirectoryDispInfo}
   */
  createDirectoryDispInfo (data) {
    let head = [];
    let tail = [];
    if (!this.isRoot(data.current)) {
      // 親ディレクトリへ移動ボタン
      head = [{
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
      icon: ct.path.icon + 'musicList.png',
    }));
    if (this.isEditable()) {
      // フォルダ新規作成ボタン
      tail = [{
        type: DirectoryDisplay.directoryElementType.UI,
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