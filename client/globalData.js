import ListPlayer from './ListPlayer.js';
import Subject from './Subject.js';

export default class globalData {
  /** @type {ListPlayer} */
  static get listPlayer () { return window.listPlayer; }
  /** @type {Subject} */
  static get subject () { return window.subject; }
}

if (!window.globalDataInitialized) {
  window.globalDataInitialized = true;
  window.listPlayer = ListPlayer;
  window.subject = Subject;
}