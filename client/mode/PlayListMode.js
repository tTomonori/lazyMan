import ViewPortMode from './ViewPortMode.js';
import PlayListFolderExplorer from '../modules/folder/PlayListFolderExplorer.js';
import PlayListDisplay from '../modules/folder/PlayListDisplay.js';

import Popup from '../modules/ui/Popup.js';

import ct from '../constTable.js';

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
    if (!this.playListFolderExplorer) {
      this.resetPort();
      this.playListFolderExplorer = new PlayListFolderExplorer(this.viewPort, {
        onPlayListSelected: (listPath) => {
          this.currentPath = this.playListFolderExplorer.getCurrentPath();
          this.openPlayList(listPath);
        },
        isEditable: ct.global().getEditMode() === ct.editMode.EDITABLE,
      });
    }
    this.currentPath = path;
    this.playListFolderExplorer.open(path);
  }
  openPlayList (listPath) {
    if (!this.playListDisplay) {
      this.resetPort();
      this.playListDisplay = new PlayListDisplay(this.viewPort, {
        onBack: () => {
          this.openListFolder(this.currentPath);
        },
        isEditable: ct.global().getEditMode() === ct.editMode.EDITABLE,
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
  setEditMode (editMode) {
    if (this.playListFolderExplorer) {
      this.playListFolderExplorer.setEditMode(editMode);
    }
    else if (this.playListDisplay) {
      this.playListDisplay.setOption({
        isEditable: editMode === ct.editMode.EDITABLE,
      });
    }
  }
  end () {
    this.viewPort.remove();
  }
}