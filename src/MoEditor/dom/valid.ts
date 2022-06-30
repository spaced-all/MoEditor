import { indexOfNode, isTag, elementBoundOffset } from "./node";

import { Position } from "../types";

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

export function firstValidChild(el: Node, condition?: Condition) {
  el = el.firstChild;
  while (el) {
    if (isValidTag(el, condition)) {
      return el;
    }
    el = el.nextSibling as HTMLElement;
  }
  return el;
}

export function lastValidChild(el: Node, condition?: Condition) {
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

function neighborValidPosition(
  root: HTMLElement,
  direction: "left" | "right",
  container?: Node,
  offset?: number
): Position | null {
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
    if (isTag(container, "label")) {
    } else {
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
          return new Position(container.childNodes[offset], 1, root);
        }
        // container = container.childNodes[offset];
        // offset = 0;
      } else {
        container.appendChild(document.createTextNode(""));
      }
      container = container.childNodes[offset];
      offset = 0;
    }
  }

  // in text node
  // <p>"t\e|x\t"</p>

  if (isTag(container, "#text")) {
    if (direction === "left" && offset > 0) {
      offset--;
      return new Position(container, offset, root);
    } else if (direction === "right" && offset < container.textContent.length) {
      offset++;
      return new Position(container, offset, root);
    }
  }
  // 除了不允许空文本，可允许 text / br / 其他任意tag
  neighbor = neighborSibling(container, { emptyText: false });
  // debugger;
  if (neighbor) {
    if (isTag(neighbor, "#text")) {
      // <p>"text|""t\ext"</p>
      offset = elementBoundOffset(
        neighbor,
        direction,
        isTag(container, "#text") ? 1 : 0
      );

      return new Position(neighbor, offset, root);
    } else if (isTag(neighbor, "br")) {
      const nneighbor = neighborSibling(neighbor);
      if (isTag(nneighbor, "#text")) {
        // <p>"text|"<br>"\text"</p>
        offset = elementBoundOffset(nneighbor, direction);
        return new Position(nneighbor, offset, root);
      }
      // <p>"|"<br>"\"</p>
      // <p>"|"<br>\<b></b></p>
      offset = indexOfNode(nneighbor);
      return new Position(nneighbor.parentElement, offset, root);
    } else if (isTag(neighbor, "label")) {
      return new Position(neighbor, 0, root);
    } else {
      inner = innerBorderChild(neighbor);
      if (inner) {
        // <p>"text|"<b>"\text"</b></p>
        // <p>"text"<b>"text\"</b>"|text"</p>
        if (isTag(inner, "#text")) {
          offset = elementBoundOffset(inner, direction);
          return new Position(inner, offset, root);
        } else {
          // <p>"text"<b><i></i>\</b>"|text"</p>
          // <p>"text|"<b>\<i></i>\</b></p>
          offset = indexOfNode(inner);
          if (direction === "left") {
            offset++;
          }
          return new Position(inner.parentElement, offset, root);
        }
      }
      // <p>"text|"<b>\<br></b></p>
      // <p>"text|"<b>\</b></p>
      return new Position(neighbor, 0, root);
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
      return new Position(neighbor, offset, root);
    } else {
      // <p><b>"|"</b>\<br></p> -> (#text, 0) -> (p, 1)
      // <p><br>\<b>"|"</b></p> -> (#text, 0) -> (p, 1)
      // <p><b>"|"</b>\<b></b></p> -> (#text, 0) -> (p, 1)
      if (direction === "left") {
        offset = indexOfNode(container);
      } else {
        offset = indexOfNode(neighbor);
      }

      return new Position(neighbor.parentElement, offset, root);
    }
  }
  // boundary without parent neighbor
  // <p><i>\<b>"|"</b>\</i></p>
  offset = indexOfNode(container);
  if (direction === "right") {
    offset++;
  }
  return new Position(container.parentElement, offset, root);
}

export function previousValidPosition(
  root: HTMLElement,
  container?: Node,
  offset?: number
): Position | null {
  const res = neighborValidPosition(root, "left", container, offset);
  // if(res){
  //   console.log(["previousCaretPosition", res, indexOfNode(res.container)]);
  // }
  return res;
}

export function nextValidPosition(
  root: HTMLElement,
  container?: Node,
  offset?: number
): Position | null {
  const res = neighborValidPosition(root, "right", container, offset);
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
export function firstValidPosition(root: Node): Position {
  if (isTag(root, "#text")) {
    return new Position(root, 0, root);
  }
  const first = firstValidChild(root, {});
  if (first && isTag(first, "#text")) {
    return new Position(first, 0, root);
  }

  return new Position(root, 0, root);
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
export function lastValidPosition(root: Node): Position {
  if (isTag(root, "#text")) {
    return new Position(root, root.textContent.length, root);
  }
  const last = lastValidChild(root, {});
  if (last && isTag(last, "#text")) {
    return new Position(last, last.textContent.length, root);
  }
  return new Position(root, root.childNodes.length, root);
}

export function createPosition(
  root: HTMLElement,
  container: Node,
  offset: number
): Position {
  return new Position(container, offset, root);
}

export function currentCaretPosition(root: HTMLElement): Position | null {
  const sel = document.getSelection();
  if (sel) {
    var container = sel.focusNode;
    var offset = sel.focusOffset;
    return new Position(container, offset, root);
  }
  return null;
}
