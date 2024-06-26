import ListPlayer from './ListPlayer.js';
import Subject from './Subject.js';
import ModeManager from './ModeManager.js';

export default class globalData {
  /** @type {typeof ListPlayer} */
  static get listPlayer () { return window.listPlayer; }
  /** @type {typeof Subject} */
  static get subject () { return window.subject; }
  /** @type {typeof ModeManager} */
  static get modeManager () { return window.modeManager; }
}

if (!window.globalDataInitialized) {
  window.globalDataInitialized = true;
  window.listPlayer = ListPlayer;
  window.subject = Subject;
  window.modeManager = ModeManager;
}