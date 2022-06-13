import {
  createCountFilter,
  firstValidChild,
  getTagName,
  isTag,
  isTextNode,
  lastTextOffset,
  lastValidChild,
  nextValidNode,
  previousValidNode,
} from "./node";

class CaretPosition {
  container: Node;
  offset: number;
  root: Node;
  constructor(container: Node, offset: number, root: Node) {
    this.container = container;
    this.offset = offset;
    this.root = root;
  }
}

function getLineInfo(root: HTMLElement): {
  lineNumber: number;
  lineHeight: number;
  elHeight: number;
} {
  const range = document.createRange();

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const first = walker.nextNode();
  const last = lastValidChild(root);

  range.selectNode(first);
  const firstRects = range.getClientRects();
  var top = firstRects[0].y;
  for (let i = 0; i < firstRects.length; i++) {
    const rect = firstRects[i];
    top = Math.min(rect.y, top);
  }

  range.selectNode(last);
  const lastRects = range.getClientRects();
  var bottom = lastRects[0].y;
  for (let i = 0; i < lastRects.length; i++) {
    const rect = lastRects[i];
    bottom = Math.max(rect.y, bottom);
  }

  const lineHeight = root.offsetHeight - (bottom - top);
  return {
    lineNumber: Math.round(root.offsetHeight / lineHeight),
    lineHeight,
    elHeight: root.offsetHeight,
  };
}
