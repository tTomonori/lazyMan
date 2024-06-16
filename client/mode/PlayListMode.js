import ViewPortMode from "./ViewPortMode.js";

export default class PlayListMode extends ViewPortMode {
  constructor (dom) {
    super();
    this.viewPort = dom;
  }
  end () {
    this.viewPort.remove();
  }
}