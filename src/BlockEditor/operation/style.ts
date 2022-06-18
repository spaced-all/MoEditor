import {
  setCaretPosition,
  firstCaretPosition,
  lastCaretPosition,
  nextCaretPosition,
  nextValidNode,
  previousValidNode,
  isValidTag,
} from "./caret";
import {
  validChildNodes,
  isTag,
  getTagName,
  findParentMatchTagName,
} from "./node";

const styleToTag = {
  m: "mark",
  mark: "mark",
  b: "b",
  bold: "b",
  i: "i",
  italic: "i",
  u: "u",
  underline: "u",
  g: "code",
  code: "code",
  d: "s",
  s: "s",
  delete: "s",
};

// other formatting tag can be supported https://www.w3schools.com/html/html_formatting.asp
const tagNameToStyle = {
  b: "b",
  i: "i",
  u: "u",
  s: "d",
  code: "g",
  mark: "m",
};

export function supportStyleKey(key: string) {
  return key in styleToTag;
}
export function supportedTag(tag: Node) {
  return tagNameToStyle[getTagName(tag)] !== undefined;
}

export function tagToStyle(tag: Node) {
  return tagNameToStyle[getTagName(tag)];
}

export function deleteStyle(styleContainer: HTMLElement, root: HTMLElement) {
  if (!styleContainer) {
    return;
  }
  const sel = document.getSelection();
  const range = sel.getRangeAt(0);
  // const { startContainer, endContainer } = range;
  const bchildren = validChildNodes(styleContainer);

  bchildren.forEach((item) => {
    styleContainer.parentElement.insertBefore(item, styleContainer);
  });

  // step 3. resetRange
  if (bchildren.length === 0) {
    const caretPos = nextCaretPosition(root);
    setCaretPosition(caretPos, true, true, range);
  } else {
    const left = firstCaretPosition(bchildren[0]);
    const right = lastCaretPosition(bchildren[bchildren.length - 1]);
    setCaretPosition(left, true, false, range);
    setCaretPosition(right, false, true, range);
  }

  // step 4. remove b
  styleContainer.parentElement.removeChild(styleContainer);
}

export function applyStyle(style, root: HTMLElement, range?: Range) {
  const t = styleToTag[style];
  if (!t) {
    return null;
  }

  const sel = document.getSelection()!;
  const newRange = document.createRange();
  if (!range) {
    range = sel.getRangeAt(0);
  }
  var wrapb = findParentMatchTagName(
    range.commonAncestorContainer,
    t,
    root
  ) as HTMLElement;

  if (wrapb) {
    // all text are under same style
    // <p> <b>|</b> </p>
    // <p> <b>[text]</b> </p>
    // <p> <b>t[ex]t</b> </p>
    // <p> [<b>text</b>] </p>
    // <p> [<b>text</b><b>text</b>] </p>
    // <p> <b>te[xt</b><b>te]xt</b> </p>
    // unwrap style tag
    // step 1. store inner nodes range container and offset
    // cannot use range.cloneRange() because it will change when dom tree changed.

    deleteStyle(wrapb, root);
    return false;
  }

  // apply style
  const contents = range.cloneContents();
  if (contents.childNodes.length === 0) {
    // <p>te|xt </p> -> <p>te<b>| </b>xt </p>
    const newNode = document.createElement(t);
    newNode.innerHTML = "&nbsp;";
    // range.deleteContents();
    range.insertNode(newNode);
    newRange.setStart(newNode.firstChild, 0);
    newRange.setEnd(newNode.firstChild, newNode.firstChild.textContent.length);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    // <p>t[ex]t</p>
    // <p>t[ex<i>text</i>]t</p>
    // <p>t[ex<i>te]xt</i>t</p>
    // <p>t[ex<b>te]xt</b>t</p>
    const pure = [];
    var cur;

    range.deleteContents();
    for (let i = 0; i < contents.childNodes.length; i++) {
      cur = contents.childNodes[i];
      if (!isValidTag(cur)) {
        continue;
      }

      if (isTag(cur, t)) {
        cur.childNodes.forEach((val) => {
          pure.push(val);
        });
      } else {
        pure.push(cur);
      }
    }

    const frag = document.createDocumentFragment();
    pure.forEach((val) => {
      frag.appendChild(val);
    });

    const el = document.createElement(t);
    el.appendChild(frag);
    range.insertNode(el);

    const left = firstCaretPosition(el);
    const right = lastCaretPosition(el);
    setCaretPosition(left, true, false, newRange);
    setCaretPosition(right, false, true, newRange);
    sel.removeAllRanges();
    sel.addRange(newRange);

    // range.setStart(pure[0], 0);
    // range.setEnd(pure[pure.length - 1], pure[pure.length - 1].length);
  }
  return true;
}

/**
 * <p>|text</p>
 * <p><b></b>|text</p>
 * <p><b>|text</b></p>
 *
 * @param root
 * @param container
 * @param offset
 */
export function isInStyleBound(
  root: HTMLElement,
  direction: "left" | "right",
  container?: Node,
  offset?: number
) {
  if (!container) {
    const sel = document.getSelection()!;
    container = sel.focusNode!;
    offset = sel.focusOffset;
  }
  if (isTag(container, "#text")) {
    if (
      (offset !== 0 && direction === "left") ||
      (offset !== container.textContent.length && direction === "right")
    ) {
      // <p><b>"te|xt"</b></p>
      return null;
    }
    const neighbor =
      direction === "left"
        ? previousValidNode(container)
        : nextValidNode(container);

    if (neighbor) {
      // <p><b>"text"|"text"</b></p>
      if (supportedTag(neighbor)) {
        return neighbor;
      }
      return null;
    }
    if (container.parentElement === root) {
      return null;
    }
    // <p><b>|text</b></p> backspace
    // <p><b>text|</b></p> delete
    return container.parentElement;
  }

  if (container !== root) {
    // <b><br><br>/<br></b>
    if (
      (direction === "left" && offset === 0) ||
      (direction === "right" && offset === container.childNodes.length)
    ) {
      if (supportedTag(container)) {
        return container;
      }
      return null;
    }
    return null;
  }
  return null;
}
