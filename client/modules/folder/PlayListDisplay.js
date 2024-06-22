import PlayListClient from '../serverClient/PlayListClient.js';
import IconButton from '../component/button/IconButton.js';
import Popup from '../ui/Popup.js';

/**
 * @typedef {Object} PlayListDisplayOption
 * @property {function():void} onBack
 */

export default class PlayListDisplay {
  constructor (dom, option) {
    this.host = dom;
    this.option = Object.assign({
      onBack: () => { },
    }, option);
    this.view = $('<div>');
    this.view.addClass('playListDisplay');
    this.host.append(this.view);
    /** @type {DirectoryElementInfo} */
    this.playListInfo;
    this.currentPath;
  }
  /**
   * オプションを変更
   * @param {FileDisplayOption} option 
   */
  setOption (option) {
  }
  /** オプションを適用 */
  applyOption () {
  }
  /**
   * プレイリスト情報を開く
   * @param {String} playListPath 
   */
  async open (playListPath) {
    return new Promise ((res, rej) => {
      $.ajax({
        url: './playList/openPlayList',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ path: playListPath }),
      })
      .done((data) => {
        this.currentPath = playListPath;
        this.playListInfo = data;
        this.updateView();
        res();
      });
    });
  }
  updateView () {
    this.view.children().remove();

    let buttonSize = '30px';
    // 戻るボタン
    let backButton = new IconButton({ icon: 'returnArrow.png', size: buttonSize });
    backButton.dom.css({
      position: 'absolute',
      right: this.view.css('paddingRight'),
    });
    this.view.append(backButton.dom);
    backButton.dom.on('mouseup', () => { this.option.onBack(); })
    // プレイリスト名編集ボタン
    let editButton = new IconButton({ icon: 'quillPen.png', size: buttonSize });
    editButton.dom.css({
      position: 'absolute',
      right: `calc(${this.view.css('paddingRight')} + ${buttonSize} + 20px)`,
    });
    this.view.append(editButton.dom);
    editButton.dom.on('mouseup', () => { this.editPlayListName(this.playListInfo.name); });

    // プレイリスト名
    let name = $('<div>');
    name.addClass(['playListDisplayPlayListName']);
    name.text(this.playListInfo.name);
    this.view.append(name);
  }
  /** プレイリスト名編集 */
  editPlayListName (preName) {
    Popup.popupInput('プレイリスト名編集', ['変更', 'キャンセル'], (input, key, uncover) => {
      if (key === 'キャンセル' || !input) {
        uncover();
        return;
      }
      PlayListClient.renameElement(this.currentPath, input, () => {
        Popup.popupAlert('保存しました。', async (uncover) => {
          await this.open(this.currentPath + '/../' + input);
          uncover();
        });
      });
    }, { text: preName });
  }
}