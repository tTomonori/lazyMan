window.buttonCss = window.buttonCss || $('<link rel="stylesheet" href="./client/css/component/button.css">').appendTo('head');

export default class CommonButton {
  constructor (option) {
    this.dom = $('<div>');
    this.dom.addClass('commonButton');
    this.option = Object.assign({
      onClick: () => {},
      size: '50px',
      style: {},
    }, option);

    this.dom.css(Object.assign({
      width: typeof this.option.size === 'string' ? this.option.size : this.option.size.width,
      height: typeof this.option.size === 'string' ? this.option.size : this.option.size.height,
      display: 'inline-block',
    }, this.style));

    $(this.dom).on('click', this.option.onClick);
  }
}