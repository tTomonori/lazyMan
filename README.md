# LazyMan
```
_data ┳ fileInfo
      ┣ playlistinfo
      ┣ PlayList.json
      ┗ LazyManSettings.json
```
<br><br>

LazyManSettings.json
```json
{
  "folderRootPath": "C:\\Users\\",
  "fileInfoPath": "./_data/fileInfo",
  "playListInfoPath": "./_data/playListInfo"
}
```

<br><br>

PlayList.json
```json
{
  "root": {
    "type": "folder",
    "name": "root",
    "elements": [
      { "type": "folder", "name": "", "elements": [] },
      { "type": "playList", "name": "", "list": [{ "path": "" }] }
    ]
  }
}
```