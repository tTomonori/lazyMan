import { IconButton } from './modules/component/button/IconButton.js';
import FolderMode from './mode/FolderMode.js';
import PlayListMode from './mode/PlayListMode.js';

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
/** メニューボタン */
let menuButton;
/** 編集ボタン */
let editButton;

// メニュー
/** フォルダボタン */
let folderButton;
/** プレイリストボタン */
let playListButton;

// ビュー
let currentMode;

init();

// 初期化--------------------------------------------------
async function init () {
  createHeader();
  createMenuContents();
}

// 作成--------------------------------------------------
/** ヘッダ作成 */
function createHeader () {
  // メニューボタン
  menuButton = new IconButton({
    icon: 'pocketBook.png',
    size: '45px',
    onClick: changeLeftMenuDisp,
  });
  headerDom.append(menuButton.dom);
  // 編集ボタン
  editButton = new IconButton({
    icon: 'marker.png',
    size: '45px',
    onClick: changeEditMode,
  });
  headerDom.append(editButton.dom);
}

/** メニュー作成 */
function createMenuContents() {
  // フォルダボタン
  folderButton = new IconButton({
    icon: 'folder.png',
    size: '50px',
    onClick: setDisplayFolderMode,
  });
  leftMenuContent.append(folderButton.dom);
  leftMenuContent.append($('<br>'))
  // プレイリストボタン
  playListButton = new IconButton({
    icon: 'musicList.png',
    size: '50px',
    onClick: setPlayListMode,
  });
  leftMenuContent.append(playListButton.dom);
}

// 動作--------------------------------------------------
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
};

/** フォルダ表示 */
function setDisplayFolderMode () {
  if (currentMode) { currentMode.end(); }
  let viewPortElement = createViewPortElement();
  currentMode = new FolderMode (viewPortElement);
}

/** プレイリスト表示 */
function setPlayListMode () {
  if (currentMode) { currentMode.end(); }
  let viewPortElement = createViewPortElement();
  currentMode = new PlayListMode (viewPortElement);
}

/** viewPortにhost用のelementを作成 */
function createViewPortElement () {
  let element = $('<div>');
  viewPort.append(element);
  return element;
}