import * as dat from "lil-gui";

export default class Debug {
  constructor() {
    this.active = window.location.hash === "#debug";

    if (this.active) {
      this.ui = new dat.GUI({ width: 190 });

      this.ui.close();
      this.debugEditorFolder = this.ui.addFolder("Editor");
    }
  }
}
