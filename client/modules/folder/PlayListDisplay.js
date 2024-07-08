import PlayListClient from '../serverClient/PlayListClient.js';
import DirectoryDisplay from './DirectoryDisplay.js';
import DirectoryExplorer from './DirectoryExplorer.js';
import FileDisplay from './FileDisplay.js';
import IconButton from '../component/button/IconButton.js';
import Popup from '../ui/Popup.js';
import FrontMostView from '../ui/FrontMostView.js';
import ct from '../../constTable.js';
import gd from '../../globalData.js';
import Cover from '../ui/Cover.js';
import MusicPlayerButton from '../component/button/MusicPlayerButton.js';

const NEW_KEY = '/new';

const PLAY_BUTTON_SIZE = '90%';
const LIST_ELEMENT_HEIGHT = '30px';
const LIST_MARGIN = '5px';
const NEW_BUTTON_HEIGHT = '20px';

/**
 * @typedef {Object} PlayListDisplayOption
 * @property {function():void} onBack
 * @property {Boolean} isEditable
 */

export default class PlayListDisplay {
  /**
   * @param {jQueryElement} dom 
   * @param {PlayListDisplayOption} option 
   */
  constructor (dom, option) {
    this.host = dom;
    this.option = Object.assign({
      onBack: () => { },
    }, option);
    this.view = $('<div>');
    this.view.addClass('playListDisplay');
    this.host.append(this.view);
    /** @type {PlayListInfo} */
    this.playListInfo;
    /** @type {DirectoryDisplay} */
    this.directoryDisplay;
    /** @type {FrontMostView} */
    this.frontMostView;
    /** @type {DirectoryExplorer} */
    this.directoryExplorer;
    /** @type {FileDisplay} */
    this.fileDisplay;
    this.playListDom;
    this.currentPath;
    this.listDom;
    // オブザーバ追加
    gd.subject.addObserver({ dom: this.host[0], receiver: (msg, prm) => {
      if (msg !== gd.modeManager.CHANGEMODE_MESSAGE) { return; }
      this.setEditMode();
    }});  }
  isEditable () {
    if (!this.option.isEditable) { return false; }
    return gd.modeManager.mode === gd.modeManager.MODE.EDITABLE;
  }
  setEditMode() {
    if (!this.option.isEditable) { return; }
    if (this.directoryDisplay) {
      this.updatePlayList();
    }
  }
  /**
   * プレイリスト情報を開く
   * @param {String} playListPath 
   */
  async open (playListPath) {
    let data = await PlayListClient.readPlayList(playListPath);
    this.currentPath = playListPath;
    this.playListInfo = data;
    this.updateView();
  }
  updateView () {
    this.view.children().remove();
    this.directoryDisplay = null;

    let buttonSize = '30px';
    // 戻るボタン
    let backButton = new IconButton({ icon: 'returnArrow.png', size: buttonSize });
    backButton.dom.css({
      position: 'absolute',
      right: this.view.css('paddingRight'),
    });
    this.view.append(backButton.dom);
    backButton.dom.on('mouseup', () => { this.option.onBack(); })
    // プレイリスト名編集ボタン
    let editButton = new IconButton({ icon: 'quillPen.png', size: buttonSize });
    editButton.dom.css({
      position: 'absolute',
      right: `calc(${this.view.css('paddingRight')} + ${buttonSize} + 10px)`,
    });
    editButton.setDisabled(!this.isEditable());
    gd.subject.addObserver({ dom: editButton.dom[0], receiver: (msg, prm) => {
      if (msg !== gd.modeManager.CHANGEMODE_MESSAGE) { return; }
      editButton.setDisabled(!this.isEditable());
    }})
    this.view.append(editButton.dom);
    editButton.dom.on('mouseup', () => { this.editPlayListName(this.playListInfo.name); });

    // プレイリスト名
    let name = $('<div>');
    name.addClass(['playListDisplayPlayListName']);
    name.text(this.playListInfo.name);
    this.view.append(name);

    // プレイリスト
    let list = $('<div>');
    list.addClass('playList');
    this.view.append(list);
    this.playListDom = list;

    this.updatePlayList();
  }
  updatePlayList () {
    if (!this.directoryDisplay) {
      this.directoryDisplay = new DirectoryDisplay(this.playListDom, {
        createElement: null,
        onSelectFolder: () => {},
        onSelectFile: (elem) => { this.openFile(elem); },
        onSelectUi: (elem) => {
          if (elem.key === NEW_KEY) { this.selectNewMusic(); }
        },
        onMenuClick: (elem) => { this.openMenu(elem); },
        onIconClick: (elem, num) => {
          // クリックイベントの伝搬を止める
          return true;
        },
        folderClickThreshold: 1,
        fileClickThreshold: 2,
        uiClickThreshold: 1,
        isMenuDisplayed: this.isEditable(),
        onDrop: (dragged, dropped) => { this.onDrop(dragged, dropped); },
        isDraggable: this.isEditable(),
        lineMargin: LIST_MARGIN,
      });
    }
    else {
      this.directoryDisplay.setOption({
        isMenuDisplayed: this.isEditable(),
        isDraggable: this.isEditable(),
      });
    }
    this.directoryDisplay.open(this.createDirectoryDispInfoFromPlayListInfo(this.playListInfo));
  }

  /** プレイリスト名編集 */
  editPlayListName (preName) {
    Popup.popupInput('プレイリスト名編集', ['変更', 'キャンセル'], (input, key, uncover) => {
      if (key === 'キャンセル' || !input) {
        uncover();
        return;
      }
      PlayListClient.renameElement(this.currentPath, input, () => {
        Popup.popupAlert('保存しました。', async (uncover) => {
          await this.open(this.currentPath + '/../' + input);
          uncover();
        });
      });
    }, { text: preName });
  }

  /**
   * プレイリスト表示用情報を生成
   * @param {PlayListInfo} playListInfo
   * @returns {import('./DirectoryDisplay.js').DirectoryDispInfo} 
   */
  createDirectoryDispInfoFromPlayListInfo (playListInfo) {
    // 音声再生ボタン生成クロージャ
    let createMusicPlayerButton = (key) => {
      return new MusicPlayerButton({
        size: { height : PLAY_BUTTON_SIZE },
        style: { 'margin-right': '10px', filter: 'invert(100%)', 'aspect-ratio': '1' },
        musicKey: key,
        playList: () => { return this.createPlayListData(); },
      }).dom;
    };
    let elements = this.playListInfo.list.map((elem) => {
      return {
        type: 'file',
        key: elem.fileInfo.physicsName,
        name: elem.fileInfo.name,
        icon: () => { return createMusicPlayerButton(elem.path); },
        hoverIcon: ct.path.icon + 'start.png',
        displayOption: { height: LIST_ELEMENT_HEIGHT },
      };
    });
    // 編集モード時は新規追加ボタンを追加
    if (this.isEditable()) {
      elements.push({
        type: DirectoryDisplay.directoryElementType.UI,
        key: NEW_KEY,
        name: '',
        icon: ct.path.icon + 'plus.png',
        displayOption: { height: NEW_BUTTON_HEIGHT },
      });
    }
    return {
      name: playListInfo.name,
      elements: elements,
    };
  }
  /** 新規追加する音楽を選択する */
  selectNewMusic () {
    let buttonSize = '30px';
    this.frontMostView = new FrontMostView(this.host, {
      coverStyle: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: '10px',
      },
      boardStyle: {
        backgroundColor: 'black',
        padding: '10px',
        borderRadius: '20px',
      },
      viewStyle: {},
    });
    // 戻るボタン
    let backButton = new IconButton({
      onClick: () => {
        this.directoryExplorer = null;
        this.frontMostView.close();
      },
      icon: 'returnArrow.png',
      size: buttonSize,
      style: { filter: 'invert(100%)' }
    });
    this.frontMostView.view.append(backButton.dom)
    // フォルダ表示欄
    let view = $('<div>');
    view.css({
      width: '100%',
      height: 'calc(100% - 40px)',
      marginTop: '10px',
    })
    this.frontMostView.view.append(view);

    this.directoryExplorer = new DirectoryExplorer(view, {
      onSelectFile: (elem) => {
        let targetPath = this.directoryExplorer.getCurrentPath() + '/' + elem.key;
        this.directoryExplorer = null;
        this.frontMostView.close();
        this.addMusic(targetPath);
      }
    });
    this.directoryExplorer.open('');
  }
  /**
   * メニューを開く
   * @param {import('./DirectoryDisplay.js').DirectoryDispElement} elem 
   */
  async openMenu (elem) {
    Popup.popupChoice('メニュー', ['削除', '閉じる'], (key, uncover) => {
      switch (key) {
        case '削除':
          Popup.popupChoice('本当に削除する？', ['削除', 'キャンセル'], (key, uncover) => {
            switch (key) {
              case '削除':
                PlayListClient.deletePlayListMusic(this.currentPath, elem.key, (data) => {
                  this.playListInfo = data;
                  this.updateView();
                  Cover.uncover(() => {}, true);
                  uncover();
                });
                break;
              case 'キャンセル':
                uncover();
                break;
            }
          });
          break;
        case '閉じる':
          uncover();
          break;
      }
    });
  }
  /**
   * ファイル情報を開く
   * @param {import('./DirectoryDisplay.js').DirectoryDispElement} elem 
   */
  async openFile (elem) {
    this.frontMostView = new FrontMostView(this.host, {
      coverStyle: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: '10px',
      },
      boardStyle: {},
      viewStyle: {},
    });

    this.fileDisplay = new FileDisplay(this.frontMostView.view, {
      onBack: () => {
        this.fileDisplay = null;
        this.frontMostView.close();
      },
      isEditable: true,
    });
    this.fileDisplay.open(elem.key);
  }
  /**
   * ドラッグ&ドロップ時
   * @param {import('./DirectoryDisplay.js').DirectoryDispElement} dragged 
   * @param {import('./DirectoryDisplay.js').DirectoryDispElement} dropped 
   */
  async onDrop (dragged, dropped) {
    if (dragged.type !== DirectoryDisplay.directoryElementType.FILE || dropped.type !== DirectoryDisplay.directoryElementType.FILE) {
      return;
    }
    Cover.cover();
    let playListInfo = await PlayListClient.arrangePlayListMusic(this.currentPath, dragged.key, dropped.key);
    this.playListInfo = playListInfo;
    this.updateView();
    Cover.uncover(() => {}, true);
  }
  /**
   * プレイリストに追加する
   * @param {String} targetPath 追加するファイルへのパス
   */
  async addMusic (targetPath) {
    Cover.cover();
    let playListInfo = await PlayListClient.addMusicToPlayList(this.currentPath, targetPath);
    this.playListInfo = playListInfo;
    this.updateView();
    Cover.uncover(() => {}, true);
  }

  /**
   * 指定要素の音声を再生
   * @param {PlayListElement} key 
   */
  playElement (elem) {
    let playList =this.createPlayListData();
    gd.listPlayer.setPlayList(playList);
    gd.listPlayer.play(elem.fileInfo.physicsName);
  }

  /**
   * 再生用のデータ生成
   * @returns {import('../../ListPlayer.js').PlayListData}
   */
  createPlayListData () {
    let list = this.playListInfo.list.map((elem) => {
      return {
        key: elem.path,
        name: elem.fileInfo.name,
        path: ct.path.folderRootPath + '/' + elem.path,
      };
    });
    return {
      name: this.playListInfo.name,
      key: ct.playlistType.PLEYLIST + this.currentPath,
      list: list,
    };
  }
}