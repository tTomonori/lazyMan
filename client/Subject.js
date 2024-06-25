/**
 * @typedef {Object} Observer
 * @property {String} key 識別子
 * @property {function(String,Object)} receiver メッセージ受信関数
 * @property {Node=} dom この要素がdocument内に存在しない場合は、このオブザーバーは削除される
 */

/** @type {Object<String,Observer>} */
let observers = {};

export default class Subject {
  /**
   * オブザーバー追加
   * @param {Observer} observer 
   */
  static addObserver (observer) {
    observers[observer.key] = observer;
  }
  /**
   * オブザーバー削除
   * @param {String} key 
   */
  static removeObserver (key) {
    delete observers[key];
  }
  /**
   * メッセージ送信
   * @param {String} message 
   * @param {Object} param 
   */
  static sendMessage (message, param) {
    for (let [key ,observer] of observers) {
      if (observer.dom && !document.contains(observer.dom)) {
        delete observers[key];
        continue;
      }
      observer.receiver(message, param);
    }
  }
}