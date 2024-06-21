const coverDom = $('#portCover');
const coverCoverDom = $('#coverCover');

export default class Cover {
  static getCoverDom () {
    return coverDom;
  }

  static reset (callback) {
    coverDom.children().remove();
    coverDom.css('display', 'none');
  }
  static cover (callback) {
    coverDom.css('display', 'flex');
    if (callback) { callback() };
  }
  /**
   * カバーを消す
   * @param {function():void} callback 
   * @param {Boolean} leaveCoverCover trueの場合はカバーのカバーを残す
   */
  static uncover (callback, leaveCoverCover) {
    this.coverCover();
    coverDom.css('display', 'none');
    this.reset();
    if (!leaveCoverCover) {
      this.uncoverCover();
    }
    if (callback) { callback() };
  }
  static coverCover () {
    coverCoverDom.css('display', '');
  }
  static uncoverCover () {
    coverCoverDom.css('display', 'none');
  }
}