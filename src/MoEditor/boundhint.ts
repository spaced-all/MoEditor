import { Caret, Position } from "./types";
import * as op from "./utils";
import React, { useDebugValue } from "react";

const whiteSpace = "";

const leftTag = {
  // 'p': "",
  // 'td': "'",
  // 'li': "",
  a: "[",
  b: "**",
  i: "*",
  s: "~",
  u: "\u00a0",
  code: "`",
  // 'span': " ",
  // 'h1': '\u00a0',
  // 'h2': '\u00a0',
  // 'h3': '\u00a0',
  // 'h4': '\u00a0',
  // 'h5': '\u00a0',
  default: "\u00a0",
};

const rightTag = {
  // 'p': "\u00a0",
  // 'li': "",
  // 'td': "'",
  a: "]",
  b: "**",
  i: "*",
  s: "~",
  u: "\u00a0",
  // 'ul': '',
  // 'ol': '',
  code: "`",
  // 'span': " ",
  // 'h1': '\u00a0',
  // 'h2': '\u00a0',
  // 'h3': '\u00a0',
  // 'h4': '\u00a0',
  // 'h5': '\u00a0',
  default: "\u00a0",
};

function createSpan(...className: string[]) {
  const span = document.createElement("span");
  className.forEach((item) => span.classList.add(item));
  return span;
}

export class ABCBoundHint {
  hintStyle(el: HTMLElement) {}
  hintSpace(el: Text) {}
  _safeOffset(
    container: Node,
    offset: number,
    type: "left" | "right" | "inner" = "inner"
  ) {}
  safeMousePosition() {}
  safePosition(pos: Position) {}
  autoUpdate(kwargs) {}
  _removeElementl(...el: HTMLElement[]) {}
  removeText() {}
  remove() {}
}

export type BoundHintType<T extends ABCBoundHint> = T;

export class CodeBoundHint extends ABCBoundHint {}
/**
 * to display current user caret element bound
 */
export class BoundHint extends ABCBoundHint {
  ref: Node;
  left: HTMLSpanElement;
  right: HTMLSpanElement;
  blockRight: HTMLSpanElement;

  leftText: HTMLSpanElement;
  rightText: HTMLSpanElement;
  text: Text;
  disable: boolean;
  label: HTMLLabelElement;
  static _instance = null;

  constructor() {
    super();
    this.disable = false;
    this.blockRight = createSpan("bount-hint-block-right", "bound-hint");
    // this.blockRight.textContent = "\u00a0";
    this.left = createSpan("bound-hint-left", "bound-hint");
    this.right = createSpan("bound-hint-right", "bound-hint");
    this.leftText = createSpan(
      "bound-hint-left",
      "bound-hint",
      "bound-hint-text"
    );
    this.leftText.textContent = "\u00a0";
    this.rightText = createSpan(
      "bound-hint-right",
      "bound-hint",
      "bound-hint-text"
    );
    this.rightText.textContent = "\u00a0";
    this.label = null;
    this.text = op.makeText(" ");
    this.ref = null;
    if (BoundHint._instance) {
      return BoundHint._instance;
    }
    BoundHint._instance = this;
  }

  isBoundhint(el: HTMLElement) {
    return op.isTag(el, "span") && el.classList.contains("bound-hint");
  }
  bind() {
    this.disable = false;
  }
  unbind() {
    this.disable = true;
    this.remove();
  }

  /**
   * **bold *italic*| **
   * **bold italic  | **
   *  ↑            ↑   ↑
   * style        space
   * hint         hint
   */
  hintStyle(el: HTMLElement) {
    const styleName = op.getTagName(el);
    if (leftTag[styleName]) {
      this.left.textContent = leftTag[styleName];
      this.right.textContent = rightTag[styleName];
      el.insertBefore(this.left, el.firstChild);
      el.appendChild(this.right);
      console.log([this.left.textContent, el]);
    } else {
      this._removeElementl(this.left, this.right);
    }
  }
  hintSpace(el: Text) {
    const left = op.firstNeighborTextNode(el);
    const right = op.lastNeighborTextNode(el);
    // console.log([left.textContent, right.textContent]);
    if (op.previousValidNode(left) && left.previousSibling !== this.left) {
      left.parentElement.insertBefore(this.leftText, left);
    } else {
      this._removeElementl(this.leftText);
    }

    if (op.nextValidNode(right) && right.nextSibling !== this.right) {
      right.parentElement.insertBefore(this.rightText, right.nextSibling);
    } else {
      this._removeElementl(this.rightText);
    }
  }

  _safeOffset(
    container: Node,
    offset: number,
    type: "left" | "right" | "inner" = "inner"
  ) {
    let newContainer, newOffset;
    if (op.isTag(container, "#text") || op.isTag(container, "label")) {
      return { container, offset };
    }

    newOffset = 0;
    if (!container.childNodes[offset]) {
      if (op.isTag(op.lastValidChild(container), "#text")) {
        newContainer = op.lastValidChild(container);
        newOffset = newContainer.textContent.length;
      } else {
        // if(ty
        while (!container.childNodes[offset]) {
          newContainer = op.makeText(whiteSpace);
          container.appendChild(newContainer);
        }
      }
    } else {
      if (!op.isTag(container.childNodes[offset], "#text")) {
        newContainer = op.makeText(whiteSpace);
        container.insertBefore(newContainer, container.childNodes[offset]);
      } else {
        newContainer = container.childNodes[offset];
        newOffset = 0;
      }
      // (!op.isTag(container.childNodes[offset], "#text"))
    }
    return {
      container: newContainer,
      offset: newOffset,
    };
  }
  safeMouseClick(root: HTMLElement) {
    const rightEl = op.lastValidChild(root, {
      emptyText: false,
      whiteText: false,
    });
    if (op.isTag(rightEl, "label")) {
      root.appendChild(this.blockRight);
    }
  }
  safeMousePosition() {
    if (this.disable) {
      return;
    }

    const sel = document.getSelection();

    if (!sel || sel.rangeCount === 0) {
      return false;
    }

    const range = sel.getRangeAt(0);
    if (
      range.startContainer === range.endContainer &&
      range.startOffset === range.endOffset
    ) {
      const container = range.startContainer;
      const offset = range.startOffset;

      if (op.isTag(container, "#text")) {
        if (!this.isBoundhint(container.parentElement)) {
          return true;
        }

        let newContainer = container.parentElement as Node;
        let newPos: Position;
        if (newContainer === this.right || newContainer === this.rightText) {
          if (offset === this.right.textContent.length) {
            newPos = op.nextValidPosition(
              newContainer.parentElement.parentElement,
              newContainer.parentElement,
              newContainer.parentElement.childNodes.length
            );
          } else {
            newContainer = op.previousValidNode(newContainer);
            newPos = new Position(
              newContainer,
              newContainer.textContent.length
            );
          }
        } else if (
          newContainer === this.left ||
          newContainer === this.leftText
        ) {
          if (offset === 0) {
            newPos = op.previousValidPosition(
              newContainer.parentElement.parentElement,
              newContainer.parentElement,
              0
            );
          } else {
            newContainer = op.nextValidNode(newContainer);
            newPos = new Position(newContainer, 0);
          }
        } else if (newContainer === this.blockRight) {
          newPos = op.nextValidPosition(
            newContainer.parentElement.parentElement,
            newContainer.parentElement,
            0
          );
        }

        newPos = this.safePosition(newPos);
        console.log(newPos);
        range.setStart(newPos.container, newPos.offset);
        range.setEnd(newPos.container, newPos.offset);
      } else if (this.isBoundhint(container as HTMLElement)) {
        const pos = op.previousValidPosition(
          container.parentElement,
          container,
          0
        );
        console.log(pos);
        range.setStart(pos.container, pos.offset);
        range.setEnd(pos.container, pos.offset);
      } else {
        const { container: newContainer, offset: newOffset } = this._safeOffset(
          container,
          offset
        );

        range.setStart(newContainer, newOffset);
        range.setEnd(newContainer, newOffset);
      }
    }
    return true;
  }

  safePosition(pos: Position): Position {
    if (this.disable) {
      return;
    }
    const { container, offset } = pos;
    const { container: newContainer, offset: newOffset } = this._safeOffset(
      container,
      offset
    );

    return new Position(newContainer, newOffset, pos.root);
  }

  hintElement(el: HTMLElement) {
    this.hintStyle(el);
  }

  autoUpdate(kwargs?: {
    force?: boolean;
    root: HTMLElement;
    click?: boolean;
    enter?: boolean;
    mouseEvent?: React.MouseEvent;
    keyboardEvent?: React.KeyboardEvent;
  }) {
    if (this.disable) {
      return;
    }
    const { force, root, click, enter } = kwargs || {};
    const sel = document.getSelection();
    if (!sel || sel.rangeCount === 0) {
      this.remove();
      return;
    }
    var el: Node;
    var multiSelect = false;
    var offset = 0;

    const range = sel.getRangeAt(0);
    if (
      range.startContainer === range.endContainer &&
      range.startOffset === range.endOffset
    ) {
      el = range.startContainer;
      offset = range.startOffset;
      const { container, offset: newOffset } = this._safeOffset(el, offset);
      el = container;
      offset = newOffset;
    } else {
      el = range.commonAncestorContainer;
      // const { container: startContainer, offset: startOffset } =
      //   this._safeOffset(range.startContainer, range.startOffset);

      const { container: startContainer, offset: startOffset } =
        this._safeOffset(sel.anchorNode, sel.anchorOffset);
      const { container: endContainer, offset: endOffset } = this._safeOffset(
        sel.focusNode,
        sel.focusOffset
      );
      sel.setBaseAndExtent(
        startContainer,
        startOffset,
        endContainer,
        endOffset
      );
      // range.setStart(startContainer, startOffset);
      // range.setEnd(endContainer, endOffset);
      multiSelect = true;
    }

    if (el === this.ref && !force) {
      return;
    }

    let pl = op.findParentMatchTagName(el, "label", root) as HTMLLabelElement;
    if (pl) {
      // focusNode is label

      const pos = op.createPosition(root as HTMLElement, pl, 0);
      op.setPosition(pos);
      console.log(pos);
      this.remove();
      this.ref = pl;
      this.label = pl;
      return;
    } else if (this.label) {
      this.label.classList.remove("inline-key-hovered");
      this.label.classList.remove("inline-hovered");
    }

    if (!op.isTag(el, "#text")) {
      el = el.childNodes[offset];
    }

    this.hintStyle(el.parentElement);
    if (!multiSelect) {
      this.hintSpace(el as Text);
    } else {
      this.removeText();
    }
    this.ref = el;
  }

  _removeElementl(...el: HTMLElement[]) {
    el.forEach((item) => {
      if (item.parentElement) {
        item.remove();
      }
    });
  }

  removeText() {
    this._removeElementl(this.leftText, this.rightText);
  }

  remove() {
    this._removeElementl(this.left, this.right, this.leftText, this.rightText);
    this.ref = null;
    if (this.text.textContent.trim() === "" && this.text.parentElement) {
      this.text.parentElement.removeChild(this.text);
    } else {
      this.text = op.makeText("");
    }
  }
}

/**
 * to display other user position
 */
export class CaretHint {}
