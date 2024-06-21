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

/** プレイリストフォルダ移動 */
router.post('/playList/movePlayListFolder', async (req, res) => {
  let folderPath = req.body.folderPath;
  let toPath = req.body.toPath;
  let folderInfo = await PlayListReader.moveFolder(folderPath, toPath);
  res.send(folderInfo);
});

/** プレイリスト移動 */
router.post('/playList/movePlayList', async (req, res) => {
  let playListPath = req.body.playListPath;
  let toPath = req.body.toPath;
  let folderInfo = await PlayListReader.movePlayList(playListPath, toPath);
  res.send(folderInfo);
});

/** プレイリストフォルダ並び替え */
router.post('/playList/arrangeFolder', async (req, res) => {
  let targetPath = req.body.targetPath;
  let targetName = req.body.targetName;
  let nextName = req.body.nextName;
  let folderInfo = await PlayListReader.arrangeFolder(targetPath, targetName, nextName);
  res.send(folderInfo);
});

/** プレイリスト並び替え */
router.post('/playList/arrangePlayList', async (req, res) => {
  let targetPath = req.body.targetPath;
  let targetName = req.body.targetName;
  let nextName = req.body.nextName;
  let folderInfo = await PlayListReader.arrangePlayList(targetPath, targetName, nextName);
  res.send(folderInfo);
});

/** プレイリストフォルダ名称変更 */

/** プレイリストフォルダ削除 */

/** プレイリスト削除 */

/** プレイリスト情報取得 */
router.post('/playList/openPlayList', async (req, res) => {
});

module.exports = router;