import DirectoryDisplay from './DirectoryDisplay.js';
import Popup from '../ui/Popup.js';
import ct from '../../constTable.js';

const BACK_KEY = '/back';
const NEW_KEY = '/new';

/**
 * @typedef {Object} PlayListFolderExplorerOption
 * @property {function(import('./DirectoryDisplay.js').DirectoryDispElement):void} onPlayListSelected
 * @property {function(key):void} onMenuClick
 * @property {function(import('./DirectoryDisplay.js').DirectoryDispElement,import('./DirectoryDisplay.js').DirectoryDispElement):void} onDrop
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
      onSelectFile: (elem) => { this.option.onPlayListSelected(elem); },
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
      isMenuDisplayed: this.option.isEditable,
      onDrop: (dragged, dropped) => { this.onDrop(dragged, dropped); },
      isDraggable: option.isEditable,
      lineMargin: '10px',
    });
    /** @type {DirectoryInfo} */
    this.directoryInfo = null;
  }
  setEditMode (editMode) {
    this.option.isEditable = editMode === ct.editMode.EDITABLE;
    this.directoryDisplay.setOption({
      isDraggable: this.option.isEditable,
      isMenuDisplayed: this.option.isEditable,
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
    return new Promise((res, rej) => {
      $.ajax({
        url: './playList/openPlayListFolder',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ path: path }),
      })
      .done((/** @type {DirectoryInfo} */data) => {
        res(data);
      });
    });
  }
  /** 新規ボタン押下時 */
  async onSelectPlus () {
    Popup.popupInput('新規作成', ['フォルダ', 'プレイリスト', 'キャンセル'], (input, key, uncover) => {
      if (!input) { return; }
      switch (key) {
        case 'フォルダ':
          this.newFolder(input, () => { uncover(); });
          break;
        case 'プレイリスト':
          this.newPlayList(input, () => { uncover(); });
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
              this.arrangeFolder(dragged.key, dropped.key, () => { uncover() });
              break;
            case '移動':
              this.moveFolder(dragged.key, dropped.key, () => { uncover(); });
              break;
            case 'キャンセル':
              uncover();
              break;
          }
        });
        break;
      case `${DirectoryDisplay.directoryElementType.FOLDER}→${BACK_KEY}`:
        this.moveFolder(dragged.key, '..', () => {});
        break;
      case `${DirectoryDisplay.directoryElementType.FILE}→${DirectoryDisplay.directoryElementType.FOLDER}`:
        this.movePlayList(dragged.key, dropped.key, () => {});
        break;
      case `${DirectoryDisplay.directoryElementType.FILE}→${DirectoryDisplay.directoryElementType.FILE}`:
        this.arrangePlayList(dragged.key, dropped.key, () => {});
        break;
      case `${DirectoryDisplay.directoryElementType.FILE}→${BACK_KEY}`:
        this.movePlayList(dragged.key, '..', () => {});
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
          uncover();
          break;
        case '名称変更':
          Popup.popupInput('名称変更', ['変更', 'キャンセル'], (key, uncover) => {
            switch (key) {
              case '変更':
                uncover();
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
    if (this.option.isEditable) {
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
  /**
   * 新規フォルダ作成
   * @param {String} name 新規フォルダ名
   * @param {function():void} callback 
   */
  newFolder(name, callback) {
    $.ajax({
      url: './playList/createPlayListFolder',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ path: this.directoryInfo.current, name: name }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      this.displayInfo(data);
      callback();
    });
  }
  /**
   * 新規プレイリスト作成
   * @param {String} name 新規プレイリスト名
   * @param {function():void} callback 
   */
  newPlayList(name, callback) {
    $.ajax({
      url: './playList/createPlayList',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ path: this.directoryInfo.current, name: name }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      this.displayInfo(data);
      callback();
    });
  }
  /**
   * フォルダを移動する
   * @param {String} target 移動するフォルダの相対パス
   * @param {String} to 移動先のフォルダの相対パス
   * @param {function():void} callback 
   */
  moveFolder (target, to, callback) {
    $.ajax({
      url: './playList/movePlayListFolder',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ folderPath: this.directoryInfo.current + '/' + target, toPath: this.directoryInfo.current + '/' + to }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      this.displayInfo(data);
      callback();
    });
  }
  /**
   * プレイリストを移動する
   * @param {String} target 移動するプレイリストの相対パス
   * @param {String} to 移動先のフォルダの相対パス
   * @param {function():void} callback 
   */
  movePlayList (target, to, callback) {
    $.ajax({
      url: './playList/movePlayList',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ playListPath: this.directoryInfo.current + '/' + target, toPath: this.directoryInfo.current + '/' + to }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      this.displayInfo(data);
      callback();
    });
  }
  /**
   * フォルダの並び替え
   * @param {String} target 並び変えるフォルダの相対パス
   * @param {String} to 移動先の次のフォルダの相対パス
   * @param {function():void} callback 
   */
  arrangeFolder (target, to, callback) {
    $.ajax({
      url: './playList/arrangeFolder',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ targetPath: this.directoryInfo.current, targetName: target, nextName: to }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      this.displayInfo(data);
      callback();
    });
  }
  /**
   * プレイリストの並び替え
   * @param {String} target 並び変えるプレイリストの相対パス
   * @param {String} to 移動先の次のプレイリストの相対パス
   * @param {function():void} callback 
   */
  arrangePlayList (target, to, callback) {
    $.ajax({
      url: './playList/arrangePlayList',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ targetPath: this.directoryInfo.current, targetName: target, nextName: to }),
    })
    .done((/** @type {DirectoryInfo} */data) => {
      this.displayInfo(data);
      callback();
    });
  }
}