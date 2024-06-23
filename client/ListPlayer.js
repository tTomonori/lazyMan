/**
 * @typedef {Object} PlayData
 * @property {String} key ファイル名
 * @property {String} name 表示名
 * @property {String} path 音声ファイルへのパス
 */

/** @type {Array<PlayData>} */
let playListData;
/** @type {jQueryElement} */
let audiojQ = $('<audio>');
/** @type {HTMLAudioElement} */
let audioDom = audiojQ[0];

/** @type {PlayData} 再生中のデータ */
let playingData;

$(document.body).append(audiojQ);

audiojQ.on('ended', () => {
  ListPlayer.playNext();
})

export default class ListPlayer {
  /**
   * プレイリストをセット
   * @param {Array<PlayData>} listInfo 
   */
  static setPlayList (listInfo) {
    audioDom.pause();
    playListData = listInfo;
  }

  /**
   * 再生する(セットしたプレイリストに存在する前提)
   * @param {String|Number} key 再生するPlayDataのkey | 再生するデータのインデックス
   */
  static play (key) {
    let playData;
    switch (typeof key) {
      case 'string':
        playData = playListData.find(data => data.key === key);
        break;
      case 'number':
        playData = playListData[key];
        break;
    }
    if (!playData) { return; }
    audiojQ.prop('src', playData.path);
    playingData = playData;
    audioDom.play();

    setTimeout(() => {
      audiojQ.trigger('ended');
    }, 5000);
  }

  /** 次の曲再生 */
  static playNext () {
    let currentIndex = playListData.findIndex(data => data.path === playingData.path);
    if (currentIndex < 0) { return; }
    let nextIndex = (currentIndex + playListData.length + 1) % playListData.length;
    this.play(nextIndex);
  }
}