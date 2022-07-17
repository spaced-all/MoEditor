import {
  createCaretPosition,
  lastCaretPosition,
} from "../../BlockEditor/operation";
import { elementCharSize } from "./caret";
import { isTag } from "./node";
import { firstValidChild, isValidTag, validChildNodes } from "./valid";

export function textContentBefore(
  el: HTMLElement,
  focus?: Node,
  offset?: number
) {
  if (!focus) {
    const sel = document.getSelection();
    focus = sel.focusNode;
    offset = sel.focusOffset;
  }
  const range = document.createRange();
  range.setEnd(focus, offset);
  range.setStart(focus, 0);
  return range.cloneContents().textContent;
}

export function extractFragmentsAfter(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  const left = createCaretPosition(root, container, offset);
  const right = lastCaretPosition(root);
  const range = document.createRange();
  range.setStart(left.container, left.offset);
  range.setEnd(right.container, right.offset);
  const frag = range.extractContents();
  return frag;
}

export function fullText(el: Node) {
  const val = validChildNodes(el).map((item) => item.textContent);
  return val.join("");
}
export function isFullTextNode(el: HTMLElement) {
  const val = [];
  el.childNodes.forEach((item) => {
    if (isValidTag(item) && !isTag(item, "#text")) {
      val.push(item);
    }
  });
  return val.length === 0;
}

export function deleteTextBefore(
  root: HTMLElement,
  focus?: Node,
  offset?: number
) {
  if (!focus) {
    const sel = document.getSelection();
    focus = sel.focusNode;
    offset = sel.focusOffset;
  }
  const range = document.createRange();
  range.setEnd(focus, offset);
  range.setStart(root, 0);
  range.deleteContents();
}

