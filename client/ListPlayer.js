/**
 * @typedef {Object} PlayData
 * @property {String} key ファイル名
 * @property {String} name 表示名
 * @property {String} path 音声ファイルへのパス
 */

export default class ListPlayer {
  static init() {
    /** @type {Array<PlayData>} */
    this.playListData;
    /** @type {jQueryElement} */
    this.audiojQ = $('<audio>');
    this.audiojQ.addClass('listPlayer');
    this.audiojQ.prop('controls', true);
    /** @type {HTMLAudioElement} */
    this.audioDom = this.audiojQ[0];

    /** @type {PlayData} 再生中のデータ */
    this.playingData;

    /** @type {HTMLElement} */
    this.playerControl = $('<div>');
    this.playerControl.addClass('listPlayerControls');
    this.playerControl.prepend(this.audiojQ);

    $(document.body).append(this.playerControl);

    this.audiojQ.on('ended', () => {
      ListPlayer.playNext();
    })

    this.playerControl.addClass('listPlayerControls_header');
  }
  /**
   * プレイリストをセット
   * @param {Array<PlayData>} listInfo 
   */
  static setPlayList (listInfo) {
    this.audioDom.pause();
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
        playData = this.playListData.find(data => data.key === key);
        break;
      case 'number':
        playData = this.playListData[key];
        break;
    }
    if (!playData) { return; }
    this.audiojQ.prop('src', playData.path);
    this.playingData = playData;
    this.audiojQ.prop('title', this.playingData.name);
    this.audioDom.play();

    setTimeout(() => {
      this.audiojQ.trigger('ended');
    }, 5000);
  }

  /** 次の曲再生 */
  static playNext () {
    let currentIndex = this.playListData.findIndex(data => data.path === this.playingData.path);
    if (currentIndex < 0) { return; }
    let nextIndex = (currentIndex + playListData.length + 1) % this.playListData.length;
    this.play(nextIndex);
  }
}


if (!window.listPlayerInitialized) {
  window.listPlayerInitialized = true;
  $('<link rel="stylesheet" href="./client/css/listPlayer.css">').appendTo('head');
  ListPlayer.init();
}