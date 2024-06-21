import IconButton from '../component/button/IconButton.js';

/**
 * @typedef {Object} FileDisplayOption
 * @property {function():void} onRegist
 * @property {function():void} onBack
 * @property {Boolean} isEditable
 */

export default class FileDisplay {
  /**
   * @param {jQueryElement} dom 
   * @param {FileDisplayOption} option 
   */
  constructor (dom, option) {
    this.host = dom;
    /** @type {FileDisplayOption} */
    this.option = Object.assign({
      onRegist: () => {},
      onBack: () => {},
      isEditable: true,
    }, option);
    /** @type {MusicFileInfo} */
    this.fileInfo = {};
    this.host.addClass('FileDisplay');
    this.saveButton;
    this.nameArea;
    this.lyricsArea;
    this.lyricsSizeArea;
    this.inputArea = [];
  }
  /**
   * オプションを変更
   * @param {FileDisplayOption} option 
   */
  setOption (option) {
    Object.assign(this.option, option);
    this.applyOption();
  }
  /** オプションを適用 */
  applyOption () {
    this.inputArea.forEach((inputArea) => {
      inputArea.prop('readonly', !this.option.isEditable);
    });
    this.saveButton.setDisabled(!this.option.isEditable);
  }
  /**
   * ファイル情報を開く
   * @param {String} fileName 
   */
  open (fileName) {
    $.ajax({
      url: './folder/openFile',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ name: fileName }),
    })
    .done((data) => {
      this.fileInfo = data;
      this.updateView();
    });
  }
  updateView () {
    this.host.children().remove();

    let buttonSize = '30px';
    // 戻るボタン
    let backButton = new IconButton({ icon: 'returnArrow.png', size: buttonSize });
    backButton.dom.css({
      position: 'absolute',
      right: this.host.css('paddingRight'),
    });
    this.host.append(backButton.dom);
    backButton.dom.on('mouseup', () => { this.option.onBack(); })
    // 保存ボタン
    let saveButton = new IconButton({ icon: 'save.png', size: buttonSize });
    saveButton.dom.css({
      position: 'absolute',
      right: `calc(${this.host.css('paddingRight')} + ${buttonSize} + 20px)`,
    });
    this.host.append(saveButton.dom);
    saveButton.dom.on('mouseup', () => { this.option.onRegist(); })

    let labelWidth = '60px';
    let miniInputWidth = '32px';
    // 物理名ラベル
    let physicsLabel = $('<div>');
    physicsLabel.addClass(['FileDisplayLabel']);
    physicsLabel.css({ width: labelWidth });
    physicsLabel.text('物理名');
    this.host.append(physicsLabel);
    // 物理名
    let physicsArea = $('<div>');
    physicsArea.addClass(['FileDisplayLabel']);
    physicsArea.text(this.fileInfo.physicsName);
    this.host.append(physicsArea);
    // 表示名ラベル
    let nameLabel = $('<div>');
    nameLabel.addClass(['FileDisplayLabel']);
    nameLabel.css({ width: labelWidth });
    nameLabel.text('表示名');
    this.host.append(nameLabel);
    // 表示名
    let nameArea = $('<input>');
    nameArea.addClass(['singleLineInput', 'FileDisplayInput']);
    nameArea.prop('type', 'text');
    nameArea.prop('spellcheck', false);
    nameArea.val(this.fileInfo.name);
    this.host.append(nameArea);
    this.inputArea.push(nameArea);
    // 歌詞ラベル
    let lyricsLabel = $('<div>');
    lyricsLabel.addClass(['FileDisplayLabel']);
    lyricsLabel.css({ width: `calc(${labelWidth} + ${miniInputWidth})` });
    lyricsLabel.text('歌詞');
    this.host.append(lyricsLabel);
    // 歌詞
    let lyricsArea = $('<textarea>');
    lyricsArea.addClass(['multiLineTextarea']);
    lyricsArea.prop('spellcheck', false);
    this.host.append(lyricsArea);
    let relativeTop = lyricsArea.position().top - parseInt(this.host.css('paddingTop'));
    lyricsArea.css({ width: '100%', height: `calc(100% - ${relativeTop}px)` });
    lyricsArea.text(this.fileInfo.data.lyrics);
    this.inputArea.push(lyricsArea);
    // 歌詞フォントサイズ
    let lyricsSizeArea = $('<input>');
    lyricsSizeArea.addClass(['singleLineInput', 'FileDisplayMiniInput']);
    lyricsSizeArea.css({ width: miniInputWidth, textAlign: 'right', marginLeft: '10px' });
    lyricsSizeArea.prop('type', 'number');
    lyricsSizeArea.prop('spellcheck', false);
    lyricsSizeArea.prop('placeholder', 'XXX');
    lyricsSizeArea.prop('max', 999);
    lyricsSizeArea.prop('min', 0);
    lyricsSizeArea.val(this.fileInfo.data.lyricsSize);
    lyricsLabel.append(lyricsSizeArea);
    lyricsLabel.append('<span style="font-size: 10px">px</span>');
    this.inputArea.push(lyricsSizeArea);
    lyricsSizeArea.on('blur', () => {
      let size = lyricsSizeArea.val();
      lyricsArea.css({ fontSize: size ? size + 'px' : '' });
    });

    this.saveButton = saveButton;
    this.nameArea = nameArea;
    this.lyricsArea = lyricsArea;
    this.lyricsSizeArea = lyricsSizeArea;
    lyricsSizeArea.trigger('blur');
    this.applyOption();
  }
  /**
   * 編集中のファイル情報を取得
   * @returns {MusicFileInfo}
   */
  getEditedFilInfo () {
    return {
      type: this.fileInfo.type,
      name: this.nameArea.val(),
      physicsName: this.fileInfo.physicsName,
      data: {
        lyrics: this.lyricsArea.val(),
        lyricsSize: this.lyricsSizeArea.val(),
      },
    };
  }
}