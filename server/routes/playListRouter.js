const express = require('express')
const router = express.Router();

const PlayListReader = require('../modules/PlayListReader');

PlayListReader.readPlayList();

/** プレイリストフォルダ情報取得 */
router.post('/openPlayListFolder', async (req, res) => {
  let path = req.body.path;
  let folderInfo = await PlayListReader.readPlayListFolder(path);
  res.send(folderInfo);
});

/** プレイリストフォルダ作成 */
router.post('/createPlayListFolder', async (req, res) => {
  let path = req.body.path;
  let name = req.body.name;
  let folderInfo = PlayListReader.createPlayListFolder(path, name);
  res.send(folderInfo);
});

/** プレイリストフォルダ移動 */

/** プレイリスト移動 */

/** プレイリストフォルダ削除 */

/** プレイリスト削除 */

/** プレイリスト情報取得 */
router.post('/openPlayList', async (req, res) => {
});

module.exports = router;