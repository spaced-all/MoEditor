import { Block } from "../Blocks/common";
import {
  validChildNodesAfter,
  isTag,
  nextValidNode,
  previousValidNode,
  firstValidChild,
} from "./node";
export function splitBlock() {}

export function mergeBlockData(a: Block, b: Block): Block {
  //   debugger;
  var merged = {
    ...a,
    id: a.id || b.id,
    order: a.order,
    type: a.type,
    data: { dom: [...a.data.dom, ...b.data.dom] },
  };
  return merged;
}

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

export function isCursorLeft(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!firstValidChild(root)) {
    return true;
  }
  const sel = document.getSelection();
  const range = sel.getRangeAt(0).cloneRange();
  if (!container) {
    container = range.startContainer;
    offset = range.startOffset;
  }
  if (container == root && offset == 0) {
    return true;
  } else if (
    isTag(container, "#text") &&
    container.parentElement == root &&
    !previousValidNode(container) &&
    offset == 0
  ) {
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
 * @param el 根元素
 * @returns
 */
export function isCursorRight(
  el: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!firstValidChild(el)) {
    return true;
  }

  const sel = document.getSelection();
  const range = sel.getRangeAt(0).cloneRange();
  if (!container) {
    container = range.endContainer;
    offset = range.endOffset;
  }
  if (container == el && !validChildNodesAfter(el, offset)) {
    return true;
  } else if (
    isTag(container, "#text") &&
    container.parentElement == el &&
    !nextValidNode(container) &&
    offset == container.textContent.length
  ) {
    return true;
  }
  return false;
}

export function isFirstLine(el: HTMLElement) {
  if (el.childNodes.length == 0) {
    return true;
  }

  const sel = document.getSelection();
  const range = sel.getRangeAt(0).cloneRange();
  const cpos = range.getClientRects();
  const epos = el.getClientRects();
  if (cpos.length == 0) {
    return true;
  }
  return cpos[0].y - cpos[0].height < epos[0].y;
}

export function isLastLine(el: HTMLElement) {
  if (el.childNodes.length == 0) {
    return true;
  }
  const sel = document.getSelection();
  const range = sel.getRangeAt(0).cloneRange();
  const cpos = range.getClientRects();
  const epos = el.getClientRects();
  if (cpos.length == 0) {
    return true;
  }
  return cpos[0].y + 2 * cpos[0].height > epos[0].y + epos[0].height;
}
