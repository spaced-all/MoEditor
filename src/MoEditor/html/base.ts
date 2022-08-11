import { ContentItem } from "../types";
import { Noticable } from "./components";
import { InlineMath } from "./inlinemath";
/**
 *
 * @param item
 * @param depth
 * @param formatType
 *  html mean keep rich text as it is
 *  markdown mean convert rich text to markdown string, <b>text</b> will be converted as "**text**"
 *  > usually be used in code block
 *
 *  plain mean convert rich text to plain text, <b>text</b> will be converted as "text"
 *  > usually be used in header block
 * @returns ReactHTML
 */
export function createElement(
  item: ContentItem | ContentItem[],
  depth: number = 0,
  formatType: "html" | "code" | "plaintext" = "html"
): [Node[], Noticable[]] {
  if (!item) {
    return [[], []];
  }

  if (!Array.isArray(item)) {
    item = [item];
  }
  const noticable: Noticable[] = [];
  const nodes = item.map((val, index, arr) => {
    let textContent = val.textContent;
    if (textContent) {
      textContent = textContent.replace(/\s/g, "\u00a0");
    } else {
      textContent = "";
    }
    let elementType: any = val.tagName;
    let el: HTMLElement;
    let subNodes, subNoticables;
    switch (elementType) {
      case "#text":
        return document.createTextNode(textContent);
      case "image":
      case "img":
        el = document.createElement("a");
        el.textContent = val.textContent;
        if (val.children) {
          [subNodes, subNoticables] = createElement(val.children);
          subNodes.forEach((c) => el.appendChild(c));
          subNoticables.forEach((c) => noticable.push(c));
        }
        el.setAttribute("src", val.attributes.src);
        el.setAttribute("href", "#");
        return el;
      case "i":
      case "b":
      case "a":
      case "del":
      case "code":
      case "em":
      case "s":
        el = document.createElement(elementType);
        if (val.textContent) {
          el.textContent = val.textContent;
        }

        for (let key in val.attributes) {
          const value = val.attributes[key];
          switch (key) {
            case "className":
              el.className = value;
              break;
            default:
              el.setAttribute(key, val.attributes[key]);
              break;
          }
        }

        if (val.children) {
          [subNodes, subNoticables] = createElement(val.children);
          subNodes.forEach((c) => el.appendChild(c));
          subNoticables.forEach((c) => noticable.push(c));
          //   createElement(val.children).forEach((c) => el.appendChild(c));
        }

        return el;
      case "math":
        const math = new InlineMath(val.textContent);
        noticable.push(math);
        return math.root;
      default:
        return document.createTextNode(`Missing ${elementType}`);
    }
  });
  return [nodes, noticable];
}

export function putContentItem(
  el: HTMLElement,
  contentItem: ContentItem | ContentItem[],
  refresh: boolean = true
) {
  if (refresh) {
    el.innerHTML = "";
  }
  const [nodes, noticable] = createElement(contentItem);
  if (nodes) {
    nodes.forEach((c) => {
      el.appendChild(c);
    });
    noticable.forEach((c) => c.componentDidMount());
  }
  return [nodes, noticable];
}

export function insertContentItem(
  el: HTMLElement,
  contentItem: ContentItem | ContentItem[],
  range?: Range
) {
  if (!range) {
    range = document.getSelection().getRangeAt(0);
  }

  const [nodes, noticable] = createElement(contentItem);
  if (nodes) {
    nodes.reverse().forEach((c) => {
      range.insertNode(c);
    });
    noticable.forEach((c) => c.componentDidMount());
  }
  return [nodes, noticable];
}
