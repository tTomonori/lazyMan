import ListPlayer from './ListPlayer.js';

export default class globalData {
  /** @type {ListPlayer} */
  static get listPlayer () { return window.listPlayer; }
}

if (!window.globalDataInitialized) {
  window.globalDataInitialized = true;
  window.listPlayer = ListPlayer;
}