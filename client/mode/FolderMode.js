import ViewPortMode from './ViewPortMode.js';
import FolderDisplay from '../modules/folder/FolderDisplay.js';
import FileDisplay from '../modules/folder/FileDisplay.js';

import ct from '../constTable.js';

export default class FolderMode extends ViewPortMode {
  constructor (dom) {
    super(dom);
    this.currentPath = '';
    this.folderDisplay = null;
    this.fileDisplay = null;
    this.viewPort = super.createViewPort();
    // ルートフォルダを開く
    this.openFolder('');
  }
  openFolder (path) {
    if (!this.folderDisplay) {
      this.resetPort();
      this.folderDisplay = new FolderDisplay(this.viewPort, {
        onClick: (key) => {
          console.log(key)
        },
        onDoubleClick: (info) => {
          switch (info.type) {
            case 'directory':
              this.currentPath = this.folderDisplay.getCurrentPath() + '/' + info.physicsName;
              this.openFolder(this.currentPath);
              break;
            default:
              this.openFile(info.physicsName);
              break;
          }
        },
        onDrop: (dragKey, dropKey) => {
          console.log(dragKey + '→' + dropKey);
        }
      });
    }
    this.currentPath = path;
    this.folderDisplay.open(path);
  }
  openFile (fileName) {
    if (!this.fileDisplay) {
      this.resetPort();
      this.fileDisplay = new FileDisplay(this.viewPort, {
        onRegist: () => {

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
    this.folderDisplay = null;
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
  end () {
    this.viewPort.remove();
  }
}