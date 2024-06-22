import CommonButton from './CommonButton.js';
import ct from '../../../constTable.js';

/**
 * @typedef {Object} IconButtonOption
 * @property {String} icon 画像ファイル名
 * @extends {import('./CommonButton.js').CommonButtonOption}
 */

export default class IconButton extends CommonButton {
  /**
   * @param {IconButtonOption} option 
   */
  constructor (option) {
    let thisOption = Object.assign({
      icon: '',
    }, option);
    super(thisOption);
    this.dom.addClass('iconButton');

    this.dom.css('background-image', `url(${ct.path.icon}${this.option.icon}`);
    this.dom.css('background-size', 'contain');
    this.dom.css('background-repeat', 'no-repeat');
  }
  /** 禁止マーク表示中ならtrue */
  isProhibition () {
    return !!this.prohibitionDom;
  }
  /**
   * 禁止マーク表示切替
   * @param {Boolean} disp true→表示, false→非表示, null→表示/非表示を逆にする
   */
  setProhibitonImage (disp = null) {
    if (disp === null) {
      disp = !this.isProhibition();
    }
    disp ? this.addProhibitionImage() : this.removeProhibitionImage();
  }
  /** 禁止マーク表示 */
  addProhibitionImage () {
    if (!this.prohibitionDom) {
      this.prohibitionDom = this.createChildDom();
      this.prohibitionDom.addClass('iconButtonsProhibition');
    }
  }
  /** 禁止マーク非表示 */
  removeProhibitionImage () {
    if (!this.prohibitionDom) { return; }
    this.prohibitionDom.remove();
    this.prohibitionDom = null;
  }
  /**
   * 無効化された見た目の有効化/無効化
   * @param {Boolean} isDisabled 
   */
  setDisabled (isDisabled) {
    if (isDisabled) { this.dom.addClass('iconButtonDisabled'); }
    else { this.dom.removeClass('iconButtonDisabled'); }
  }
  /** 子要素生成 */
  createChildDom () {
    let dom = $('<div>');
    this.dom.append(dom);
    return dom;
  }
}