const express = require('express');
const ip = require('ip');
const app = express();

app.use(express.json({ limit: '100mb' }));

// static files directory に指定
app.use(express.static(__dirname));

// サイトURL生成
const port = 3001;
const host = ip.address();
const firstPath = 'lazyMan';
const thisAppUrl = `${host}:${port}/${firstPath}`;
console.log('This app URL : ' + thisAppUrl);

app.get(`/${firstPath}`, (req, res) => {
  res.render(__dirname + '/client/views/index.ejs', { thisAppUrl: thisAppUrl });
});

app.use(require('./server/routes/folderRouter.js'));
app.use(require('./server/routes/playListRouter.js'));

// ポート指定で接続
app.listen(port);

if (process.argv[2] !== 'debug') {
  // chromeを開く
  const { spawn } = require("child_process")
  spawn("start", ["http:" + thisAppUrl, "chrome"], { shell: true })
}