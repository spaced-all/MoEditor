export function getTagName(el: Node) {
  return el.nodeName.toLowerCase();
}

export function isTag(el: Node, name: string) {
  return getTagName(el) === name;
}
