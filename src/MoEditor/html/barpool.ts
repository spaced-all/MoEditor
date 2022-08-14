class BarPool {
  static _instance;
  constructor() {
    if (!BarPool._instance) {
      BarPool._instance = this;
    }

    return BarPool._instance;
  }

  get(key, el: HTMLElement) {}

  set(key, el: HTMLElement) {}

  show(key, el: HTMLElement, callback: (el: HTMLElement) => void) {}
}

const barpool = new BarPool();
export default barpool;
