import ct from './constTable.js';
import gd from './globalData.js';

import IconButton from './modules/component/button/IconButton.js';
import ViewPortMode from './mode/ViewPortMode.js';
import FolderMode from './mode/FolderMode.js';
import PlayListMode from './mode/PlayListMode.js';
import Cover from './modules/ui/Cover.js';

/** ヘッダ */
const headerDom = $('#header');
/** コンテンツ */
const appContent = $('#appContent');
/** メニュー */
const leftMenu = $('#leftMenu');
const leftMenuContent = $('#leftMenuContent');
/** ビュー */
const viewPort = $('#viewPort');

// ヘッダ
/** @type {IconButton} メニューボタン */
let menuButton;
/** @type {IconButton} 編集ボタン */
let editButton;

// メニュー
/** @type {IconButton} フォルダボタン */
let folderButton;
/** @type {IconButton} プレイリストボタン */
let playListButton;

// ビュー
/** @type {ViewPortMode} */
let currentMode = new ViewPortMode();

init();

// 初期化--------------------------------------------------
async function init () {
  createHeader();
  createMenuContents();
}

// 作成--------------------------------------------------
/** ヘッダ作成 */
function createHeader () {
  let buttonSize = Number.parseFloat($('#header').css('height')) - 4 + 'px';
  // メニューボタン
  menuButton = new IconButton({
    icon: 'pocketBook.png',
    size: buttonSize,
    onClick: changeLeftMenuDisp,
  });
  headerDom.append(menuButton.dom);
  // 編集ボタン
  editButton = new IconButton({
    icon: 'marker.png',
    size: buttonSize,
    onClick: changeEditMode,
  });
  editButton.setProhibitonImage();
  headerDom.append(editButton.dom);
}

/** メニュー作成 */
function createMenuContents() {
  leftMenuContent.append($('<br>'));
  // フォルダボタン
  folderButton = new IconButton({
    icon: 'folder.png',
    size: '50px',
    onClick: setDisplayFolderMode,
  });
  leftMenuContent.append(folderButton.dom);
  leftMenuContent.append($('<br>'));
  leftMenuContent.append($('<br>'));
  // プレイリストボタン
  playListButton = new IconButton({
    icon: 'musicList.png',
    size: '50px',
    onClick: setPlayListMode,
  });
  leftMenuContent.append(playListButton.dom);
}

// 共通要素動作--------------------------------------------------
/** メニュー表示切替 */
function changeLeftMenuDisp() {
  if (leftMenu.hasClass('close')) {
    leftMenu.removeClass('close');
    leftMenu.addClass('open');
  }
  else {
    leftMenu.removeClass('open');
    leftMenu.addClass('close');
  }
}

/** 編集モード切替 */
function changeEditMode() {
  editButton.setProhibitonImage();
  let mode = gd.modeManager.mode === gd.modeManager.MODE.EDITABLE ? gd.modeManager.MODE.READONLY : gd.modeManager.MODE.EDITABLE;
  gd.modeManager.setMode(mode)
};

// コンテンツ動作--------------------------------------------------
/** フォルダ表示 */
function setDisplayFolderMode () {
  currentMode.end();
  Cover.reset();
  currentMode = new FolderMode (viewPort);
}

/** プレイリスト表示 */
function setPlayListMode () {
  currentMode.end();
  Cover.reset();
  currentMode = new PlayListMode (viewPort);
}