import { isTag } from "./node";
import { isValidTag } from "./valid";

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

export function fullTextElement(el: HTMLElement) {
  const val = [];
  el.childNodes.forEach((item) => {
    if (isValidTag(item) && !isTag(item, "#text")) {
      val.push(item);
    }
  });
  return val.length === 0;
}

export function deleteTextBefore(
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
  range.setStart(el, 0);
  range.deleteContents();
}
