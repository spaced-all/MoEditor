import { Caret } from "../types";
/**
 * to display current user caret element bound
 */
export class BoundHint {
  left: HTMLSpanElement;
  right: HTMLSpanElement;
  text: Text;
  constructor() {
    this.left = document.createElement("span");
    this.right = document.createElement("span");
    this.text = document.createTextNode("");
  }
  initialize() {}
  update(caret: Caret) {}
  remove() {}
}

/**
 * to display other user position
 */
export class CaretHint {}
