import { indexOfNode, getTagName, isTag } from "./node";
import { Position } from "../types";
import {
  isValidTag,
  firstValidPosition,
  lastValidPosition,
  previousValidNode,
  nextValidNode,
  nextValidPosition,
  lastValidChild,
  firstValidChild,
  previousValidPosition,
  createPosition,
  validChildNodes,
} from "./valid";
import { previousCaretPosition } from "../../BlockEditor/operation";
/**
 * <br> = 1
 * "text" = 4
 * <i></i> = 2
 * <i>"text"</i> = 6
 * <i>"text"</i> = 8
 * @param el
 */
export function elementCharSize(el: Node, es: boolean = true): number {
  if (!isValidTag(el)) {
    return 0;
  }
  if (isTag(el, "#text")) {
    // |t|e|x|t|
    return el.textContent.length;
  } else if (isTag(el, "br")) {
    // |<br>|
    if (es) {
      return 1;
    }
  } else if (isTag(el, "label")) {
    // |<label>[any]</label>|
    return 2;
  } else {
    var innerSize = 0;
    validChildNodes(el).forEach((item) => {
      innerSize += elementCharSize(item, es);
    });
    if (es) {
      innerSize += 2;
    }
    return innerSize;
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
 * @param es : element size
 * @returns
 */
export function getCaretReletivePosition(
  root: HTMLElement,
  container?: Node,
  offset?: number,
  es: boolean = true
): number {
  const sel = document.getSelection();

  if (!container) {
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  let size = 0;
  if (container === root) {
    for (let i = 0; i < offset; i++) {
      size += elementCharSize(container.childNodes[i], es);
    }
    return size;
  }

  while (container !== root) {
    if (isTag(container, "#text")) {
      size += offset;
    } else {
      // size++;
    }

    offset = indexOfNode(container);

    for (let i = 0; i < offset; i++) {
      size += elementCharSize(container.parentElement.childNodes[i], es);
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
  const oldOverFlow = root.style.overflow;
  const oldWhiteSpace = root.style.whiteSpace;

  root.style.overflow = "hidden";
  root.style.whiteSpace = "nowrap";

  const lineHeight = root.offsetHeight;
  root.style.overflow = oldOverFlow;
  root.style.whiteSpace = oldWhiteSpace;

  const lineNumber = Math.round(root.offsetHeight / lineHeight);

  return {
    lineNumber: lineNumber,
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

  if (!previousCaretPosition(root, container, offset)) {
    return true;
  }
  return false;
}

/**
 * 什么情况下是最右侧元素？
 * 一路都处在最右侧，到根节点为止，一直在最右侧
 * <p>|</p>
 * <p>text|</p>
 * <p>text<i>text</i>|</p>
 * <p>text<i></i>|</p>
 * @param root 根元素
 * @returns
 */
export function isCursorRight(
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

  // let pos = lastValidPosition(root);

  // if (pos.container === container && pos.offset === offset) {
  //   return true;
  // }

  if (!nextValidPosition(root, container, offset)) {
    return true;
  }
  return false;
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
export function setCaretReletivePosition(
  root: HTMLElement,
  offset: number,
  range?: Range
) {
  if (offset < 0) {
    offset += getContentSize(root) + 1;
    if (offset < 0) {
      offset = 0;
    }
  }
  if (!range) {
    const sel = document.getSelection();
    range = sel.getRangeAt(0);
  }
  // debugger;
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
    return true;
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
        setPosition(
          nextValidPosition(root, cur.parentElement, indexOfNode(cur)),
          true,
          true,
          range
        );
        return true;
      } else if (isTag(cur, "label")) {
        // debugger;
        if (curOffset + historyOffset === offset) {
          cur = nextValidNode(cur, { emptyText: false });
          historyOffset += curOffset;
        } else {
          setPosition(createPosition(root, cur, 0), true, true, range);
          return true;
        }
      } else {
        if (curOffset + historyOffset > offset) {
          historyOffset++;
          cur = firstValidChild(cur);
        } else {
          const prev = lastValidPosition(cur);
          setPosition(
            nextValidPosition(root, prev.container, prev.offset),
            true,
            true,
            range
          );
          return true;
        }
      }
    }
  }

  setPosition(lastValidPosition(root), true, true, range);
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
  offset: number,
  range?: Range
) {
  const { lineNumber, lineHeight } = getLineInfo(root);
  if (lineNumber <= 1) {
    return setCaretReletivePosition(root, offset);
  }
  if (!range) {
    range = document.createRange();
  }
  // 获取最后一行的所有 contents
  var last = lastValidChild(root);
  while (last) {
    range.selectNode(last);

    if (isTag(last, "br")) {
      return setCaretReletivePosition(
        root,
        getCaretReletivePosition(root, last, 0) + offset + 1,
        range
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
          getCaretReletivePosition(root, last, lineOffset) + offset,
          range
        );
      } else {
        last = lastValidChild(last);
      }
    }
  }
}

export function setPosition(
  pos?: Position,
  start: boolean = true,
  end: boolean = true,
  range?: Range
): Range {
  if (!pos) {
    return;
  }
  if (!range) {
    const sel = document.getSelection();
    if (sel.rangeCount === 0) {
      range = document.createRange();
      sel.addRange(range);
    } else {
      range = sel.getRangeAt(0);
    }
  }
  // debugger;
  var container = pos.container;
  var offset = pos.offset;

  if (
    !isTag(container, "#text") &&
    isTag(container.childNodes[offset], "#text") &&
    container.childNodes[offset].textContent.length > 0
  ) {
    container = container.childNodes[offset];
    offset = 0;
  }

  if (pos.offset === -1) {
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

export function getContentSize(el: HTMLElement) {
  let size = 0;
  el.childNodes.forEach((item) => {
    size += elementCharSize(item);
  });
  return size;
}
