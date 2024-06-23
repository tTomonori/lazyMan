/**
 * @typedef {Object} FrontMostViewOption
 * @property {Object} coverStyle
 * @property {Object} boardStyle
 * @property {Object} viewStyle
 */

export default class FrontMostView {
  /**
   * @param {jQueryElement} backDom 
   * @param {FrontMostView} option 
   */
  constructor (backDom, option) {
    if (!['relative', 'absolute', 'fixed', 'sticky'].includes(backDom.css('position'))) {
      throw 'FrontMostView: 指定された要素のpositionが許可された値ではありません。';
    }
    this.cover = $('<div>');
    this.cover.addClass('frontMostCover');
    this.cover.css(option.coverStyle || {});

    this.board = $('<div>');
    this.board.addClass('frontMostBoard');
    this.board.css(option.boardStyle || {});
    this.cover.append(this.board);

    this.view = $('<div>');
    this.view.addClass('frontMostView');
    this.view.css(option.viewStyle || {});
    this.board.append(this.view);

    backDom.append(this.cover);
  }
  close () {
    this.cover.remove();
  }
}