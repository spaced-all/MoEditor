export function getTagName(el: Node) {
  if (!el) {
    return null;
  }
  return el.nodeName.toLowerCase();
}

export function isTag(el: Node, name: string) {
  return getTagName(el) === name;
}

export function isParent(cur: Node, parent: Node): boolean {
  while (cur) {
    if (cur === parent) {
      return true;
    }
    cur = cur.parentNode as Node;
  }
  return false;
}

export function findParentMatchTagName(
  el: Node,
  name: string,
  root: Node
): HTMLElement | null {
  var cur = el as HTMLElement;
  while (cur && cur !== root) {
    if (isTag(cur, name)) {
      return cur;
    }
    cur = cur.parentElement;
  }
  return null;
}

export function findTopNode(el: Node, root: HTMLElement) {
  while (el && el.parentElement !== root) {
    el = el.parentElement;
  }
  if (el.parentElement !== root) {
    return null;
  }
  return el;
}

export function indexOfNode(el: Node) {
  let i = 0;
  while ((el = el.previousSibling)) {
    i++;
  }
  return i;
}

export function elementBoundOffset(
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
