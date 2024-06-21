import ViewPortMode from './ViewPortMode.js';
import PlayListFolderExplorer from '../modules/folder/PlayListFolderExplorer.js';
import PlayListDisplay from '../modules/folder/PlayListDisplay.js';

import Popup from '../modules/ui/Popup.js';

import ct from '../constTable.js';

export default class PlayListMode extends ViewPortMode {
  constructor (dom) {
    super(dom);
    this.viewPort = dom;
    this.playListFolderExplorer = null;
    this.playListDisplay = null;
    this.viewPort = super.createViewPort();
    // プレイリスト一覧を開く
    this.openListFolder('');
  }
  openListFolder (path) {
    if (!this.playListFolderExplorer) {
      this.resetPort();
      this.playListFolderExplorer = new PlayListFolderExplorer(this.viewPort, {
        onPlayListSelected: (elem) => { Popup.popupChoice('test', ['1', '2'], () => { console.log('ok'); }); },
        onDrop: (dragged, dropped) => {},
        isEditable: ct.global().getEditMode() === ct.editMode.EDITABLE,
      });
    }
    this.playListFolderExplorer.open(path);
  }
  openPlayList (listName) {

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