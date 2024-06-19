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

/** プレイリスト情報取得 */
router.post('/openPlayList', async (req, res) => {
});

module.exports = router;