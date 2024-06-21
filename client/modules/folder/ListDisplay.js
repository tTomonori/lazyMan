const ELEMENT_CLASSNAME = 'ListDisplayElement';
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
    this.host.addClass('first');
    $(this.host).on('mouseup', `.${ELEMENT_CLASSNAME}`, (e) => {
      let key = $(e.currentTarget).data(ELEMENTKEY_DATANAME);
      this.option.onClick(key);
    });
    $(this.host).on('dblclick', `.${ELEMENT_CLASSNAME}`, (e) => {
      let key = $(e.currentTarget).data(ELEMENTKEY_DATANAME);
      this.option.onDoubleClick(key);
    });
    let dragElement;
    $(this.host).on('dragstart', `.${ELEMENT_CLASSNAME}`, (e) => {
      dragElement = e.currentTarget;
    });
    $(this.host).on('dragend', `.${ELEMENT_CLASSNAME}`, (e) => {
      let x = e.clientX;
      let y = e.clientY;
      let belowElems = document.elementsFromPoint(x, y);
      let dropElement = belowElems.find((elem) => {
        return $(elem).hasClass(ELEMENT_CLASSNAME);
      });
      if (dragElement && dropElement) {
        let dragKey = $(dragElement).data(ELEMENTKEY_DATANAME);
        let dropKey = $(dropElement).data(ELEMENTKEY_DATANAME);
        this.option.onDrop(dragKey, dropKey);
      }
      dragElement = null;
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