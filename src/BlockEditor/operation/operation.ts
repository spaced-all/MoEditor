export function splitBlock() {}


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
