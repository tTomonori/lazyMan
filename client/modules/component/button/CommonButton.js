window.buttonCss = window.buttonCss || $('<link rel="stylesheet" href="./client/css/component/button.css">').appendTo('head');

/**
 * @typedef {Object} CommonButtonOption
 * @property {function():void} onClick
 * @property {String|Object} size '' or {width: '', height: ''}
 * @property {Object} style
 */

export default class CommonButton {
  /**
   * @param {CommonButtonOption} option 
   */
  constructor (option) {
    this.dom = $('<div>');
    this.dom.addClass('commonButton');
    this.domChild = $('<div>');
    this.domChild.addClass('commonButtonChild');
    this.domChild.css({ width: '100%', height: '100%' });
    this.dom.append(this.domChild);
    this.option = Object.assign({
      onClick: () => {},
      size: '50px',
      style: {},
    }, option);

    this.dom.css(Object.assign({
      width: typeof this.option.size === 'string' ? this.option.size : this.option.size.width,
      height: typeof this.option.size === 'string' ? this.option.size : this.option.size.height,
    }, this.option.style));

    $(this.dom).on('click', this.option.onClick);
  }
}