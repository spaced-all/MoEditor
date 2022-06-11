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

/**
 * 1 => element node
 * 3 => text node
 * @param el
 * @returns
 */
export function isValidTag(el: Node | null): boolean {
  if (!el) {
    return true;
  }

  return (
    (el.nodeType === 1 &&
      (el as HTMLElement).contentEditable !== "false" &&
      getTagName(el) !== "br") ||
    (el.nodeType === 3 && el.textContent !== "")
  );
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

export function nextValidNode(el: Node): Node {
  var cur = el.nextSibling;
  while (!isValidTag(cur)) {
    cur = cur!.nextSibling;
  }
  return cur;
}

export function previousValidNode(el: Node): Node {
  var cur = el.previousSibling;

  while (!isValidTag(cur)) {
    cur = cur.previousSibling;
  }
  return cur;
}

export function firstValidChild(el: Node): Node {
  for (var i = 0; i < el.childNodes.length; i++) {
    if (isValidTag(el.childNodes[i])) {
      return el.childNodes[i];
    }
  }
  return null;
}

export function lastValidChild(el: Node): Node {
  for (var i = el.childNodes.length - 1; i >= 0; i--) {
    if (isValidTag(el.childNodes[i])) {
      return el.childNodes[i];
    }
  }
  return null;
}

export function firstNeighborTextNode(el: Node): Node {
  var valid = el;
  while (
    isTag(el.previousSibling, "#text") ||
    !isValidTag(el.previousSibling)
  ) {
    el = el.previousSibling;
    if (isTag(el, "#text")) {
      valid = el;
    }
  }
  return valid;
}

export function lastNeighborTextNode(el: Node): Node {
  var valid = el;
  while (isTag(el.nextSibling, "#text") || !isValidTag(el.nextSibling)) {
    el = el.nextSibling as Text;
    if (isTag(el, "#text")) {
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