import { elementCharSize } from "./caret";
import { isTag } from "./node";
import { firstValidChild, nextValidNode } from "./valid";

export function findCodeOffset(root: HTMLElement, offset: number) {
  let cur = firstValidChild(root);
  let curOffset = 0;
  const range = document.createRange();
  while (cur) {
    let curSize = elementCharSize(cur, false);
    if (curSize + curOffset >= offset) {
      if (isTag(cur, "#text")) {
        range.setStart(cur, offset - curOffset);
        range.setEnd(cur, offset - curOffset);
        return range;
      } else {
        cur = firstValidChild(cur);
      }
    } else {
      curOffset += curSize;
      cur = nextValidNode(cur);
      if (isTag(cur, "div")) {
        // hack for break line
        curOffset += 1;
      }
    }
  }
  return null;
}
