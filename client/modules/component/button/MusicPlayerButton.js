window.musicPlayerButtonCss = window.musicPlayerButtonCss || $('<link rel="stylesheet" href="./client/css/component/musicPlayerButton.css">').appendTo('head');
import ListPlayer from '../../../ListPlayer.js';
import ct from '../../../constTable.js';
import gd from '../../../globalData.js';

/**
 * @typedef {Object} MusicButtonOption
 * @property {String|Object} size '' or {width: '', height: ''}
 * @property {Object} style
 * @property {String} musicKey
 * @property {PlayListData|function():PlayListData} playList
 */

export default class MusicPlayerButton {
  /**
   * @param {MusicButtonOption} option 
   */
  constructor (option) {
    this.dom = $('<div>');
    this.dom.addClass('musicPlayerButton');
    this.option = Object.assign({
      size: '50px',
      style: {},
      musicKey: '',
      playList: [],
    }, option);

    this.dom.css(Object.assign({
      width: typeof this.option.size === 'string' ? this.option.size : this.option.size.width,
      height: typeof this.option.size === 'string' ? this.option.size : this.option.size.height,
    }, this.option.style));

    $(this.dom).on('click', () => { this.onClick(); });

    this.updateClass();

    gd.subject.addObserver({ dom: this.dom[0], receiver: (msg, prm) => { this.receiver(msg, prm); } });
  }
  /**
   * 自身に割り当てられたプレイリストデータを取得
   * @returns {import('../../../ListPlayer.js').PlayListData}
   */
  getPlayList () {
    return typeof this.option.playList === 'function' ? this.option.playList() : this.option.playList;
  }
  onClick () {
    if (this.isThisPlaying()) {
      gd.listPlayer.pause();
    }
    else {
      gd.listPlayer.setPlayList(this.getPlayList());
      gd.listPlayer.play(this.option.musicKey);
    }
  }
  /** サブジェクトからのメッセージ受信メソッド */
  receiver (msg, prm) {
    if (![gd.listPlayer.PLAY_MESSAGE, gd.listPlayer.PAUSE_MESSAGE].includes(msg)) { return; }
    this.updateClass();
  }
  /** ListPlayerを見て自身に割り当てられた音声が再生されていたらtrue */
  isThisPlaying () {
    if (gd.listPlayer.playingListKey !== this.getPlayList().key) { return false; }
    else if (gd.listPlayer.playingDataKey !== this.option.musicKey) { return false; }
    return true;
  }
  /** classを更新して画像を更新 */
  updateClass () {
    if (this.isThisPlaying()) {
      this.dom.removeClass('notPlayingMusicPlayerButton');
      this.dom.addClass('playingMusicPlayerButton');
    }
    else {
      this.dom.removeClass('playingMusicPlayerButton');
      this.dom.addClass('notPlayingMusicPlayerButton');
    }
  }
}