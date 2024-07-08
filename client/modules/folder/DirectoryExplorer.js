import FolderClient from '../serverClient/FolderClient.js';
import DirectoryDisplay from './DirectoryDisplay.js';
import MusicPlayerButton from '../component/button/MusicPlayerButton.js';

import ct from '../../constTable.js';

const BACK_KEY = '/back';

/**
 * @typedef {Object} DirectoryExplorerOption オプション
 * @property {function(DirectoryDispElement):void} onSelectFile ファイル選択時
 * @property {Boolean} isValidatePlayButton trueの場合は音声再生機能ON
 */

export default class DirectoryExplorer {
  /**
   * @param {jQueryElement} dom 
   * @param {DirectoryExplorerOption} option 
   */
  constructor (dom, option) {
    this.host = dom;
    this.option = Object.assign({
      onSelectFile: (elem) => {},
      isValidatePlayButton: false,
    }, option);
    this.directoryDisplay = new DirectoryDisplay(dom, {
      createElement: null,
      onSelectFolder: (elem) => { this.open(this.getCurrentPath() + '/' + elem.key); },
      onSelectFile: (elem) => { this.option.onSelectFile(elem); },
      onSelectUi: (elem) => {
        if (elem.key === BACK_KEY) {
          this.open(this.getCurrentPath() + '/..');
        }
      },
      onIconClick: (elem, num) => {
        // 音声再生機能ON かつ クリック対象がファイル要素 の場合はイベント伝搬を止める
        return this.option.isValidatePlayButton && elem.type === DirectoryDisplay.directoryElementType.FILE;
      },
      folderClickThreshold: 1,
      fileClickThreshold: 1,
      uiClickThreshold: 1,
      onDrop: () => {},
      isDraggable: false,
      lineMargin: '10px',
    });
    /** @type {import('../../../scripts/type.d.ts').DirectoryInfo} */
    this.directoryInfo = null;
  }
  getCurrentPath () {
    return this.directoryInfo ? this.directoryInfo.current : '';
  }
  isRoot (path) {
    return ['', '\\', '/', '.'].includes(path);
  }
  /**
   * 指定したパスのフォルダを表示
   * @param {String} path 
   */
  async open (path) {
    FolderClient.readFolder(path, (data) => {
      this.directoryInfo = data;
      let dispInfo = this.createDirectoryDispInfo(this.directoryInfo);
      this.directoryDisplay.open(dispInfo);
    });
  }
  /**
   * ディレクトリ情報を表示用に整形
   * @param {DirectoryInfo} data 
   * @returns {import('./DirectoryDisplay.js').DirectoryDispInfo}
   */
  createDirectoryDispInfo (data) {
    let back = [];
    if (!this.isRoot(data.current)) {
      // 親ディレクトリへ移動ボタン
      back = [{
        type: DirectoryDisplay.directoryElementType.UI,
        key: BACK_KEY,
        name: '',
        icon: ct.path.icon + 'returnArrow.png',
        displayOption: { height: '20px' },
      }]
    }
    let folders = data.folders.map(info => ({
      type: DirectoryDisplay.directoryElementType.FOLDER,
      key: info.physicsName,
      name: info.name,
      icon: ct.path.icon + 'folder.png',
    }));

    // 音声再生ボタン生成クロージャ
    let createMusicPlayerButton = (key) => {
      return new MusicPlayerButton({
        size: { height : '90%' },
        style: { 'margin-right': '10px', filter: 'invert(100%)', 'aspect-ratio': '1' },
        musicKey: key,
        playList: () => { return this.createPlayListData(); },
      }).dom;
    };
    let files = data.files.map(info => ({
      type: DirectoryDisplay.directoryElementType.FILE,
      key: info.physicsName,
      name: info.name,
      icon: !this.option.isValidatePlayButton ? ct.path.icon + 'musicFile.png' : () => {
        return createMusicPlayerButton(this.getCurrentPath() + '/' + info.physicsName);
      },
    }));

    return {
      name: data.current,
      elements: [...back, ...folders, ...files],
    };
  }

  /**
   * 再生用のデータ生成
   * @returns {import('../../ListPlayer.js').PlayListData}
   */
  createPlayListData () {
    let list = this.directoryInfo.files.map((elem) => {
      return {
        key: this.getCurrentPath() + '/' + elem.physicsName,
        name: elem.name,
        path: ct.path.folderRootPath + '/' + this.getCurrentPath() + '/' + elem.physicsName,
      };
    });
    return {
      name: this.directoryInfo.current,
      key: ct.playlistType.FOLDER + this.getCurrentPath(),
      list: list,
    };
  }
}