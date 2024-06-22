import Cover from './Cover.js';
import CommonButton from '../component/button/CommonButton.js';

export default class Popup {
  /**
   * 選択肢表示
   * @param {String} message 
   * @param {Array<String>} choice 
   * @param {function(String,function():void):void} callback (<選択したchoice>, <カバーを消す関数>) => { }
   */
  static popupChoice (message, choices, callback) {
    Cover.reset();
    let cover = Cover.getCoverDom();
    let popup = this.createPopup();
    popup.content.text(message);

    let onSelect = (text) => {
      Cover.uncover();
      callback(text, () => { Cover.uncoverCover(); });
    };
    for (let choice of choices) {
      let button = this.createButton(() => { onSelect(choice); });
      button.dom.text(choice);
      popup.footer.append(button.dom);
    }
    cover.append(popup.popup);
    Cover.cover();
  }
  /**
   * 入力欄付き選択肢表示
   * @param {String} message 
   * @param {Array<String>} choice 
   * @param {function(String,String,function():void):void} callback (<入力値>, <選択したchoice>, <カバーを消す関数>) => { }
   * @param {Object} { text: <String> }
   */
  static popupInput (message, choices, callback, option = {}) {
    Cover.reset();
    let cover = Cover.getCoverDom();
    let popup = this.createPopup();
    popup.header.text(message);
    let input = this.createInput();
    input.val(option.text ? option.text : '');
    input.css('fontSize', '20px');
    popup.content.append(input);

    let onSelect = (text) => {
      Cover.uncover();
      callback(input.val(), text, () => { Cover.uncoverCover(); });
    };
    for (let choice of choices) {
      let button = this.createButton(() => { onSelect(choice); });
      button.dom.text(choice);
      popup.footer.append(button.dom);
    }
    cover.append(popup.popup);
    Cover.cover();
  }
  /**
   * ポップアップDOM生成
   * @returns {Object}
   */
  static createPopup () {
    let popup = $('<div>');
    let header = $('<div>');
    let content = $('<div>');
    let footer = $('<div>');
    popup.append(header);
    popup.append(content);
    popup.append(footer);
    popup.addClass('popup');
    header.addClass('popupHeader');
    content.addClass('popupContent');
    footer.addClass('popupFooter');
    return { popup, header, content, footer };
  }
  /**
   * ボタン生成
   * @param {function():void} onClick 
   * @returns {CommomButton}
   */
  static createButton (onClick) {
    let button = new CommonButton({
      onClick: onClick,
      size: { width: '100%', height: '30px' },
    })
    button.dom.addClass('popupButton');
    return button;
  }
  /** 入力欄生成 */
  static createInput () {
    let input = $('<input>');
    input.addClass(['singleLineInput']);
    input.prop('type', 'text');
    input.prop('spellcheck', false);
    return input;
  }
}