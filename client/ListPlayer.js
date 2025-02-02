import gd from './globalData.js';

/**
 * @typedef {Object} PlayListData
 * @property {String} name プレイリスト名
 * @property {String} key 識別子
 * @property {Array<PlayData>} list
 */

/**
 * @typedef {Object} PlayData
 * @property {String} key ファイル名
 * @property {String} name 表示名
 * @property {String} path 音声ファイルへのパス
 */

export default class ListPlayer {
  /** @type {String} 再生中のプレイリストのkey */
  static get playingListKey () { return this.playListData?.key; }
  /** @type {String} 再生中の音声のkey */
  static get playingDataKey () { return this.playingData?.key; }
  /** @type {String} 再生開始イベントのメッセージ名 */
  static PLAY_MESSAGE = 'playListPlayer';
  /** @type {String} 停止イベントのメッセージ名 */
  static PAUSE_MESSAGE = 'pauseListPlayer';
  static init() {
    /** @type {PlayListData} */
    this.playListData;
    /** @type {jQueryElement} */
    this.audiojQ = $('<audio>');
    this.audiojQ.addClass('listPlayer');
    this.audiojQ.prop('controls', true);
    /** @type {HTMLAudioElement} */
    this.audioDom = this.audiojQ[0];

    /** @type {PlayData} 再生中のデータ */
    this.playingData;
    /** @type {PlayData} audioタグが持っている音声データの情報 */
    this.audioData;

    /** @type {HTMLElement} */
    this.playerControl = $('<div>');
    this.playerControl.addClass('listPlayerControls');
    this.playerControl.prepend(this.audiojQ);

    $(document.body).append(this.playerControl);

    this.audioDom.addEventListener('ended', () => {
      // 再生されていることが確認できるまで再生処理を実行し続ける
      // (スマホでバックグラウンド再生していると、1回実行しただけでは再生されない場合がある)
      let interval = setInterval(() => {
        if (this.audioDom.paused  === false) {
          clearInterval(interval);
          return;
        }
        this.audioDom.play();
      }, 500);
      
      ListPlayer.playNext();
    })

    this.playerControl.addClass('listPlayerControls_header');

    this.audiojQ.on('loadeddata', () => { this.audioDom.play(); });
    this.audiojQ.on('play', () => {
      if (this.playingData) { return; }
      this.playingData = this.audioData;
      gd.subject.sendMessage(this.PLAY_MESSAGE, { playlist: this.playListData, data: this.playingData });
    });
    this.audiojQ.on('pause', () => {
      if (!this.playingData) { return; }
      this.playingData = null;
      gd.subject.sendMessage(this.PAUSE_MESSAGE, { playlist: this.playListData, data: this.audioData });
    });
  }
  /**
   * プレイリストをセット
   * @param {PlayListData} listInfo 
   */
  static setPlayList (listInfo) {
    this.audioDom.pause();
    this.playingData = null;
    this.playListData = listInfo;
  }

  /**
   * 再生する(セットしたプレイリストに存在する前提)
   * @param {String|Number} key 再生するPlayDataのkey | 再生するデータのインデックス
   */
  static play (key) {
    let playData;
    switch (typeof key) {
      case 'string':
        playData = this.playListData.list.find(data => data.key === key);
        break;
      case 'number':
        playData = this.playListData.list[key];
        break;
    }
    if (!playData) { return; }
    this.audiojQ.prop('src', playData.path);
    this.playingData = playData;
    this.audioData = playData;
    this.audiojQ.prop('title', this.playingData.name);
    this.audioDom.play(); // loadeddataイベントでも再生しているが、スマホで再生するにはここでのplay()呼び出しも必要

    gd.subject.sendMessage(this.PLAY_MESSAGE, { playlist: this.playListData, data: playData });
  }

  /** 次の曲再生 */
  static playNext () {
    let currentIndex = this.playListData.list.findIndex(data => data.path === this.audioData.path);
    if (currentIndex < 0) { return; }
    let nextIndex = (currentIndex + this.playListData.list.length + 1) % this.playListData.list.length;
    this.play(nextIndex);
  }

  /** 停止 */
  static pause () {
    this.audioDom.pause();
    this.playingData = null;
    gd.subject.sendMessage(this.PAUSE_MESSAGE, { playlist: this.playListData, data: this.audioData });
  }
}


if (!window.listPlayerInitialized) {
  window.listPlayerInitialized = true;
  $('<link rel="stylesheet" href="./client/css/listPlayer.css">').appendTo('head');
  ListPlayer.init();
}