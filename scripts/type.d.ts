/**
 * @typedef {Object} DirectoryInfo
 * @property {String} current このディレクトリのパス
 * @property {String} parent 親ディレクトリのパス
 * @property {Array<FolderInfo>} folders
 * @property {Array<FileInfo>} files
 */

/**
 * @typedef {Object} FolderInfo
 * @property {String} type 'folder'
 * @property {String} name 表示名
 * @property {String} physicsName 物理名
 */

/**
 * @typedef {Object} FileInfo
 * @property {String} type 拡張子(ピリオド有り)
 * @property {String} name 表示名
 * @property {String} physicsName 物理名
 * @property {String} lyrics 歌詞
 * @property {Number} lyricsSize 歌詞のフォントサイズ
 */


/**
 * @typedef {Object} PlayListFolderInfo
 * @property {String} type 'folder' or 'list'
 * @property {String} name
 * @property {Array<Object>} elements
 */

/**
 * @typedef {Object} PlayListInfo
 * @property {String} type
 * @property {String} name
 * @property {Array<Object>} list
 */