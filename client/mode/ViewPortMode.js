export default class ViewPortMode {
  constructor (dom) {
    this.host = dom;
  };
  setEditMode (editMode) {}
  end () {};

  createViewPort () {
    let port = $('<div>');
    this.host.append(port);
    return port;
  }
}