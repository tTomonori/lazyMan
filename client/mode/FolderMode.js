import ViewPortMode from './ViewPortMode.js';
import DirectoryExplorer from '../modules/folder/DirectoryExplorer.js';
import FileDisplay from '../modules/folder/FileDisplay.js';

import ct from '../constTable.js';
import gd from '../globalData.js';

export default class FolderMode extends ViewPortMode {
  constructor (dom) {
    super(dom);
    this.currentPath = '';
    /** @type {DirectoryExplorer} */
    this.directoryExplorer = null;
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
    gd.subject.filterObservers();
    if (!this.directoryExplorer) {
      this.resetPort();
      this.directoryExplorer = new DirectoryExplorer(this.viewPort, {
        onSelectFile: (info) => {
          this.currentPath = this.directoryExplorer.getCurrentPath();
          this.openFile(info.key);
        },
      });
    }
    this.currentPath = path;
    this.directoryExplorer.open(path);
  }
  /**
   * ファイル情報を開く
   * @param {String} fileName 
   */
  openFile (fileName) {
    gd.subject.filterObservers();
    if (!this.fileDisplay) {
      this.resetPort();
      this.fileDisplay = new FileDisplay(this.viewPort, {
        onBack: () => {
          this.openFolder(this.currentPath);
        },
        isEditable: true,
      });
    }
    this.fileDisplay.open(fileName);
  }
  resetPort () {
    this.viewPort.remove();
    this.directoryExplorer = null;
    this.fileDisplay = null;
    this.viewPort = super.createViewPort();
  }
  end () {
    this.viewPort.remove();
  }
}