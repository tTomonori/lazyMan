const express = require('express')
const router = express.Router();
const FolderReader = require('../modules/FolderReader');
const CommonReader = require('../modules/common/CommonReader');

setFolderRoot();

/** フォルダ情報取得 */
router.post('/openFolder', async (req, res) => {
  let path = req.body.path;
  let folderInfo = await FolderReader.readFolder(path);
  res.send(folderInfo);
});

/** ファイル情報取得 */
router.post('/openFile', async (req, res) => {
  let name = req.body.name;
  let fileInfo = await FolderReader.readFile(name);
  res.send(fileInfo);
});

/** フォルダルートを読み込む */
async function setFolderRoot () {
  let json = await CommonReader.loadJson(__dirname + '/../../_data/LazyManSettings.json');
  FolderReader.setRoot(json);
}

module.exports = router;