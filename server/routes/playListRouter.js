const express = require('express');
const path = require('path');
const router = express.Router();

const PlayListReader = require('../modules/PlayListReader');

PlayListReader.readPlayListFile();

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
  await PlayListReader.createPlayListFolder(path, name);
  let folderInfo = await PlayListReader.readPlayListFolder(path);
  res.send(folderInfo);
});

/** プレイリスト作成 */
router.post('/playList/createPlayList', async (req, res) => {
  let path = req.body.path;
  let name = req.body.name;
  await PlayListReader.createPlayList(path, name);
  let folderInfo = await PlayListReader.readPlayListFolder(path);
  res.send(folderInfo);
});

/** 要素移動 */
router.post('/playList/moveElement', async (req, res) => {
  let targetPath = req.body.targetPath;
  let toPath = req.body.toPath;
  await PlayListReader.moveElement(targetPath, toPath);
  let folderInfo = await PlayListReader.readPlayListFolder(path.dirname(targetPath));
  res.send(folderInfo);
});

/** 要素並び替え */
router.post('/playList/arrangeElement', async (req, res) => {
  let targetPath = req.body.targetPath;
  let targetName = req.body.targetName;
  let toName = req.body.toName;
  await PlayListReader.arrangeElement(targetPath, targetName, toName);
  let folderInfo = await PlayListReader.readPlayListFolder(targetPath);
  res.send(folderInfo);
});

/** 要素名称変更 */
router.post('/playList/renameElement', async (req, res) => {
  let targetPath = req.body.targetPath;
  let newName = req.body.newName;
  await PlayListReader.renameElement(targetPath, newName);
  let folderInfo = await PlayListReader.readPlayListFolder(path.dirname(targetPath));
  res.send(folderInfo);
});

/** 要素削除 */
router.post('/playList/deleteElement', async (req, res) => {
  let targetPath = req.body.targetPath;
  await PlayListReader.deleteElement(targetPath);
  let folderInfo = await PlayListReader.readPlayListFolder(path.dirname(targetPath));
  res.send(folderInfo);
});

/** プレイリスト情報取得 */
router.post('/playList/openPlayList', (req, res) => {
  let targetPath = req.body.path;
  let playListInfo = PlayListReader.readPlayList(targetPath);
  res.send(playListInfo);
});

module.exports = router;