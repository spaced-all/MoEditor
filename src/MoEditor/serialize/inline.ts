import { Noticable } from "../inlinev2/abc";
import { registerManager } from "../register";
import { InlineElement } from "./types/inline";

const inlineRegister = registerManager.create("inlineComponents");

export function serialize(el: InlineElement[] | InlineElement): {
  nodes: Node[];
  noticables: Noticable[];
} {
  if (!Array.isArray(el)) {
    el = [el];
  }
  const nodes: Node[] = [];
  const noticables: Noticable[] = [];
  el.forEach((val) => {});

  return { nodes, noticables };
}

export function deserialize(
  el: Node[] | Node
): InlineElement[] | InlineElement {
  return [];
}
