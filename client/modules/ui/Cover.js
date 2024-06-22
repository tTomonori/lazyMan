const coverDom = $('#portCover');
const coverCoverDom = $('#coverCover');

export default class Cover {
  static getCoverDom () {
    return coverDom;
  }

  static reset (callback) {
    coverDom.children().remove();
    coverDom.css('display', 'none');
    coverCoverDom.css('display', 'none');
  }
  static cover (callback) {
    coverDom.css('display', 'flex');
    if (callback) { callback() };
  }
  /**
   * カバーを消す
   * @param {function():void} callback 
   * @param {Boolean} removeCoverCover trueの場合はカバーのカバーも消す
   */
  static uncover (callback, removeCoverCover) {
    this.reset();
    this.coverCover();
    if (removeCoverCover) {
      this.uncoverCover();
    }
    if (callback) { callback() };
  }
  static coverCover () {
    coverCoverDom.css('display', 'block');
  }
  static uncoverCover () {
    coverCoverDom.css('display', 'none');
  }
}