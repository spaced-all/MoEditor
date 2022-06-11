import {
  firstCaretPosition,
  lastCaretPosition,
  setCaretPosition,
} from "./caret";
import {
  validChildNodes,
  isValidTag,
  isTag,
  getTagName,
  nextValidNode,
  previousValidNode,
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

export function tagToStyle(tag: Node) {
  return tagNameToStyle[getTagName(tag)];
}

export function deleteStyle(styleContainer: HTMLElement) {
  if (!styleContainer) {
    return;
  }
  const sel = document.getSelection();
  const range = sel.getRangeAt(0);
  const { startOffset, startContainer, endContainer, endOffset } = range;
  const bchildren = validChildNodes(styleContainer);

  bchildren.forEach((item) => {
    styleContainer.parentElement.insertBefore(item, styleContainer);
  });

  // step 3. remove b
  styleContainer.parentElement.removeChild(styleContainer);

  // step 4. resetRange
  //   range.setStart(startContainer, startOffset);
  //   range.setEnd(endContainer, endOffset);

  const left = firstCaretPosition(startContainer);
  const right = lastCaretPosition(endContainer);
  setCaretPosition(left, true, false, range);
  setCaretPosition(right, false, true, range);
}

export function applyStyle(style, root: HTMLElement, range?: Range) {
  const t = styleToTag[style];
  if (!t) {
    return null;
  }

  const sel = document.getSelection();
  const newRange = document.createRange();
  if (!range) {
    range = sel.getRangeAt(0);
  }
  var wrapb = findParentMatchTagName(range.commonAncestorContainer, t, root);

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
    // debugger;
    const { startOffset, startContainer, endContainer, endOffset } = range;

    // step 2. move inner nodes from b to its parents Node
    const bchildren = validChildNodes(wrapb);

    bchildren.forEach((item) => {
      wrapb.parentElement.insertBefore(item, wrapb);
    });

    // step 3. remove b
    wrapb.parentElement.removeChild(wrapb);

    // step 4. resetRange
    const left = firstCaretPosition(startContainer);
    const right = lastCaretPosition(endContainer);
    setCaretPosition(left, true, false, newRange);
    setCaretPosition(right, false, true, newRange);
    // newRange.setStart(startContainer, startOffset);
    // newRange.setEnd(endContainer, endOffset);
    sel.removeAllRanges();
    sel.addRange(newRange);
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
    var allb = true;
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
        if (!wrapb) {
          allb = false;
        }
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
      if (isTag(neighbor, "#text")) {
        return null;
      }
      // <p><b><i>text</i>|"text"</b></p> backspace
      return neighbor;
    }
    if (container.parentElement === root) {
      return null;
    }
    // <p><b>|text</b></p> backspace
    // <p><b>text|</b></p> delete
    return container.parentElement;
  }

  if (container !== root) {
    return container;
  }
  return null;
}
