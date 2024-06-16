const express = require('express')
const router = express.Router();
const FolderReader = require('../modules/FolderReader');
const CommonReader = require('../modules/common/CommonReader');

setFolderRoot();

router.post('/openFolder', async (req, res) => {
  let path = req.body.path;
  let folderInfo = await FolderReader.readFolder(path);
  res.send(folderInfo);
});

async function setFolderRoot () {
  let json = await CommonReader.loadJson(__dirname + '/../../_data/LazyManSettings.json');
  FolderReader.setRoot(json);
}

module.exports = router;