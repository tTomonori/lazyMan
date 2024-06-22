/**
 * @typedef {Object} DirectoryInfo
 * @property {String} current このディレクトリのパス
 * @property {String} parent 親ディレクトリのパス
 * @property {Array<DirectoryElementInfo>} folders
 * @property {Array<DirectoryElementInfo>} files
 */

/**
 * @typedef {Object} HierarchyInfo
 * @property {'hierarchy'} type 
 * @property {String} name 名称
 * @property {String} physicsName 物理名
 * @property {Array<HierarchyInfo>} folders
 * @property {Array<DirectoryElementInfo>} files
 */

/**
 * @typedef {Object} DirectoryElementInfo
 * @property {String} type
 * @property {String} name 表示名
 * @property {String} physicsName 物理名
 * @property {Object} data
 */

/**
 * @typedef {Object} FileInfo
 * @property {'file'} type 
 * @property {Stirng} fileType 任意の種別
 * @property {String} ext 拡張子(「.」含む)
 * @property {String} name 表示名
 * @property {String} physicsName 物理名
 * @property {Object} data 任意情報
 */

/**
 * @typedef {Object} MusicFileInfo
 * @property {'file'} type 
 * @property {Stirng} fileType 任意の種別
 * @property {String} ext 拡張子(「.」含む)
 * @property {String} name 表示名
 * @property {String} physicsName 物理名
 * @property {MusicFileData} data 任意情報
 * 
 * @typedef {Object} MusicFileData
 * @property {Number} lyricsSize
 * @property {String} lyrics
 */

/**
 * @typedef {Object} PlayListInfo 
 * @property {String} type 'list'
 * @property {String} name 表示名
 * @property {String} physicsName 物理名
 * @property {Array<Object>} list
 */