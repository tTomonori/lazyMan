import Cover from './Cover.js';
import CommonButton from '../component/button/CommonButton.js';

export default class Popup {
  /**
   * 選択肢表示
   * @param {String} message 
   * @param {Array<String>} choice 
   * @param {function(String):void} callback 
   */
  static popupChoice (message, choices, callback) {
    let cover = Cover.getCoverDom();
    let popup = this.createPopup();
    popup.content.text(message);

    let onSelect = (text) => {
      callback(text);
      Cover.uncover();
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
    let content = $('<div>');
    let footer = $('<div>');
    popup.append(content);
    popup.append(footer);
    popup.addClass('popup');
    content.addClass('popupContent');
    footer.addClass('popupFooter');
    return { popup, content, footer };
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
}