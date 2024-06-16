import ViewPortMode from "./ViewPortMode.js";
import { FolderDisplay } from '../modules/folder/FolderDisplay.js';

export default class FolderMode extends ViewPortMode {
  constructor (dom) {
    super();
    this.viewPort = dom;
    this.folderDisplay = new FolderDisplay(this.viewPort, {
      onClick: (key) => {
        console.log(key)
      },
      onDoubleClick: (info) => {
        switch (info.type) {
          case 'directory':
            this.folderDisplay.open(this.folderDisplay.getCurrentPath() + '/' + info.physicsName);
            break;
          default:
            break;
        }
      },
      onDrop: (dragKey, dropKey) => {
        console.log(dragKey + '→' + dropKey);
      }
    });
    // ルートを開く
    this.folderDisplay.open('');
  }
  end () {
    this.viewPort.remove();
  }
}