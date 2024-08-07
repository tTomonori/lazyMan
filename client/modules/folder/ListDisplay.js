const ELEMENT_CLASSNAME = 'ListDisplayElement';
/** 親にホバーイベントを伝搬させないクラス */
const HOVEROUT_ELEMENT_CLASS = 'hoveroutListDisplayElement';
/** 親にアクティブイベントを伝搬させないクラス */
const ACTIVEOUT_ELEMENT_CLASS = 'activeoutListDisplayElement';
const ELEMENTKEY_DATANAME = 'elementkey';
const DRAGGABLE_CLASSNAME = 'elementsDraggable';
window.folderCss = window.folderCss || $('<link rel="stylesheet" href="./client/css/folder.css">').appendTo('head');

/**
 * @typedef {Object} ListDisplayOption
 * @property {fuction(String):Object} createElement
 * @property {fuction(String):void} onClick
 * @property {fuction(String):void} onDoubleClick
 * @property {fuction(String,String):void} onDrop
 * @property {Boolean} isDraggable
 * @property {String} lineMargin
 */

export default class ListDisplay {
  static CONST = { ELEMENT_CLASSNAME, HOVEROUT_ELEMENT_CLASS, ACTIVEOUT_ELEMENT_CLASS };
  /**
   * @param {Object} dom 
   * @param {ListDisplayOption} option 
   */
  constructor (dom, option) {
    this.host = dom;
    this.option = Object.assign({
      createElement: (key) => { },
      onClick: (key) => { },
      onDoubleClick: (key) => { },
      onDrop: (dragged, dropped) => { },
      isDraggable: false,
      lineMargin: '10px',
    }, option);
    this.elements = [];
    this.listContainer = $('<div>');
    this.listContainer.addClass('ListDisplayListContainer');
    this.host.append(this.listContainer);
    if (!this.host.prop('id')) { this.host.prop('id', 'ListDisplay'); }
    this.applyOption();
    this.setEvents();
  }
  /**
   * optionを変更
   * @param {ListDisplayOption} option 
   */
  setOption (option) {
    Object.assign(this.option, option);
    this.applyOption();
  }
  /** optionの設定を反映する */
  applyOption () {
    if (this.option.isDraggable) {
      this.listContainer.addClass(DRAGGABLE_CLASSNAME);
    }
    else {
      this.listContainer.removeClass(DRAGGABLE_CLASSNAME);
    }
  }
  /** イベント設定 */
  setEvents () {
    $(this.host).on('click', `.${ELEMENT_CLASSNAME}`, (e) => {
      let key = $(e.currentTarget).data(ELEMENTKEY_DATANAME);
      this.option.onClick(key);
    });
    $(this.host).on('dblclick', `.${ELEMENT_CLASSNAME}`, (e) => {
      let key = $(e.currentTarget).data(ELEMENTKEY_DATANAME);
      this.option.onDoubleClick(key);
    });

    // 並び替えイベント
    let dragElement;
    /** ドラッグ対象取得 */
    let getTarget = (e) => {
      let x = e.clientX;
      let y = e.clientY;
      let belowElems = document.elementsFromPoint(x, y);
      let dropElement = belowElems.find((elem) => {
        return $(elem).hasClass(ELEMENT_CLASSNAME);
      });
      return dropElement;
    };
    // ドラッグ開始時処理
    let startArrange = (e) => {
      dragElement = getTarget(e);
    };
    // ドラッグ終了時処理
    let endArrange = (e) => {
      let dropElement = getTarget(e);
      if (dragElement && dropElement && dragElement !== dropElement) {
        let dragKey = $(dragElement).data(ELEMENTKEY_DATANAME);
        let dropKey = $(dropElement).data(ELEMENTKEY_DATANAME);
        if (dragKey === dropKey) { return; }
        this.option.onDrop(dragKey, dropKey);
      }
      dragElement = null;
    };
    // PC用並び替えイベント
    $(this.host).on('dragstart', `.${ELEMENT_CLASSNAME}`, (e) => {
      startArrange(e);
    });
    $(this.host).on('dragend', `.${ELEMENT_CLASSNAME}`, (e) => {
      endArrange(e);
    });
    // スマホ用並び替えイベント
    $(this.host).on('touchstart', `.${ELEMENT_CLASSNAME}`, (e) => {
      if (!this.listContainer.hasClass(DRAGGABLE_CLASSNAME)) { return; }
      startArrange(e.changedTouches[0]);
    });
    $(this.host).on('touchend', `.${ELEMENT_CLASSNAME}`, (e) => {
      if (!this.listContainer.hasClass(DRAGGABLE_CLASSNAME)) { return; }
      endArrange(e.changedTouches[0]);
    });
  }
  /**
   * 表示更新
   * @param {Array<String>} list 
   */
  updateList (list) {
    this.deleteElements();
    for (let key of list) {
      let element = this.option.createElement(key);
      element.data(ELEMENTKEY_DATANAME, key);
      element.addClass(ELEMENT_CLASSNAME);
      element.css({
        marginBottom: this.option.lineMargin,
      });
      this.elements.push(element);
      this.listContainer.append(element);
    }
  }
  /** 表示要素削除 */
  deleteElements () {
    for (let element of this.elements) {
      element.remove();
    }
    this.elements = [];
  }
}