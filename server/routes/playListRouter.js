const express = require('express')
const router = express.Router();

const PlayListReader = require('../modules/PlayListReader');

PlayListReader.readPlayList();

/** プレイリストフォルダ情報取得 */
router.post('/playList/openPlayListFolder', async (req, res) => {
  let path = req.body.path;
  let folderInfo = await PlayListReader.readPlayListFolder(path);
  res.send(folderInfo);
});

/** プレイリストフォルダ作成 */
router.post('/playList/createPlayListFolder', async (req, res) => {
  let path = req.body.path;
  let name = req.body.name;
  let folderInfo = await PlayListReader.createPlayListFolder(path, name);
  res.send(folderInfo);
});

/** プレイリスト作成 */
router.post('/playList/createPlayList', async (req, res) => {
  let path = req.body.path;
  let name = req.body.name;
  let folderInfo = await PlayListReader.createPlayList(path, name);
  res.send(folderInfo);
});

/** 要素移動 */
router.post('/playList/moveElement', async (req, res) => {
  let targetPath = req.body.targetPath;
  let toPath = req.body.toPath;
  let folderInfo = await PlayListReader.moveElement(targetPath, toPath);
  res.send(folderInfo);
});

/** 要素並び替え */
router.post('/playList/arrangeElement', async (req, res) => {
  let targetPath = req.body.targetPath;
  let targetName = req.body.targetName;
  let toName = req.body.toName;
  let folderInfo = await PlayListReader.arrangeElement(targetPath, targetName, toName);
  res.send(folderInfo);
});

/** プレイリストフォルダ名称変更 */

/** プレイリストフォルダ削除 */

/** プレイリスト削除 */

/** プレイリスト情報取得 */
router.post('/playList/openPlayList', async (req, res) => {
});

module.exports = router;