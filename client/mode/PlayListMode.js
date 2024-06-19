import ViewPortMode from './ViewPortMode.js';
import PlayListFolderDisplay from '../modules/folder/PlayListFolderDisplay.js';
import PlayListDisplay from '../modules/folder/PlayListDisplay.js';

import Popup from '../modules/ui/Popup.js';

import ct from '../constTable.js';

export default class PlayListMode extends ViewPortMode {
  constructor (dom) {
    super(dom);
    this.viewPort = dom;
    this.playListFolderDisplay = null;
    this.playListDisplay = null;
    this.viewPort = super.createViewPort();
    // プレイリスト一覧を開く
    this.openListFolder('');
  }
  openListFolder (path) {
    if (!this.playListFolderDisplay) {
      this.resetPort();
      this.playListFolderDisplay = new PlayListFolderDisplay(this.viewPort, {
        onPlayListSelected: (elem) => { Popup.popupChoice('test', ['1', '2'], () => { console.log('ok'); }); },
        onDrop: (dragged, dropped) => {},
        isEditable: ct.global().getEditMode() === ct.editMode.EDITABLE,
      });
    }
    this.playListFolderDisplay.open(path);
  }
  openPlayList (listName) {

  }
  resetPort () {
    this.viewPort.remove();
    this.playListFolderDisplay = null;
    this.playListDisplay = null;
    this.viewPort = super.createViewPort();
  }
  setEditMode (editMode) {
    if (this.playListFolderDisplay) {
      this.playListFolderDisplay.setEditMode(editMode);
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