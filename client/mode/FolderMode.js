import ViewPortMode from './ViewPortMode.js';
import DirectoryDisplay from '../modules/folder/DirectoryDisplay.js';
import FileDisplay from '../modules/folder/FileDisplay.js';

import ct from '../constTable.js';

export default class FolderMode extends ViewPortMode {
  constructor (dom) {
    super(dom);
    this.currentPath = '';
    /** @type {DirectoryDisplay} */
    this.directoryDisplay = null;
    /** @type {FileDisplay} */
    this.fileDisplay = null;
    this.viewPort = super.createViewPort();
    // ルートフォルダを開く
    this.openFolder('');
  }
  /**
   * フォルダ情報を開く
   * @param {String} path 
   */
  openFolder (path) {
    if (!this.directoryDisplay) {
      this.resetPort();
      this.directoryDisplay = new DirectoryDisplay(this.viewPort, {
        onSelectFile: (info) => {
          this.openFile(info.key);
        },
      });
    }
    this.currentPath = path;
    this.directoryDisplay.open(path);
  }
  /**
   * ファイル情報を開く
   * @param {String} fileName 
   */
  openFile (fileName) {
    if (!this.fileDisplay) {
      this.resetPort();
      this.fileDisplay = new FileDisplay(this.viewPort, {
        onRegist: () => {
          let info = this.fileDisplay.getEditedFilInfo();
          this.saveFileInfo(info);
        },
        onBack: () => {
          this.openFolder(this.currentPath);
        },
        isEditable: ct.global().getEditMode() === ct.editMode.EDITABLE,
      });
    }
    this.fileDisplay.open(fileName);
  }
  resetPort () {
    this.viewPort.remove();
    this.directoryDisplay = null;
    this.fileDisplay = null;
    this.viewPort = super.createViewPort();
  }
  setEditMode (editMode) {
    if (this.fileDisplay) {
      this.fileDisplay.setOption({
        isEditable: editMode === ct.editMode.EDITABLE,
      });
    }
  }
  /**
   * ファイル情報を保存
   * @param {import('../../scripts/type.js').FileInfo} info 
   */
  async saveFileInfo (info) {
    $.ajax({
      url: './saveFile',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ info: info }),
    })
    .done((data) => {
      
    });
  }
  end () {
    this.viewPort.remove();
  }
}