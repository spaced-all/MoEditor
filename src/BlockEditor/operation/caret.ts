import { getTagName, isTag } from "./nodev2";

export class CaretPosition {
  container: Node;
  offset: number;
  root: Node;
  constructor(container: Node, offset: number, root: Node) {
    this.container = container;
    this.offset = offset;
    this.root = root;
  }
}

export interface Condition {
  emptyText?: boolean;
  whiteText?: boolean;
  br?: boolean;
  nullable?: boolean;
}

export function isValidTag(el: Node, condition?: Condition) {
  condition = condition || {};

  if (!el && condition.nullable !== false) {
    return true;
  }

  if (el.nodeType === 1) {
    if (isTag(el, "br")) {
      return condition.br !== false;
    }
    if (!(el as HTMLElement).classList.contains("bound-hint")) {
      return true;
    }
  }

  if (el.nodeType === 3) {
    if (condition.emptyText !== false) {
      return true;
    }
    if (condition.whiteText !== false) {
      return el.textContent.length > 0;
    }
    return el.textContent.trim() !== "";
  }
  return false;
}

export function nextValidNode(el: Node, condition?: Condition) {
  while (el) {
    el = el.nextSibling as Node;
    if (isValidTag(el, condition)) {
      return el;
    }
  }
  return el;
}

function firstValidChild(el: Node, condition?: Condition) {
  el = el.firstChild;
  while (el) {
    if (isValidTag(el, condition)) {
      return el;
    }
    el = el.nextSibling as HTMLElement;
  }
  return el;
}

function lastValidChild(el: Node, condition?: Condition) {
  el = el.lastChild;
  while (el) {
    if (isValidTag(el, condition)) {
      return el;
    }
    el = el.previousSibling as HTMLElement;
  }
  return el;
}

export function previousValidNode(el: Node, condition?: Condition) {
  while (el) {
    el = el.previousSibling as HTMLElement;
    if (isValidTag(el, condition)) {
      return el;
    }
  }
  return el;
}

function elementBoundOffset(
  el: Node,
  direction: "left" | "right",
  offset?: number
) {
  offset = offset || 0;
  if (isTag(el, "#text")) {
    if (direction === "left") {
      return el.textContent.length - offset;
    }
    return 0 + offset;
  }
  return 0;
}

export function indexOfNode(el: Node) {
  let i = 0;
  while ((el = el.previousSibling)) {
    i++;
  }
  return i;
}

function neighborCaretPosition(
  root: HTMLElement,
  direction: "left" | "right",
  container?: Node,
  offset?: number
): CaretPosition | null {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }

  const neighborSibling = (el, condition?: Condition) =>
    direction === "left"
      ? previousValidNode(el, condition)
      : nextValidNode(el, condition);

  const innerBorderChild = (el) =>
    direction === "left" ? lastValidChild(el) : firstValidChild(el);

  var inner;
  var neighbor;
  // must be text node
  if (!isTag(container, "#text")) {
    if (container.childNodes[offset]) {
      // <p>|<br>\</p>
      // <p>\<br>|<br>\</p>
      // <p><br>|<b>\</b></p>
      // <p>\<i>|<b>\</b></i></p>
      // <p><br>|"text"</p>
      if (
        isTag(container.childNodes[offset], "#text") &&
        direction === "right" &&
        container.childNodes[offset].textContent.length > 0
      ) {
        // <p>|"text"</p>
        return new CaretPosition(container.childNodes[offset], 1, root);
      }
      // container = container.childNodes[offset];
      // offset = 0;
    } else {
      container.appendChild(document.createTextNode(""));
    }
    container = container.childNodes[offset];
    offset = 0;
  }

  // in text node
  // <p>"t\e|x\t"</p>

  if (isTag(container, "#text")) {
    if (direction === "left" && offset > 0) {
      offset--;
      return new CaretPosition(container, offset, root);
    } else if (direction === "right" && offset < container.textContent.length) {
      offset++;
      return new CaretPosition(container, offset, root);
    }
  }
  // 除了不允许空文本，可允许 text / br / 其他任意tag
  neighbor = neighborSibling(container, { emptyText: false });
  // debugger;
  if (neighbor) {
    if (isTag(neighbor, "#text")) {
      // <p>"text|""t\ext"</p>
      offset = elementBoundOffset(neighbor, direction, 1);
      return new CaretPosition(neighbor, offset, root);
    } else if (isTag(neighbor, "br")) {
      const nneighbor = neighborSibling(neighbor);
      if (isTag(nneighbor, "#text")) {
        // <p>"text|"<br>"\text"</p>
        offset = elementBoundOffset(nneighbor, direction);
        return new CaretPosition(nneighbor, offset, root);
      }
      // <p>"|"<br>"\"</p>
      // <p>"|"<br>\<b></b></p>
      offset = indexOfNode(nneighbor);
      return new CaretPosition(nneighbor.parentElement, offset, root);
    } else if (isTag(neighbor, "label")) {
      return new CaretPosition(neighbor, 0, root);
    } else {
      inner = innerBorderChild(neighbor);
      if (inner) {
        // <p>"text|"<b>"\text"</b></p>
        // <p>"text"<b>"text\"</b>"|text"</p>
        if (isTag(inner, "#text")) {
          offset = elementBoundOffset(inner, direction);
          return new CaretPosition(inner, offset, root);
        } else {
          // <p>"text"<b><i></i>\</b>"|text"</p>
          // <p>"text|"<b>\<i></i>\</b></p>
          offset = indexOfNode(inner);
          if (direction === "left") {
            offset++;
          }
          return new CaretPosition(inner.parentElement, offset, root);
        }
      }
      // <p>"text|"<b>\<br></b></p>
      // <p>"text|"<b>\</b></p>
      return new CaretPosition(neighbor, 0, root);
    }
  }

  // <p>"text|"</p>
  if (container.parentElement === root) {
    return null;
  }

  // boundary
  container = container.parentElement;
  neighbor = neighborSibling(container);
  if (neighbor) {
    if (isTag(neighbor, "#text")) {
      // <p><b>"text|"</b>"\text"</p>
      offset = elementBoundOffset(neighbor, direction);
      return new CaretPosition(neighbor, offset, root);
    } else {
      // <p><b>"|"</b>\<br></p> -> (#text, 0) -> (p, 1)
      // <p><br>\<b>"|"</b></p> -> (#text, 0) -> (p, 1)
      // <p><b>"|"</b>\<b></b></p> -> (#text, 0) -> (p, 1)
      if (direction === "left") {
        offset = indexOfNode(container);
      } else {
        offset = indexOfNode(neighbor);
      }

      return new CaretPosition(neighbor.parentElement, offset, root);
    }
  }
  // boundary without parent neighbor
  // <p><i>\<b>"|"</b>\</i></p>
  offset = indexOfNode(container);
  if (direction === "right") {
    offset++;
  }
  return new CaretPosition(container.parentElement, offset, root);
}

export function previousCaretPosition(
  root: HTMLElement,
  container?: Node,
  offset?: number
): CaretPosition | null {
  const res = neighborCaretPosition(root, "left", container, offset);
  // if(res){
  //   console.log(["previousCaretPosition", res, indexOfNode(res.container)]);
  // }
  return res;
}

export function nextCaretPosition(
  root: HTMLElement,
  container?: Node,
  offset?: number
): CaretPosition | null {
  const res = neighborCaretPosition(root, "right", container, offset);
  // if(res){
  //   console.log(["nextCaretPosition", res, indexOfNode(res.container)]);
  // }
  return res;
}

/**
 * "|text"
 * <p>|</p>
 * <p>"|text"</p>
 * <p>"|"<br></p>
 * <p>|<br></p>
 * <p>|<i></i></p>
 * <p>|<label></label></p>
 * @param root
 */
export function firstCaretPosition(root: Node): CaretPosition {
  if (isTag(root, "#text")) {
    return new CaretPosition(root, 0, root);
  }
  const first = firstValidChild(root, {});
  if (first && isTag(first, "#text")) {
    return new CaretPosition(first, 0, root);
  }

  return new CaretPosition(root, 0, root);
}
/**
 * "text|"
 * <p>|</p>
 * <p>"text|"</p>
 * <p><br>"|"</p>
 * <p><br>|</p>
 * <p><i></i>|</p>
 * <p><label></label>|</p>
 * @param root
 */
export function lastCaretPosition(root: Node): CaretPosition {
  if (isTag(root, "#text")) {
    return new CaretPosition(root, root.textContent.length, root);
  }
  const last = lastValidChild(root, {});
  if (last && isTag(last, "#text")) {
    return new CaretPosition(last, last.textContent.length, root);
  }
  return new CaretPosition(root, root.childNodes.length, root);
}

export function createCaretPosition(
  root: HTMLElement,
  container: Node,
  offset: number
): CaretPosition {
  return new CaretPosition(container, offset, root);
}

export function currentCaretPosition(root: HTMLElement): CaretPosition | null {
  const sel = document.getSelection();
  if (sel) {
    var container = sel.focusNode;
    var offset = sel.focusOffset;
    return new CaretPosition(container, offset, root);
  }
  return null;
}

/**
 * <br> = 1
 * "text" = 4
 * <i></i> = 2
 * <i>"text"</i> = 6
 * <i>"text"</i> = 8
 * @param el
 */
export function elementCharSize(el: Node): number {
  if (!isValidTag(el)) {
    return 0;
  }
  if (isTag(el, "#text")) {
    return el.textContent.length;
  } else if (isTag(el, "br")) {
    return 1;
  } else {
    var innerSize = 0;
    el.childNodes.forEach((item) => {
      innerSize += elementCharSize(item);
    });
    return 2 + innerSize;
  }
}

/**
 * <p>|</p> -> 0
 * <p>text|</p> -> 4
 * <p>t<i></i>ext|</p> -> 6
 * <p>t<i></i><b></b>ext|</p> -> 8
 * <p>t<b><i></i></b>ext|</p> -> 8
 * <p>t<b><label></label></b>ext|</p> -> 8
 *
 * 文本按文本的长度计算，一个 element 占额外 2 个字符
 * @param root
 * @returns
 */
export function getCaretReletivePosition(
  root: HTMLElement,
  container?: Node,
  offset?: number
): number {
  const sel = document.getSelection();

  if (!container) {
    container = sel.focusNode;
    offset = sel.focusOffset;
  }

  let size = 0;
  if (container === root) {
    for (let i = 0; i < offset; i++) {
      size += elementCharSize(container.childNodes[i]);
    }
    return size;
  }

  while (container !== root) {
    if (isTag(container, "#text")) {
      size += offset;
      offset = indexOfNode(container);
    }

    for (let i = 0; i < offset; i++) {
      size += elementCharSize(container.parentElement.childNodes[i]);
    }
    container = container.parentElement;
    if (container !== root) {
      size++;
      offset = indexOfNode(container);
    }
  }
  return size;
}

export function getCaretReletivePositionAtLastLine(root: HTMLElement): number {
  const { lineNumber, lineHeight } = getLineInfo(root);
  if (lineNumber <= 1) {
    return getCaretReletivePosition(root);
  }
  const realOffset = getCaretReletivePosition(root);
  const range = document.createRange();
  // 获取最后一行的所有 contents
  var last = lastValidChild(root);
  while (last) {
    range.selectNode(last);
    if (isTag(last, "br")) {
      return realOffset - getCaretReletivePosition(root, last, 0) - 1;
    }

    if (Math.round(range.getBoundingClientRect().height / lineHeight) <= 1) {
      last = previousValidNode(last);
    } else {
      if (isTag(last, "#text")) {
        // TODO change to binery search
        range.setEnd(last, last.textContent.length);
        range.setStart(last, 0);
        var lineOffset = 0;
        while (
          Math.round(range.getBoundingClientRect().height / lineHeight) > 1
        ) {
          lineOffset++;
          range.setStart(last, lineOffset);
        }

        return realOffset - getCaretReletivePosition(root, last, lineOffset);
      } else {
        last = lastValidChild(last);
      }
    }
  }
}

export function getLineInfo(root: HTMLElement): {
  lineNumber: number;
  lineHeight: number;
  elHeight: number;
} {
  const range = document.createRange();

  // const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  // const first = walker.nextNode();

  if (!firstValidChild(root, { emptyText: false, whiteText: false })) {
    return {
      lineHeight: root.offsetHeight,
      lineNumber: 1,
      elHeight: root.offsetHeight,
    };
  }

  var first = firstValidChild(root);
  while (first.textContent.trim() === "") {
    first = nextValidNode(first);
  }

  var last = lastValidChild(root);
  while (last.textContent.trim() === "") {
    last = previousValidNode(last);
  }

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

export function isCursorLeft(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!firstValidChild(root, { emptyText: false })) {
    return true;
  }

  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  
  const firstPos = firstCaretPosition(root);
  return firstPos.container === container && firstPos.offset === offset;
}

/**
 * 什么情况下是最右侧元素？
 * 一路都处在最右侧，到根节点为止，一直在最右侧
 * <p>|</p>
 * <p>text|</p>
 * <p>text<i>text</i>|</p>
 * <p>text<i></i>|</p>
 * @param el 根元素
 * @returns
 */
export function isCursorRight(
  el: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!firstValidChild(el, { emptyText: false })) {
    return true;
  }
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }

  const firstPos = lastCaretPosition(el);

  if (firstPos.container === container && firstPos.offset === offset) {
    return true;
  }
  // const neighbor = nextCaretPosition(el, container, offset);
  // return (
  //   neighbor.container === firstPos.container &&
  //   neighbor.offset === firstPos.offset
  // );
}

export function isFirstLine(el: HTMLElement) {
  if (el.childNodes.length === 0) {
    return true;
  }
  const sel = document.getSelection();
  if (
    isTag(sel.anchorNode, "br") ||
    isTag(sel.anchorNode.childNodes[sel.anchorOffset], "br")
  ) {
    return false;
  }
  const range = sel.getRangeAt(0).cloneRange();
  const cpos = range.getClientRects();
  const epos = el.getClientRects();
  if (cpos.length === 0) {
    return true;
  }
  return cpos[0].y - cpos[0].height < epos[0].y;
}

export function isLastLine(el: HTMLElement) {
  if (el.childNodes.length === 0) {
    return true;
  }
  const sel = document.getSelection();
  const range = sel.getRangeAt(0).cloneRange();
  const cpos = range.getClientRects();
  const epos = el.getClientRects();
  if (cpos.length === 0) {
    return true;
  }
  return cpos[0].y + 2 * cpos[0].height > epos[0].y + epos[0].height;
}

/**
 *
 * <p>|</p> 3
 * <p>|</p> 0
 * <p>te|xt</p> 2
 * <p>text|<i></i></p> 4
 * <p>text<i>|</i></p> 5
 * <p>text<i><b>|text</b></i></p> 6
 * <p>text<i><b>te|xt</b></i></p> 8
 * <p>text<i><b>text</b>|</i></p> 11
 * <p>text<i></i>|</p> 6
 * <p>text<i>text</i>|<b>text</b></p> 10
 * <p>text<b><i>text</i></b>|<b>text</b></p> 12
 * <p>text<b><i>text</i>|<i></i></b><b>text</b></p> 11
 * <p>text<b><i>text</i>|text<i></i></b><b>text</b></p> 11
 *
 *
 * @param root
 * @param offset
 */
export function setCaretReletivePosition(root: HTMLElement, offset: number) {
  // debugger;
  const sel = document.getSelection();
  const range = sel.getRangeAt(0);

  var cur = firstValidChild(root);
  var historyOffset = 0;
  // range.setStart(cur, offset - curOffset);
  // range.setEnd(cur, offset - curOffset);
  if (offset === 0) {
    if (isTag(cur, "#text")) {
      range.setStart(cur, 0);
      range.setEnd(cur, 0);
    } else {
      range.setStart(root, 0);
      range.setEnd(root, 0);
    }
  }
  while (cur) {
    const curOffset = elementCharSize(cur);
    if (curOffset + historyOffset < offset) {
      cur = nextValidNode(cur, { emptyText: false });
      historyOffset += curOffset;
    } else {
      if (isTag(cur, "#text")) {
        range.setStart(cur, offset - historyOffset);
        range.setEnd(cur, offset - historyOffset);
        return true;
      } else if (isTag(cur, "br")) {
        // hidden condition: curOffset(1) + historyOffset === offset
        // "text"<br>|<br> -> 5
        // "text"<br>"|text" -> 5
        setCaretPosition(
          nextCaretPosition(root, cur.parentElement, indexOfNode(cur))
        );
        return true;
      } else {
        if (curOffset + historyOffset > offset) {
          historyOffset++;
          cur = firstValidChild(cur);
        } else {
          const prev = lastCaretPosition(cur);
          setCaretPosition(
            nextCaretPosition(root, prev.container, prev.offset)
          );
          return true;
        }
      }
    }
  }

  setCaretPosition(lastCaretPosition(root));
  return false;
}

/**
 * <p>in first in first in first in first
 * in second in second in second in second in <b>sec
 * ond</b> in thi|rd in third in third in third
 * </p>          ↑
 * <p>old old old| old old old old </p> 11
 * @param root
 * @param offset
 */
export function setCaretReletivePositionAtLastLine(
  root: HTMLElement,
  offset: number
) {
  const { lineNumber, lineHeight } = getLineInfo(root);
  if (lineNumber <= 1) {
    return setCaretReletivePosition(root, offset);
  }
  const range = document.createRange();
  // 获取最后一行的所有 contents
  var last = lastValidChild(root);
  while (last) {
    range.selectNode(last);

    if (isTag(last, "br")) {
      return setCaretReletivePosition(
        root,
        getCaretReletivePosition(root, last, 0) + offset + 1
      );
    }

    if (Math.round(range.getBoundingClientRect().height / lineHeight) <= 1) {
      last = previousValidNode(last);
    } else {
      if (isTag(last, "#text")) {
        // TODO change to binery search
        range.setEnd(last, last.textContent.length);
        range.setStart(last, 0);
        var lineOffset = 0;
        while (
          Math.round(range.getBoundingClientRect().height / lineHeight) > 1
        ) {
          lineOffset++;
          range.setStart(last, lineOffset);
        }

        return setCaretReletivePosition(
          root,
          getCaretReletivePosition(root, last, lineOffset) + offset
        );
      } else {
        last = lastValidChild(last);
      }
    }
  }
}

export function setCaretPosition(
  caretPos: CaretPosition,
  start: boolean = true,
  end: boolean = true,
  range?: Range
): Range {
  if (!caretPos) {
    return;
  }
  if (!range) {
    const sel = document.getSelection();
    range = sel.getRangeAt(0);
  }
  // debugger;
  var container = caretPos.container;
  var offset = caretPos.offset;
  if (
    isTag(container.childNodes[offset], "#text") &&
    container.childNodes[offset].textContent.length > 0
  ) {
    container = container.childNodes[offset];
    offset = 0;
  }

  if (caretPos.offset === -1) {
    switch (getTagName(container)) {
      case "#text":
        offset = container.textContent.length;
        break;
      case "label":
        offset = 0;
        break;
      default:
        offset = container.childNodes.length;
    }
  }

  if (start) {
    range.setStart(container, offset);
  }

  if (end) {
    range.setEnd(container, offset);
  }
  return range;
}
