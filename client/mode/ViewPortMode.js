export default class ViewPortMode {
  constructor (dom) {
    this.host = dom;
  };
  setEditMode (editMode) {}
  end () {};

  createViewPort () {
    let port = $('<div>');
    port.css('position', 'relative');
    this.host.append(port);
    return port;
  }
}