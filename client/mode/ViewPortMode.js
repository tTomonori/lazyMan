export default class ViewPortMode {
  constructor (dom) {
    this.host = dom;
  };
  end () {};

  createViewPort () {
    let port = $('<div>');
    port.css('position', 'relative');
    this.host.append(port);
    return port;
  }
}