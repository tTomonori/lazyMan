import ListDisplay from './ListDisplay.js'
import IconButton from '../component/button/IconButton.js';
import ct from '../../constTable.js';

/** @enum {String} ディレクトリ要素の種類 */
const DirectoryElementType = {
  FOLDER: 'folder',
  FILE: 'file',
  UI: 'ui',
};

const ELEMENT_MENU_CLASS = 'directoryDisplayElementMenu';

/**
 * @typedef {Object} DirectoryDispInfo ディレクトリ情報
 * @property {String} name ディレクトリ名
 * @property {Array<DirectoryDispElement>} elements 要素
 */

/**
 * @typedef {Object} DirectoryDispElement ディレクトリ要素
 * @property {DirectoryElementType} type 種類
 * @property {String} key 識別子
 * @property {String} name 表示名
 * @property {String|function():jQueryElement} icon アイコンファイルのURL or DOM要素を返す関数
 * @property {String} hoverIcon アイコンにホバー中のアイコンファイルURL
 * @property {DisplayElementOption} displayOption 表示オプション
 */

/**
 * @typedef {Object} DisplayElementOption 要素の表示オプション
 * @property {String} height 要素のheight
 */

/**
 * @typedef {Object} DirectoryDisplayOption オプション
 * @property {function(DirectoryDispElement):jQueryElement} createElement
 * @property {function(DirectoryDispElement):void} onSelectFolder フォルダ選択時
 * @property {function(DirectoryDispElement):void} onSelectFile ファイル選択時
 * @property {function(DirectoryDispElement):void} onSelectUi UI選択時
 * @property {function(DirectoryDispElement):void} onMenuClick メニューアイコンクリック時
 * @property {function(DirectoryDispElement):void} onIconClick ファイルアイコンクリック時
 * @property {Number} folderClickThreshold フォルダを選択したと判定するクリック回数(0(選択不可), 1, 2)
 * @property {Number} fileClickThreshold ファイルを選択したと判定するクリック回数(0(選択不可), 1, 2)
 * @property {Number} uiClickThreshold UIを選択したと判定するクリック回数(0(選択不可), 1, 2)
 * @property {Boolean} isMenuDisplayed メニューアイコンを表示するか
 * 
 * @property {fuction(DirectoryDispElement,DirectoryDispElement):void} onDrop
 * @property {Boolean} isDraggable
 * @property {String} lineMargin
 */

export default class DirectoryDisplay extends ListDisplay {
  /** @enum {String} ディレクトリ要素の種類 */
  static directoryElementType = DirectoryElementType;
  /**
   * @param {jQueryElement} dom 
   * @param {DirectoryDisplayOption} option 
   */
  constructor (dom, option) {
    super(dom, {
      createElement: option.createElement || ((key) => { return this.createElement(key); }),
      onClick: (key) => { this.selectElement(key, 1); },
      onDoubleClick: (key) => { this.selectElement(key, 2); },
      onMenuClick: option.onMenuClick || ((elem) => {}),
      onDrop: (dragged, dropped) => { this.dropped(dragged, dropped); },
      isMenuDisplayed: option.isMenuDisplayed,
      isDraggable: option.isDraggable,
      lineMargin: option.lineMargin,
    });
    /** @type {DirectoryDisplayOption} */
    this.directoryDisplayOption = option;
    /** @type {DirectoryDispInfo} */
    this.directoryDispInfo = {};
  }
  /**
   * 要素が選択された
   * @param {String} key 要素の識別子
   * @param {Number} clickNum クリック回数
   */
  selectElement (key, clickNum) {
    let selectedElement = this.getDirectoryElement(key);
    switch (selectedElement.type) {
      case DirectoryElementType.FOLDER:
        if (this.directoryDisplayOption.folderClickThreshold === clickNum) { this.directoryDisplayOption.onSelectFolder(selectedElement); }
        break;
      case DirectoryElementType.FILE:
        if (this.directoryDisplayOption.fileClickThreshold === clickNum) { this.directoryDisplayOption.onSelectFile(selectedElement); }
        break;
      case DirectoryElementType.UI:
        if (this.directoryDisplayOption.uiClickThreshold === clickNum) { this.directoryDisplayOption.onSelectUi(selectedElement); }
        break;
    }
  }
  /**
   * アイコンがクリックされた
   * @param {String} key クリックされた要素の識別子
   * @returns 
   */
  iconClicked (key) {
    if (!this.directoryDisplayOption.onIconClick) { return; }
    let elem = this.getDirectoryElement(key);
    this.directoryDisplayOption.onIconClick(elem);
    return true;
  }
  /**
   * ドラッグ&ドロップされた
   * @param {String} dragged ドラッグされた要素の識別子
   * @param {String} dropped ドロップされた要素の識別子
   */
  dropped (dragged, dropped) {
    let draggedElement = this.getDirectoryElement(dragged);
    let droppedElement = this.getDirectoryElement(dropped);
    this.directoryDisplayOption.onDrop(draggedElement, droppedElement);
  }
  /**
   * 指定した要素を取得
   * @param {String} key 要素の識別子
   * @returns {DirectoryDispElement} ディレクトリ要素
   */
  getDirectoryElement (key) {
    return this.directoryDispInfo.elements.find(elem => elem.key === key);
  }
  /**
   * 指定したディレクトリ情報を表示する
   * @param {DirectoryDispInfo} info 
   */
  open (info) {
    this.directoryDispInfo = info;
    let keyList = this.directoryDispInfo.elements.map(elem => elem.key);
    super.updateList(keyList);
  }
  /**
   * 要素の表示要素を生成
   * @param {String} key 要素の識別子
   * @param {DisplayElementOption} option 要素の表示オプション
   * @returns {jQueryElement}
   */
  createElement (key, option) {
    let dirElem = this.getDirectoryElement(key);
    let opt = Object.assign({}, dirElem.displayOption || {}, option || {});

    let element = $('<div>');
    element.css({ height: opt.height || '50px' });
    // アイコン
    let img;
    if (typeof dirElem.icon === 'string') {
      img = $('<img>');
      img.addClass('FolderDisplayIcon');
      if (this.directoryDisplayOption.onIconClick) {
        img.addClass(ListDisplay.CONST.ACTIVEOUT_ELEMENT_CLASS);
      }
      img.prop('src', dirElem.icon);
    }
    else if (typeof dirElem.icon === 'function') {
      img = dirElem.icon();
    }
    element.append(img);
    $(img).on('click', (e) => {
      if (!this.directoryDisplayOption.onIconClick) { return; }
      this.iconClicked(key);
      // 親要素のイベント発火を止める
      e.stopPropagation();
    });
    $(img).on('dblclick', (e) => {
      if (!this.directoryDisplayOption.onIconClick) { return; }
      // 親要素のイベント発火を止める
      e.stopPropagation();
    });
    if (dirElem.hoverIcon) {
      // ホバー中のアイコン設定
      $(img).hover(
        () => { img.prop('src', dirElem.hoverIcon); },
        () => { img.prop('src', dirElem.icon); }
      )
    }
    // 表示名
    let name = $('<div>')
    name.addClass('FolderDisplayName');
    name.text(dirElem.name);
    element.append(name);
    // メニュー
    if (dirElem.type !== DirectoryElementType.UI) {
      let menu = new IconButton({
        icon: 'menu.png',
        size: { width: '', height: '70%' },
        style: {
          position: 'absolute',
          right: '10px',
          display: this.option.isMenuDisplayed ? 'block' : 'none',
          'aspect-ratio': 1,
        }
      });
      menu.dom.addClass(ELEMENT_MENU_CLASS);
      menu.dom.addClass(ListDisplay.CONST.HOVEROUT_ELEMENT_CLASS);
      $(menu.dom).on('click', (e) => {
        this.option.onMenuClick(dirElem);
        // 親要素のイベント発火を止める
        e.stopPropagation();
      });
      element.append(menu.dom);
    }
    return element;
  }
}