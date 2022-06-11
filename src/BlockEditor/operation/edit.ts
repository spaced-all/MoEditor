import { nextCaretPosition, setCaretPosition } from "./caret";
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
  if (direction == "right") {
    const caretPos = nextCaretPosition(root, container, offset);
    setCaretPosition(caretPos, true, true, range);
  }
}

export function replaceContent() {}
