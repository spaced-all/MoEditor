import React, { RefObject } from "react";
import produce from "immer";
import * as op from "../operation";
import * as BE from "../event/eventtype";

import { EventManager } from "../event/emitter";

import {
  findParentMatchTagName,
  isNodeIn,
  isTag,
  isValidTag,
  nextValidNode,
  validChildNodes,
} from "../operation";
import { BlockCaretEvent } from "../event/events";

export interface Dom {
  tagName: string;
  textContent?: string;
  attributes?: { [key: string]: string | number; level: number };
  children?: Dom[];
}

export interface Block {
  id?: number;
  order: string;
  type: string;
  [key: string]: any;
  data: {
    [key: string]: any;
    dom: Dom[];
    html?: string;
  };
}

export interface BlockRange {
  start: number;
  end: number;
}

export interface SectionBlock extends Block {
  level: number;
}

export interface ParagraphBlock extends Block {}
export interface BlockquoteBlock extends Block {}

export interface ListBlock extends Block {}

export interface BlockStates {
  html: string;
  contentEditable: boolean;
}

export interface BlockProps {
  data?: Block;
  uid: string;
  eventManager?: EventManager;
  initialContentEditable: boolean;
  initialPos?: { start: number; end: number };
  onShiftEnter?: (e: BE.KeyboardEvent<HTMLElement>) => void;
  onEnter?: (e: BE.KeyboardEvent<HTMLElement>) => void;
  onBlur?: (e: BE.FocusEvent<HTMLElement>) => void;
  onFocus?: (e: BE.FocusEvent<HTMLElement>) => void;
  onSelect?: (e: BE.SyntheticEvent<HTMLElement>) => void;
  onDataChange?: (e: BE.BlockEvent<HTMLElement>) => void;
  onMergeAbove?: (e: BE.KeyboardEvent<HTMLElement>) => void;
  onMergeBelow?: (e: BE.KeyboardEvent<HTMLElement>) => void;
  onJumpAbove?: (e: BE.KeyboardEvent<HTMLElement>) => void;
  onJumpToAboveEnd?: (e: BE.KeyboardEvent<HTMLElement>) => void;
  onJumpBelow?: (e: BE.KeyboardEvent<HTMLElement>) => void;
  onJumpToBelowStart?: (e: BE.KeyboardEvent<HTMLElement>) => void;
  onCaretMove?: (e: BE.CaretEvent<HTMLElement>) => void;
  onCaretMoveTo?: (e: BE.CaretEvent<HTMLElement>) => void;
  onAppendAbove?: (e: BE.BlockAppendEvent<HTMLElement>) => void;
  onAppendBelow?: (e: BE.BlockAppendEvent<HTMLElement>) => void;
  onSplitAbove?: (e: BE.BlockEvent<HTMLElement>) => void;
  onChangeBlockType?: (e: BE.BlockChangeEvent<HTMLElement>) => void;
  onComponentUpdate?: (e: BE.ComponentUpdatedEvent<HTMLElement>) => void;
}

export interface IBlock<
  P extends BlockProps,
  S extends BlockStates,
  E extends HTMLElement
> {
  props: P;
  state: S;
  ref: RefObject<E>;
  wrapBlockEvent<T extends BE.BlockEvent<E>>(e): T;
  handleBlur: (e) => void;
  handleFocus: (e) => void;
  handleSelect: (e) => void;
  handleDataChange: (e, data) => void;
  handleMergeAbove: (e) => void;
  handleMergeBelow: (e) => void;
  handleJumpAbove: (e) => void;
  handleJumpToAboveEnd: (e) => void;
  handleJumpBelow: (e) => void;
  handleJumpToBelowStart: (e) => void;
  handleInput: (e) => void;
  handleBackspace: (e: React.KeyboardEvent<E>) => void;
  handleDelete: (e: React.KeyboardEvent<E>) => void;
  handleShiftEnter: (e: React.KeyboardEvent<E>) => void;
  handleEnter: (e: React.KeyboardEvent<E>) => void;
  defaultHandleEnter: (e: React.KeyboardEvent<E>) => void;
  defaultHandleKeyup: (e: React.KeyboardEvent<E>) => void;
  defaultHandleKeyDown: (e) => void;
}

export function ContentEditable<T>(props: {
  tagName: string;
  children: React.ReactNode;
  innerRef: React.RefObject<T>;
  contentEditable: boolean;
  onInput: (...any) => any;
  onBlur: (...any) => any;
  onFocus: (...any) => any;
  onSelect: (...any) => any;
  onKeyDown: (...any) => any;
  onKeyUp: (...any) => any;
}) {
  return React.createElement(
    props.tagName,
    {
      ref: props.innerRef,
      contentEditable: props.contentEditable,
      onInput: props.onInput,
      onBlur: props.onBlur,
      onFocus: props.onFocus,
      onSelect: props.onSelect,
      onKeyDown: props.onKeyDown,
      onKeyUp: props.onKeyUp,
      tabIndex: -1,
      suppressContentEditableWarning: true,
    },
    props.children
  );
}

export class DefaultBlock<
    P extends BlockProps,
    S extends BlockStates,
    E extends HTMLElement
  >
  extends React.Component<P, S>
  implements IBlock<P, S, E>
{
  static defaultProps: BlockProps = {
    uid: "",
    initialContentEditable: false,
    onShiftEnter: (evt) => console.log(["onShiftEnter", evt]),
    onEnter: (evt) => console.log(["onEnter", evt]),
    onBlur: (evt) => console.log(["onBlur", evt]),
    onFocus: (evt) => console.log(["onFocus", evt]),
    onSelect: (evt) => console.log(["onSelect", evt]),
    onDataChange: (evt) => console.log(["onDataChange", evt]),
    onMergeAbove: (evt) => console.log(["onMergeAbove", evt]),
    onMergeBelow: (evt) => console.log(["onMergeBelow", evt]),
    onJumpAbove: (evt) => console.log(["onJumpAbove", evt]),
    onJumpToAboveEnd: (evt) => console.log(["onJumpToAboveEnd", evt]),
    onJumpBelow: (evt) => console.log(["onJumpBelow", evt]),
    onJumpToBelowStart: (evt) => console.log(["onJumpToBelowStart", evt]),
    onCaretMove: (evt) => console.log(["onCaretMove", evt]),
    onAppendAbove: (evt) => console.log(["onAppendAbove", evt]),
    onAppendBelow: (evt) => console.log(["onAppendBelow", evt]),
    onSplitAbove: (evt) => console.log(["onSplitAbove", evt]),
    onCaretMoveTo: (evt) => console.log(["onCaretMoveTo", evt]),
    onComponentUpdate: (evt) => console.log(["onCaretMoveTo", evt]),
  };

  ref: RefObject<E>;
  constructor(props: P) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      html: "",
      contentEditable: this.props.initialContentEditable,
    } as S;

    this.handleShiftEnter = this.handleShiftEnter.bind(this);
    this.defaultHandleEnter = this.defaultHandleEnter.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleDataChange = this.handleDataChange.bind(this);
    this.handleMergeAbove = this.handleMergeAbove.bind(this);
    this.handleMergeBelow = this.handleMergeBelow.bind(this);
    this.handleJumpAbove = this.handleJumpAbove.bind(this);
    this.handleJumpToAboveEnd = this.handleJumpToAboveEnd.bind(this);
    this.handleJumpBelow = this.handleJumpBelow.bind(this);
    this.handleJumpToBelowStart = this.handleJumpToBelowStart.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.defaultHandleKeyDown = this.defaultHandleKeyDown.bind(this);
    this.defaultHandleKeyup = this.defaultHandleKeyup.bind(this);
    this.defaultHandleEnter = this.defaultHandleEnter.bind(this);
  }
  setEeditable = (flag) => {
    if (this.ref.current) {
      if (flag) {
        this.ref.current.contentEditable = "true";
        this.ref.current.focus();
      } else {
        this.ref.current.contentEditable = "false";
      }
    }
  };
  handleComponentEvent = (evt) => {
    switch (evt.name) {
      case "moveTo":
        this.setEeditable(true);
        var caretPos;
        var setLast = false;

        if (evt.data.type) {
          switch (evt.data.type) {
            case "last":
              caretPos = op.lastCaretPosition(this.ref.current);
              break;
            case "fisrt":
              caretPos = op.firstCaretPosition(this.ref.current);
              break;
            case "history":
              // TODO 为了确保 focus 时 expand 的长度不影响移动，试试先 unexpand 再移动
              this.props.eventManager.call("boundhint", {
                data: {},
                name: "unexpand",
              });
              if (evt.data.from == "below") {
                setLast = op.setCaretReletivePositionAtLastLine(
                  this.ref.current,
                  evt.data.offset
                );
              } else {
                setLast = op.setCaretReletivePosition(
                  this.ref.current,
                  evt.data.offset
                );
              }
              caretPos = op.currentCaretPosition(this.ref.current);
              break;
          }

          const event = new BlockCaretEvent(
            this.state.html,
            this.ref.current,
            caretPos
          );
          if (setLast) {
            event.offset = evt.data.offset;
          }
          op.setCaretPosition(caretPos);
          this.props.onCaretMove(event);
        }
        break;
      case "innerHTML":
        return op.validInnerHTML(this.ref.current);

      case "endCaretOffset":
        caretPos = this.lastCaretPosition(this.ref.current);
        return op.getCaretReletivePosition(
          this.ref.current,
          caretPos.container,
          caretPos.offset
        );
      // return op.validInnerHTML(this.ref.current);
      // return this.ref.current.innerHTML;
    }
  };
  componentDidMount(): void {
    console.log([this.props.uid, this.ref.current]);
    if (this.props.initialContentEditable) {
      this.ref.current.focus();
    }
    if (this.props.eventManager) {
      this.props.eventManager.on(this.props.uid, this.handleComponentEvent);
    }
  }
  componentDidUpdate(prevProps: Readonly<P>): void {
    if (this.props.initialContentEditable) {
      this.ref.current.focus();
    }
  }

  wrapBlockEvent<T extends BE.BlockEvent<E>>(e): T {
    e["html"] = this.state.html;
    e["ref"] = this.ref.current;
    return e;
  }

  handleBlur(e) {
    const newE = this.wrapBlockEvent<BE.FocusEvent<E>>(e);
    // this.ref.current.contentEditable = "false";
    this.setEeditable(false);
    this.props.onBlur(newE);
  }
  handleFocus(e) {
    const newE = this.wrapBlockEvent<BE.FocusEvent<E>>(e);
    // debugger
    if (this.ref.current) {
      this.ref.current.contentEditable = "true";
    }
    this.props.onFocus(newE);
  }

  handleSelect(e) {
    const newE = this.wrapBlockEvent<BE.SyntheticEvent<E>>(e);

    const caretPos = op.currentCaretPosition(this.ref.current);
    const event = new BlockCaretEvent(
      this.state.html,
      this.ref.current,
      caretPos,
      "left"
    );
    this.props.onSelect(newE);
    this.props.onCaretMove(event);
  }

  handleDataChange(e, data) {
    var newE = this.wrapBlockEvent<BE.SyntheticEvent<E>>(e);
    newE.html = data;
    this.props.onDataChange(newE);
    e.preventDefault();
  }

  handleMergeAbove(e) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<E>>(e);
    this.props.onMergeAbove(newE);
    e.preventDefault();
  }
  handleMergeBelow(e) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<E>>(e);
    this.props.onMergeBelow(newE);
    e.preventDefault();
  }
  handleJumpAbove(e) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<E>>(e);
    this.props.onJumpAbove(newE);
    e.preventDefault();
  }
  handleJumpToAboveEnd(e) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<E>>(e);
    this.props.onJumpToAboveEnd(newE);
    e.preventDefault();
  }
  handleJumpBelow(e) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<E>>(e);
    this.props.onJumpBelow(newE);
    e.preventDefault();
  }
  handleJumpToBelowStart(e) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<E>>(e);
    this.props.onJumpToBelowStart(newE);
    e.preventDefault();
  }

  handleInput(e) {
    const nextState = produce(this.state, (draft: S) => {
      draft.html = this.ref.current.innerHTML;
    });
    this.setState(nextState);
    this.handleDataChange(e, nextState.html);
    e.preventDefault();
  }
  handleBackspace = (e: React.KeyboardEvent<E>) => {};
  defaultHandleBackspace = (e: React.KeyboardEvent<E>) => {
    var tag;
    if ((tag = op.isInStyleBound(this.ref.current, "left"))) {
      const style = op.tagToStyle(tag);
      if (style) {
        op.deleteStyle(tag);
        this.props.eventManager.call("boundhint", {
          name: "expand",
          data: { force: true },
        });
        e.preventDefault();
      }
      return;
    }
    this.handleBackspace(e);
  };
  handleDelete = (e: React.KeyboardEvent<E>) => {
    console.log(["unimplemented", "handleDelete", e]);
    e.preventDefault();
  };
  defaultHandleDelete = (e: React.KeyboardEvent<E>) => {
    var tag;
    if ((tag = op.isInStyleBound(this.ref.current, "right"))) {
      const style = op.tagToStyle(tag);
      if (style) {
        op.deleteStyle(tag);
        this.props.eventManager.call("boundhint", {
          name: "expand",
          data: { force: true },
        });
        e.preventDefault();
      }
      return;
    } else if (this.isCursorRight()) {
      this.props.onMergeBelow(this.wrapBlockEvent<BE.KeyboardEvent<E>>(e));
      e.preventDefault();
    }
    this.handleBackspace(e);
  };
  handleSpace = (e: React.KeyboardEvent<E>) => {};
  handleShiftEnter = (e: React.KeyboardEvent<E>) => {
    op.insertNode(this.ref.current, document.createElement("br"), "right");
  };
  handleEnter = (e: React.KeyboardEvent<E>) => {
    // const newE = this.wrapBlockEvent<BE.KeyboardEvent<E>>(e);
    this.props.onAppendBelow({
      ref: this.ref.current,
      html: "",
      innerHTML: "",
      type: "paragraph",
    });
  };
  defaultHandleEnter(e: React.KeyboardEvent<E>) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<E>>(e);
    if (op.isCursorRight(this.ref.current)) {
      this.props.onAppendBelow({
        ref: this.ref.current,
        html: "",
        innerHTML: "",
        type: "paragraph",
      });
      e.preventDefault();
    } else if (op.isCursorLeft(this.ref.current)) {
      this.props.onAppendAbove({
        ref: this.ref.current,
        html: "",
        innerHTML: "",
        type: "paragraph",
      });
      e.preventDefault();
    } else {
      this.handleEnter(e);
    }
  }

  defaultHandleKeyup(e: React.KeyboardEvent<E>) {
    // 作用只是在 上下键按出后，重新定位 BoundHint，不涉及对光标本身的操作，所有对光标本身的操作，都在 KeyDown 时完成
    console.log(["KeyUp", e.key]);
    if (e.key.match("Arrow")) {
      const direction = e.key.match("ArrowRight") ? "right" : "left";
      const caretPos = op.currentCaretPosition(this.ref.current);
      const event = new BlockCaretEvent(
        this.state.html,
        this.ref.current,
        caretPos,
        direction
      );
      this.props.onCaretMove(event);
      e.preventDefault();
    }
  }

  defaultHandleArrowKeyDown = (e: React.KeyboardEvent<E>) => {
    // 只移动光标，不用管 BoundHint
    const root = this.ref.current;
    if (e.key == "ArrowUp") {
      if (op.isFirstLine(root)) {
        this.handleJumpAbove(e);
      }
    } else if (e.key == "ArrowDown") {
      if (op.isLastLine(root)) {
        this.handleJumpBelow(e);
      }
    } else if (e.key == "ArrowLeft") {
      if (this.isCursorLeft()) {
        this.handleJumpToAboveEnd(e);
      } else {
        if (e.altKey) {
        } else {
          const caretPos = op.previousCaretPosition(root);
          if (e.shiftKey) {
            op.setCaretPosition(caretPos, true, false);
          } else {
            op.setCaretPosition(caretPos);
          }
          e.preventDefault();
        }
      }
    } else if (e.key == "ArrowRight") {
      if (this.isCursorRight()) {
        this.handleJumpToBelowStart(e);
      } else {
        if (e.altKey) {
        } else if (e.shiftKey) {
        } else {
          const caretPos = op.nextCaretPosition(root);
          op.setCaretPosition(caretPos);
          e.preventDefault();
        }
      }
    }
  };

  isCursorLeft = (): boolean => {
    return op.isCursorLeft(this.ref.current);
  };

  isCursorRight = (): boolean => {
    return op.isCursorRight(this.ref.current);
  };

  isFirstLine = op.isFirstLine;
  isLastLine = op.isLastLine;

  firstCaretPosition = op.firstCaretPosition;
  lastCaretPosition = op.lastCaretPosition;

  handleTab = (e: React.KeyboardEvent<E>) => {
    const caretPos = op.currentCaretPosition(this.ref.current);
  };
  defaultHandleKeyDown(e) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<E>>(e);
    if (e.key === "Enter") {
      if (e.shiftKey) {
        this.handleShiftEnter(e);
      } else {
        this.defaultHandleEnter(e);
      }
    } else if (e.code == "Space") {
      this.handleSpace(e);
    } else if (e.key == "Tab") {
      this.handleTab(e);
    } else if (e.key == "Backspace") {
      // backspace -> defaultHandleBackspace ->  default(delete one char)
      // backspace -> defaultHandleBackspace ->  mergeAbove
      // backspace -> defaultHandleBackspace ->  changeBlockType
      // backspace -> defaultHandleBackspace ->  deleteStyle
      this.defaultHandleBackspace(e);
    } else if (e.key == "Delete") {
      this.defaultHandleDelete(e);
    } else if (e.key == "Home") {
      const caretPos = this.firstCaretPosition(newE.ref);
      op.setCaretPosition(caretPos);
      const event = new BlockCaretEvent(
        this.state.html,
        this.ref.current,
        caretPos,
        "left"
      );
      this.props.onCaretMove(event);
      e.preventDefault();
    } else if (e.key == "End") {
      const caretPos = this.lastCaretPosition(newE.ref);
      op.setCaretPosition(caretPos);

      const event = new BlockCaretEvent(
        this.state.html,
        this.ref.current,
        caretPos,
        "left"
      );
      this.props.onCaretMove(event);
      e.preventDefault();
    } else if (e.key == "Delete") {
      if (op.isCursorRight(newE.ref)) {
        this.handleMergeBelow(e);
      }
    } else if (e.key.match("Arrow")) {
      this.defaultHandleArrowKeyDown(e);
    } else {
      if (e.metaKey) {
        if (op.supportStyleKey(e.key)) {
          op.applyStyle(e.key, this.ref.current);

          this.props.eventManager.call("boundhint", {
            name: "expand",
            data: { force: true },
          });
          e.preventDefault();
          return;
        }
      }
      console.log(e);
    }
  }
}
