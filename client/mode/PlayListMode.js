import ViewPortMode from './ViewPortMode.js';
import PlayListFolderExplorer from '../modules/folder/PlayListFolderExplorer.js';
import PlayListDisplay from '../modules/folder/PlayListDisplay.js';

import ct from '../constTable.js';
import gd from '../globalData.js';

export default class PlayListMode extends ViewPortMode {
  constructor (dom) {
    super(dom);
    this.viewPort = dom;
    this.currentPath = '';
    /** @type {PlayListFolderExplorer} */
    this.playListFolderExplorer = null;
    /** @type {PlayListDisplay} */
    this.playListDisplay = null;
    this.viewPort = super.createViewPort();
    // プレイリスト一覧を開く
    this.openListFolder('');
  }
  openListFolder (path) {
    gd.subject.filterObservers();
    if (!this.playListFolderExplorer) {
      this.resetPort();
      this.playListFolderExplorer = new PlayListFolderExplorer(this.viewPort, {
        onPlayListSelected: (listPath) => {
          this.currentPath = this.playListFolderExplorer.getCurrentPath();
          this.openPlayList(listPath);
        },
        isEditable: true,
      });
    }
    this.currentPath = path;
    this.playListFolderExplorer.open(path);
  }
  openPlayList (listPath) {
    gd.subject.filterObservers();
    if (!this.playListDisplay) {
      this.resetPort();
      this.playListDisplay = new PlayListDisplay(this.viewPort, {
        onBack: () => {
          this.openListFolder(this.currentPath);
        },
        isEditable: true,
      });
    }
    this.playListDisplay.open(listPath);
  }
  resetPort () {
    this.viewPort.remove();
    this.playListFolderExplorer = null;
    this.playListDisplay = null;
    this.viewPort = super.createViewPort();
  }
  end () {
    this.viewPort.remove();
  }
}