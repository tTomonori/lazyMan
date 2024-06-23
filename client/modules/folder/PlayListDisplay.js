import PlayListClient from '../serverClient/PlayListClient.js';
import DirectoryDisplay from './DirectoryDisplay.js';
import DirectoryExplorer from './DirectoryExplorer.js';
import IconButton from '../component/button/IconButton.js';
import Popup from '../ui/Popup.js';
import FrontMostView from '../ui/FrontMostView.js';
import ct from '../../constTable.js';
import Cover from '../ui/Cover.js';

const NEW_KEY = '/new';

/**
 * @typedef {Object} PlayListDisplayOption
 * @property {function():void} onBack
 * @property {Boolean} isEditable
 */

export default class PlayListDisplay {
  /**
   * 
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
    this.playListDom;
    this.currentPath;
    this.listDom;
  }
  /**
   * オプションを変更
   * @param {FileDisplayOption} option 
   */
  setOption (option) {
    Object.assign(this.option, option);
    this.applyOption();
  }
  /** オプションを適用 */
  applyOption () {
    this.updateView();
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
      right: `calc(${this.view.css('paddingRight')} + ${buttonSize} + 20px)`,
    });
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
        onSelectFile: (elemn) => {},
        onSelectUi: (elem) => {
          if (elem.key === NEW_KEY) { this.selectNewMusic(); }
        },
        onMenuClick: (elem) => {},
        folderClickThreshold: 1,
        fileClickThreshold: 1,
        uiClickThreshold: 1,
        isMenuDisplayed: this.option.isEditable,
        onDrop: (dragged, dropped) => {},
        isDraggable: this.option.isEditable,
        lineMargin: '10px',
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
    let elements = this.playListInfo.list.map((elem) => {
      return {
        type: 'file',
        key: elem.fileInfo.physicsName,
        name: elem.fileInfo.name,
        icon: ct.path.icon + 'musicFile.png',
        displayOption: { height: '50px' },
      };
    });
    // 編集モード時は新規追加ボタンを追加
    if (this.option.isEditable) {
      elements.push({
        type: DirectoryDisplay.directoryElementType.UI,
        key: NEW_KEY,
        name: '',
        icon: ct.path.icon + 'plus.png',
        displayOption: { height: '20px' },
      });
    }
    return {
      name: playListInfo.name,
      elements: elements,
    };
  }
  /** 新規追加する音楽を選択する */
  selectNewMusic () {
    this.frontMostView = new FrontMostView(this.host, {
      coverStyle: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: '50px',
      },
      boardStyle: {
        backgroundColor: 'black',
        padding: '20px',
        borderRadius: '20px',
      },
      viewStyle: {
      },
    });
    // 戻るボタン
    let backButton = new IconButton({
      onClick: () => { this.frontMostView.close(); },
      icon: 'returnArrow.png',
      size: '30px',
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
        this.frontMostView.close();
        let targetPath = this.directoryExplorer.getCurrentPath() + '/' + elem.key;
        this.addMusic(targetPath);
      }
    });
    this.directoryExplorer.open('');
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
}