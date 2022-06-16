import {
  setCaretPosition,
  lastCaretPosition,
  nextCaretPosition,
  createCaretPosition,
  firstCaretPosition,
} from "./caret";

export function insertNode(
  root: HTMLElement,
  node: Node,
  direction: "left" | "right",
  container?: Node,
  offset?: number
) {
  const sel = document.getSelection();
  if (!container) {
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  const range = sel.getRangeAt(0);
  range.setStart(container, offset);
  range.setEnd(container, offset);
  range.insertNode(node);

  const prev = lastCaretPosition(node);
  if (direction === "right") {
    const caretPos = nextCaretPosition(root, prev.container, prev.offset);
    setCaretPosition(caretPos, true, true, range);
  }
}

export function wrapIn(
  content: DocumentFragment,
  tagName: string,
  className?: string,
  attributes?: { [key: string]: string }
) {
  attributes = attributes || {};
  className = className || "";
  const temp = document.createElement(tagName);
  for (const key in attributes) {
    temp.setAttribute(key, attributes[key]);
  }
  temp.className = className;

  temp.append(content);
  return temp;
}

export function splitContentAt(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }

  return {
    left: cloneContentLeft(root, container, offset),
    right: cloneContentRight(root, container, offset),
  };
}
export function cloneContentLeft(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  const last = firstCaretPosition(root);
  const range = document.createRange();

  const cur = createCaretPosition(root, container, offset);
  setCaretPosition(cur, false, true, range);
  setCaretPosition(last, true, false, range);
  const contents = range.cloneContents();
  return contents;
}
export function cloneContentRight(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  const last = lastCaretPosition(root);
  const range = document.createRange();

  const cur = createCaretPosition(root, container, offset);
  setCaretPosition(cur, true, false, range);
  setCaretPosition(last, false, true, range);
  const contents = range.cloneContents();
  return contents;
}
export function extractContentRight(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  const last = lastCaretPosition(root);
  const range = document.createRange();

  const cur = createCaretPosition(root, container, offset);
  setCaretPosition(cur, true, false, range);
  setCaretPosition(last, false, true, range);
  const contents = range.extractContents();
  return contents;
}

export function replaceContent() {}
