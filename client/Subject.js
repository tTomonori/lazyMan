/**
 * @typedef {Object} Observer
 * @property {String=} key 識別子
 * @property {function(String,Object)} receiver メッセージ受信関数
 * @property {Node=} dom この要素がdocument内に存在しない場合は、このオブザーバは削除される
 */

/** @type {Array<Observer>} keyを持たないオブザーバの登録先(domが必須) */
let observerList = [];
/** @type {Object<String,Observer>} keyを持つオブザーバの登録先 */
let observerObj = {};

export default class Subject {
  /**
   * オブザーバ追加
   * @param {Observer} observer 
   */
  static addObserver (observer) {
    if (observer.key) {
      observerObj[observer.key] = observer;
      return
    }
    if (!observer.dom) {
      console.log(observer);
      throw 'Observer: 識別情報を持たないオブザーバは登録できません。';
    }
    observerList.push(observer);
  }
  /**
   * オブザーバ削除
   * @param {String} key 
   */
  static removeObserver (key) {
    delete observerObj[key];
  }
  /**
   * メッセージ送信
   * @param {String} message 
   * @param {Object} param 
   */
  static sendMessage (message, param) {
    this.filterObservers();
    observerList.forEach(observer => observer.receiver(message, param));
    Object.values(observerObj).forEach(observer => observer.receiver(message, param));
  }
  /**
   * 自動削除の対象かチェック
   * @param {Observer} observer 
   * @returns {Boolean} 自動削除対象ならtrue
   */
  static isDeleted (observer) {
    return observer.dom && !document.contains(observer.dom);
  }
  /** 自動削除対象のオブザーバをすべて削除 */
  static filterObservers () {
    observerList = observerList.filter(observer => !this.isDeleted(observer));
    for (let [key, value] of Object.entries(observerObj)) {
      if (!this.isDeleted(value)) { return; }
      this.removeObserver(key);
    }
  }
}