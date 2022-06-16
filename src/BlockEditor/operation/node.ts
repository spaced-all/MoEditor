import { isValidTag } from "./caret";
export function isNodeIn(el: Node, name: string, top: Node): boolean {
  var cur = el;
  while (cur !== top) {
    if (isTag(cur, name)) {
      return true;
    }
    cur = cur.parentElement as Node;
  }
  return false;
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

export function isTag(el: Node, name: string): boolean {
  if (!el) {
    return false;
  }
  return el.nodeName.toLowerCase() === name;
}

export function isTextNode(el: Node): boolean {
  return (isTag(el, "#text") && el.textContent.length > 0) || isTag(el, "br");
}


export function lastTextOffset(el: Node): number {
  if (isTag(el, "#text")) {
    return el.textContent.length;
  }
  return 0;
}

export function getTagName(el: Node): string {
  return el.nodeName.toLowerCase();
}

export function validInnerHTML(el: HTMLElement): string {
  const pure = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_ALL, null);
  var n;
  while ((n = walker.nextNode())) {
    if (!isValidTag(n)) {
      pure.push(n);
    }
  }

  pure.forEach((item) => {
    item.parentElement!.removeChild(item);
  });
  return el.innerHTML;
}

export const createCountFilter = (top: Node) => (node: Node) => {
  if (!isValidTag(node)) {
    return NodeFilter.FILTER_REJECT;
  }
  if (isNodeIn(node, "label", top)) {
    return NodeFilter.FILTER_REJECT;
  }
  return NodeFilter.FILTER_ACCEPT;
};


export function firstValidChild(el: Node): Node | null {
  for (var i = 0; i < el.childNodes.length; i++) {
    if (isValidTag(el.childNodes[i])) {
      return el.childNodes[i];
    }
  }
  return null;
}

export function lastValidChild(el: Node): Node | null {
  for (var i = el.childNodes.length - 1; i >= 0; i--) {
    if (isValidTag(el.childNodes[i])) {
      return el.childNodes[i];
    }
  }
  return null;
}

// export function lastValidText(el: Node): Node | null {
//   for (var i = el.childNodes.length - 1; i >= 0; i--) {
//     if (isValidTag(el.childNodes[i])) {
//       if(is)
//       return el.childNodes[i];
//     }
//   }
//   return null;
// }

export function firstNeighborTextNode(el: Node): Node {
  var valid = el;
  while (
    (el && isTextNode(el.previousSibling)) ||
    !isValidTag(el.previousSibling)
  ) {
    el = el.previousSibling;
    if (isTextNode(el)) {
      valid = el;
    }
  }
  return valid;
}

export function lastNeighborTextNode(el: Node): Node {
  var valid = el;
  while ((el && isTextNode(el.nextSibling)) || !isValidTag(el.nextSibling)) {
    el = el.nextSibling as Text;
    if (isTextNode(el)) {
      valid = el as Text;
    }
  }
  return valid;
}

export function validChildNodes(el: Node): Node[] {
  var res = [];
  for (var i = 0; i < el.childNodes.length; i++) {
    if (isValidTag(el.childNodes[i])) {
      res.push(el.childNodes[i]);
    }
  }
  return res;
}

export function findParentMatchTagName(
  el: Node,
  name: string,
  root: Node
): Node | null {
  var cur = el;
  while (cur !== root) {
    if (isTag(cur, name)) {
      return cur;
    }
    cur = cur.parentElement;
  }
  return null;
}

export function validChildNodesBefore(el: Node, offset: number): Node | null {
  for (var i = offset - 1; i >= 0; i--) {
    if (isValidTag(el.childNodes[i])) {
      return el.childNodes[i];
    }
  }
  return null;
}

export function validChildNodesAfter(el: Node, offset: number): Node | null {
  for (var i = offset; i < el.childNodes.length; i++) {
    if (isValidTag(el.childNodes[i])) {
      return el.childNodes[i];
    }
  }
  return null;
}
