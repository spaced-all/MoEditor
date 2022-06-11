import {
  createCountFilter,
  firstValidChild,
  getTagName,
  isTag,
  lastValidChild,
  nextValidNode,
  previousValidNode,
} from "./node";

export class CaretPosition {
  container: Node;
  offset: number;
  root: Node;
  constructor(container: Node, offset: number, root: Node) {
    this.container = container;
    this.offset = offset;
    this.root = root;
  }
}

const _neighbor = (container: Node, offset, direction) => {
  var neighbor;
  if (direction === "left") {
    // <p>text|text2</p> -> neighbor
    // <p><label></label>|text</p> -> neighbor
    neighbor = previousValidNode(container);
    offset = -1;
    // <p>"text"|"text"</p>
    if (isTag(container, "#text") && isTag(neighbor, "#text")) {
      offset = neighbor.textContent.length - 1;
    }
  } else {
    // <p>text|text2</p> -> neighbor
    // <p>text|<label></label></p> -> neighbor
    neighbor = nextValidNode(container);
    offset = 0;
    if (isTag(container, "#text") && isTag(neighbor, "#text")) {
      offset++;
    }
    container = neighbor;
  }
  return [neighbor, offset];
};

const _neighborIn = (container, offset, direction) => {
  if (direction === "left") {
    // <p><i></i>|text</p> -> in neighbor
    // <p><i><label></label></i>|text</p> -> in neighbor
    container = previousValidNode(container);

    // <p><i>text</i>|text</p> -> in
    if (lastValidChild(container)) {
      if (isTag(lastValidChild(container), "#text")) {
        container = lastValidChild(container);
      }
      //   else {
      //     container.appendChild(document.createTextNode(""));
      //     container = lastValidNode(container);
      //   }
    }
    offset = -1;
  } else {
    // <p>text|<i></i></p> -> in neighbor
    // <p>text|<i><label></label></i></p> -> in neighbor

    container = nextValidNode(container);

    // <p>text|<i>text</i></p> -> in
    if (firstValidChild(container)) {
      if (isTag(firstValidChild(container), "#text")) {
        container = firstValidChild(container);
      }
      //   else {
      //     container.insertBefore(
      //       document.createTextNode(""),
      //       firstValidNode(container)
      //     );
      //     container = firstValidNode(container);
      //   }
    }
    offset = 0;
  }

  return [container, offset];
};

const _stepIn = (container, offset, direction) => {
  if (direction === "left") {
    // <p><i></i>|</p> -> in
    // <p><i>text</i>|</p> -> in
    // <p><i></i>|<i></i></p> -> in
    // <p><b><i></i>|<i></i></b></p> -> in
    container = container.childNodes[offset - 1];
    if (
      firstValidChild(container) &&
      isTag(firstValidChild(container), "#text")
    ) {
      container = firstValidChild(container);
    }
    offset = -1;
  } else {
    // <p>|<i></i></p> -> in
    // <p>|<i>text</i></p> -> in
    // <p><i></i>|<i></i></p> -> in
    // <p><b><i></i>|<i></i></b></p> -> in
    container = container.childNodes[offset];
    if (
      firstValidChild(container) &&
      isTag(firstValidChild(container), "#text")
    ) {
      container = firstValidChild(container);
    }
    offset = 0;
  }
  return [container, offset];
};
const _stepOut = (container, offset, direction) => {
  if (direction === "left") {
    // <p><b>|</b></p> -> <p>|<b></b></p>
    // <p>text<b>|</b></p> -> <p>text|<b></b></p>
    // <p>text<i>|text</i></p> -> out -> <p>text|<i>text</i></p>
    // <p><b></b><i>|text</i></p> -> out -> <p>text<b></b>|<i>text</i></p>
    // <p>text<i>text|</i><label></label></p> -> out -> <p>text<i>text</i>|<label></label></p>
    // <p><b><i>text|</i></b></p> -> out -> <p><b><i>text|</i>|</b></p>
    if (isTag(container, "#text")) {
      container = container.parentElement;
    }
    var prev = previousValidNode(container);
    if (!prev) {
      const children = container.parentNode.childNodes;
      offset = children.length;
      for (let i = children.length - 1; i >= 0; i--) {
        offset--; // to right
        if (children[i] === container) {
          break;
        }
      }
      container = container.parentNode;
    } else {
      container = prev;

      if (isTag(container, "#text")) {
        // <p>text<i>|text</i>text</p> -> out then in -> <p>text|<i>text</i>text</p>
        offset = -1;
      } else {
        const children = container.parentNode.childNodes;
        offset = children.length;
        for (let i = children.length - 1; i >= 0; i--) {
          if (children[i] === container) {
            break;
          }
          offset--; // to right
        }
        container = container.parentNode;
      }
    }
    // var cur = styleContainer;
  } else {
    // <p>\<b>|</b></p>
    // <p>text\<b>|</b></p>
    // <p>text\<i>|text</i></p>
    // <p>text<b></b>\<i>|text</i></p>
    // <p>text\<i>|text</i><label></label></p>
    // <p><b>\<i>|text</i></b></p>

    if (isTag(container, "#text")) {
      container = container.parentElement;
    }
    var next = nextValidNode(container);
    if (!next) {
      const children = container.parentNode.childNodes;
      offset = 0;
      for (let i = 0; i < children.length; i++) {
        offset++; // to right
        if (children[i] === container) {
          break;
        }
      }
      container = container.parentNode;
    } else {
      container = next; // text -> p // out of <i>
      // <p>text<i>text|</i>text</p> -> out then in -> <p>text<i>text</i>|text</p>
      if (isTag(container, "#text")) {
        offset = 0;
      } else {
        offset = 0;
        const children = container.parentNode.childNodes;
        for (let i = 0; i < children.length; i++) {
          if (children[i] === container) {
            break;
          }
          offset++; // to right
        }
        container = container.parentNode;
      }
    }
  }
  return [container, offset];
};

export function nextCaretPosition(
  root: HTMLElement,
  container?: Node,
  offset?: number
): CaretPosition | null {
  const sel = document.getSelection();
  if (!container) {
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  const tagName = container.nodeName.toLowerCase();

  const neighbor = _neighbor.bind(null, container, offset, "right");
  const neighborIn = _neighborIn.bind(null, container, offset, "right");
  const stepIn = _stepIn.bind(null, container, offset, "right");
  const stepOut = _stepOut.bind(null, container, offset, "right");

  if (tagName === "#text") {
    if (offset < container.textContent.length) {
      // <p>text|text</p> -> inner
      offset++;
    } else {
      // 寻找下一个 valid 元素
      if (nextValidNode(container)) {
        switch (getTagName(nextValidNode(container))) {
          // <p>text|text2</p> -> neighbor
          // <p>text|<label></label></p> -> neighbor
          case "#text":
          case "label":
            [container, offset] = neighbor();
            break;
          default:
            // <p>text|<i></i></p> -> in neighbor
            // <p>text|<i><label></label></i></p> -> in neighbor
            [container, offset] = neighborIn();
            break;
        }
      } else if (container.parentElement === root) {
        // <p>text|</p> -> hit bound
        return null;
      } else {
        // <p>text<i>text|</i></p> -> out -> <p>text<i>text</i>|</p>
        // <p>text<i>text|</i><b></b></p> -> out -> <p>text<i>text</i>|<b></b></p>
        // <p>text<i>text|</i><label></label></p> -> out -> <p>text<i>text</i>|<label></label></p>
        // <p><b><i>text|</i></b></p> -> out -> <p><b><i>text|</i>|</b></p>
        [container, offset] = stepOut();
      }
    }
  } else if (tagName === "label") {
    // 寻找下一个 valid 元素
    // <p>[<lb></lb>]<b></b></p> -> neighbor -> <p><lb></lb>|<b></b></p>
    // <p><b>[<lb></lb>]</b></p> -> neighbor -> <p><b><lb></lb>|</b></p>
    // <p><b>[<lb></lb>]text</b></p> -> neighbor
    [container, offset] = neighbor();
  } else {
    if (container.childNodes[offset]) {
      // <p>|<i></i></p> -> in
      // <p>|<i>text</i></p> -> in
      // <p><i></i>|<i></i></p> -> in
      // <p><b><i></i>|<i></i></b></p> -> in
      [container, offset] = stepIn();
    } else if (container === root) {
      // <p><i></i>|</p> -> hit bound
      return null;
    } else {
      // <p><b>|</b></p> -> <p><b></b>|</p>
      // <p><b>|</b>text</p> -> <p><b></b>|text</p>
      [container, offset] = stepOut();
    }

    // <p><i></i>|<b></b></p> -> in
    // <p><b>|<i></i></b></p> -> in
  }

  const newRange = new CaretPosition(container, offset, root);
  return newRange;
}

export function previousCaretPosition(
  root: HTMLElement
  //   container,
  //   offset
): CaretPosition | null {
  const sel = document.getSelection();
  // const range = sel.getRangeAt(0);
  var container = sel.focusNode;
  var offset = sel.focusOffset;
  const tagName = container.nodeName.toLowerCase();

  console.log(container, offset);

  const neighbor = _neighbor.bind(null, container, offset, "left");
  const neighborIn = _neighborIn.bind(null, container, offset, "left");
  const stepIn = _stepIn.bind(null, container, offset, "left");
  const stepOut = _stepOut.bind(null, container, offset, "left");

  if (tagName === "#text") {
    if (offset > 0) {
      // <p>text|text</p> -> inner
      offset--;
    } else {
      // 寻找上一个 valid 元素
      if (previousValidNode(container)) {
        // <p>text|<label></label></p> -> neighbor
        // <p>text|text2</p> -> neighbor
        switch (getTagName(previousValidNode(container))) {
          case "#text":
          case "label":
            [container, offset] = neighbor();
            break;
          default:
            [container, offset] = neighborIn();
            break;
        }
      } else if (container.parentElement === root) {
        // <p>text|</p> -> hit bound
        return null;
      } else {
        // <p>text<i>text|</i></p> -> out -> <p>text<i>text</i>|</p>
        // <p>text<i>text|</i><b></b></p> -> out -> <p>text<i>text</i>|<b></b></p>
        // <p>text<i>text|</i><label></label></p> -> out -> <p>text<i>text</i>|<label></label></p>
        // <p><b><i>text|</i></b></p> -> out -> <p><b><i>text|</i>|</b></p>
        [container, offset] = stepOut();
      }
    }
  } else if (tagName === "label") {
    // 寻找下一个 valid 元素
    // <p>[<lb></lb>]<b></b></p> -> neighbor -> <p><lb></lb>|<b></b></p>
    // <p><b>[<lb></lb>]</b></p> -> neighbor -> <p><b><lb></lb>|</b></p>
    // <p><b>[<lb></lb>]text</b></p> -> neighbor

    [container, offset] = neighbor();
  } else {
    // <p>|<i></i></p> -> in
    // <p>|<i>text</i></p> -> in
    // <p><i></i>|<i></i></p> -> in
    // <p><b><i></i>|<i></i></b></p> -> in
    if (container.childNodes[offset]) {
      [container, offset] = stepIn();
    } else if (container === root) {
      // <p><i></i>|</p> -> hit bound
      return null;
    } else {
      // <p><b>|</b></p> -> out
      // <p><b>|</b>text</p> -> out
      [container, offset] = stepOut();
    }

    // <p><i></i>|<b></b></p> -> in
    // <p><b>|<i></i></b></p> -> in
  }
  const newRange = new CaretPosition(container, offset, root);
  return newRange;
}

export function createCaretPosition(
  root: HTMLElement,
  container: Node,
  offset: number
): CaretPosition {
  return new CaretPosition(container, offset, root);
}

/**
 * <p>|</p>
 * <p>|<i></i></p>
 * <p>|<label></label></p>
 * @param root
 */
export function firstCaretPosition(root: Node): CaretPosition {
  const first = firstValidChild(root);
  if (first && isTag(first, "#text")) {
    return new CaretPosition(first, 0, root);
  }
  return new CaretPosition(root, 0, root);
}

export function lastCaretPosition(root: Node): CaretPosition {
  const last = lastValidChild(root);
  if (last && isTag(last, "#text")) {
    return new CaretPosition(last, last.textContent.length, root);
  }
  if (isTag(root, "#text")) {
    return new CaretPosition(root, root.textContent.length, root);
  }
  return new CaretPosition(root, root.childNodes.length, root);
}

export function currentCaretPosition(root: HTMLElement): CaretPosition | null {
  const sel = document.getSelection();
  if (sel) {
    var container = sel.focusNode;
    var offset = sel.focusOffset;
    return new CaretPosition(container, offset, root);
  }
  return null;
}

/**
 * <p>|</p> -> 0
 * <p>text|</p> -> 4
 * <p>t<i></i>ext|</p> -> 6
 * <p>t<i></i><b></b>ext|</p> -> 8
 * <p>t<b><i></i></b>ext|</p> -> 8
 * <p>t<b><label></label></b>ext|</p> -> 8
 *
 * 文本按文本的长度计算，一个 element 占额外 2 个字符
 * @param root
 * @returns
 */
export function getCaretReletivePosition(
  root: HTMLElement,
  focus?: Node,
  offset?: number
): number {
  // debugger;
  const sel = document.getSelection();

  const container = focus ? focus : sel.focusNode;
  offset = focus ? offset : sel.focusOffset;
  if (
    isTag(container, "#text") &&
    isTag(container.previousSibling, "span") &&
    container.textContent.trim() === ""
  ) {
    offset = 0;
  }

  var cur = container;
  do {
    if (!previousValidNode(cur)) {
      if (cur.parentElement === root) {
        break;
      }
      cur = cur.parentElement;
      offset += 1;
      continue;
    }
    cur = previousValidNode(cur);

    if (isTag(cur, "#text")) {
      offset += cur.textContent.length;
    } else {
      offset += 2;
    }
    const walker = document.createTreeWalker(
      cur,
      NodeFilter.SHOW_ALL,
      createCountFilter(root)
    );
    var n;
    while ((n = walker.nextNode())) {
      if (isTag(n, "#text")) {
        offset += n.textContent.length;
      } else {
        offset += 2;
      }
    }
  } while (cur);
  return offset;
}

export function getCaretReletivePositionAtLastLine(root: HTMLElement): number {
  const { lineNumber, lineHeight } = getLineInfo(root);
  if (lineNumber <= 1) {
    return getCaretReletivePosition(root);
  }
  const realOffset = getCaretReletivePosition(root);
  const range = document.createRange();
  // 获取最后一行的所有 contents
  var last = lastValidChild(root);
  while (last) {
    range.selectNode(last);
    if (Math.round(range.getBoundingClientRect().height / lineHeight) <= 1) {
      last = previousValidNode(last);
    } else {
      if (isTag(last, "#text")) {
        // TODO change to binery search
        range.setEnd(last, last.textContent.length);
        range.setStart(last, 0);
        var lineOffset = 0;
        while (
          Math.round(range.getBoundingClientRect().height / lineHeight) > 1
        ) {
          lineOffset++;
          range.setStart(last, lineOffset);
        }

        return realOffset - getCaretReletivePosition(root, last, lineOffset);
      } else {
        last = lastValidChild(last);
      }
    }
  }
}

/**
 *
 * <p>|</p> 3
 * <p>|</p> 0
 * <p>te|xt</p> 2
 * <p>text|<i></i></p> 4
 * <p>text<i>|</i></p> 5
 * <p>text<i><b>|text</b></i></p> 6
 * <p>text<i><b>te|xt</b></i></p> 8
 * <p>text<i><b>text</b>|</i></p> 11
 * <p>text<i></i>|</p> 6
 * <p>text<i>text</i>|<b>text</b></p> 10
 * <p>text<b><i>text</i></b>|<b>text</b></p> 12
 * <p>text<b><i>text</i>|<i></i></b><b>text</b></p> 11
 * <p>text<b><i>text</i>|text<i></i></b><b>text</b></p> 11
 *
 *
 * @param root
 * @param offset
 */
export function setCaretReletivePosition(root: HTMLElement, offset: number) {
  // debugger;
  const sel = document.getSelection();
  const range = sel.getRangeAt(0);

  var cur = firstValidChild(root);
  var curOffset = 0;

  while (cur) {
    if (isTag(cur, "#text")) {
      // condition 1
      if (curOffset + cur.textContent.length >= offset) {
        range.setStart(cur, offset - curOffset);
        range.setEnd(cur, offset - curOffset);
        return true;
      } else {
        curOffset += cur.textContent.length;
        cur = nextValidNode(cur);
        continue;
      }
    }
    // condition 2
    if (curOffset === offset) {
      // <p>text<b><i>text</i>|<i></i></b><b>text</b></p> 11
      // <p>text<b><i>text</i>|text<i></i></b><b>text</b></p> 11
      range.setStartBefore(cur);
      range.setEndBefore(cur);
      return true;
    }

    // condition 3
    if (curOffset + 1 === offset) {
      range.setStart(cur, 0);
      range.setEnd(cur, 0);
      return true;
    }

    const walker = document.createTreeWalker(
      cur,
      NodeFilter.SHOW_ALL,
      createCountFilter(root)
    );
    var n;
    var nodeOffset = 2;
    while ((n = walker.nextNode())) {
      var nodeSize = 0;
      if (isTag(n, "#text")) {
        nodeSize = n.textContent.length;
      } else {
        nodeSize = 2;
      }
      if (curOffset + nodeOffset + nodeSize > offset) {
        // larger than, but not equal to, equal means the situation below,
        // <p>text[<b><i>text</i><i></i></b>]|<b>text</b></p>
        //        [         cur             ]
        // and should be handled by condition 2
        break;
      }
      nodeOffset += nodeSize;
    }
    if (n) {
      cur = cur.firstChild;
      curOffset += 1;
    } else {
      curOffset += nodeOffset;
      cur = nextValidNode(cur);
    }
  }

  setCaretPosition(lastCaretPosition(root));
  return false;
}

/**
 * <p>in first in first in first in first
 * in second in second in second in second in <b>sec
 * ond</b> in thi|rd in third in third in third
 * </p>          ↑
 * <p>old old old| old old old old </p> 11
 * @param root
 * @param offset
 */
export function setCaretReletivePositionAtLastLine(
  root: HTMLElement,
  offset: number
) {
  const { lineNumber, lineHeight } = getLineInfo(root);
  if (lineNumber <= 1) {
    return setCaretReletivePosition(root, offset);
  }
  const range = document.createRange();
  // 获取最后一行的所有 contents
  var last = lastValidChild(root);
  while (last) {
    range.selectNode(last);
    if (Math.round(range.getBoundingClientRect().height / lineHeight) <= 1) {
      last = previousValidNode(last);
    } else {
      if (isTag(last, "#text")) {
        // TODO change to binery search
        range.setEnd(last, last.textContent.length);
        range.setStart(last, 0);
        var lineOffset = 0;
        while (
          Math.round(range.getBoundingClientRect().height / lineHeight) > 1
        ) {
          lineOffset++;
          range.setStart(last, lineOffset);
        }

        return setCaretReletivePosition(
          root,
          getCaretReletivePosition(root, last, lineOffset) + offset
        );
      } else {
        last = lastValidChild(last);
      }
    }
  }
}

export function getLineInfo(root: HTMLElement): {
  lineNumber: number;
  lineHeight: number;
  elHeight: number;
} {
  const range = document.createRange();
  range.selectNode(root);
  const rects = range.getClientRects();

  const xs = new Set();
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    xs.add(rect.y);
  }
  // const style = getComputedStyle(root);
  // const lineHeight = parseFloat(style.lineHeight.split(".")[0]);
  return {
    lineNumber: xs.size,
    lineHeight: rects[0].height,
    elHeight: root.offsetHeight,
  };
}

export function setCaretPosition(
  caretPos: CaretPosition,
  start: boolean = true,
  end: boolean = true,
  range?: Range
): Range {
  if (!caretPos) {
    return;
  }
  if (!range) {
    const sel = document.getSelection();
    range = sel.getRangeAt(0);
  }
  var offset = caretPos.offset;
  if (caretPos.offset === -1) {
    switch (getTagName(caretPos.container)) {
      case "#text":
        offset = caretPos.container.textContent.length;
        break;
      case "label":
        offset = 0;
        break;
      default:
        offset = caretPos.container.childNodes.length;
    }
  }
  if (start) {
    range.setStart(caretPos.container, offset);
  }

  if (end) {
    range.setEnd(caretPos.container, offset);
  }
  return range;
}
