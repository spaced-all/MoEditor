import { Block } from "../Blocks/Common";
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
