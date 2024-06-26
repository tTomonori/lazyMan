import Subject from './Subject.js';

export default class ModeManager {
  /** @enum {String} ディレクトリ要素の種類 */
  static MODE = {
    EDITABLE: 'editable',
    READONLY: 'readonly',
  }
  /** @type {MODE} 現在のモード */
  static get mode () { return currentMode; }
  /** @type {String} モード変更イベントのメッセージ */
  static CHANGEMODE_MESSAGE = 'changeMode';
  /**
   * モードを設定
   * @param {MODE} mode 
   */
  static setMode (mode) {
    currentMode = mode;
    Subject.sendMessage(this.CHANGEMODE_MESSAGE, { mode: currentMode })
  }
}

let currentMode = ModeManager.MODE.READONLY;