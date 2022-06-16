import React, { RefObject } from "react";
import * as op from "../operation";
import * as BE from "../event/eventtype";

import { EventManager } from "../event/emitter";
import { BlockCaretEvent } from "../event/events";

import { NestRender } from "./render";
import "./Common.css"

export interface Dom {
  tagName: string;
  inner?: boolean;
  textContent?: string;
  attributes?: {
    [key: string]: string | number | boolean;
    mark?: boolean;
    level?: number;
  };
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

export interface ParagraphBlock extends Block { }
export interface BlockquoteBlock extends Block { }

export interface ListBlock extends Block { }

export interface BlockStates {
  html: string;
  jumpRef?: JumpRef;
  contentEditable: boolean;
  data?: Block;
  dirty?: boolean;
  focused: boolean
}

export interface JumpRef {
  offset?: number;
  from?: "below" | "above";
  // Arrow up/down makes jump / Arrow left/right makes neighbor, click makes mouse
  type: "neighbor" | "jump" | "mouse";
}

export interface BlockProps {
  data?: Block;
  uid: string;
  className?: string,
  selected?: boolean,
  selectionMode?: boolean,
  eventManager?: EventManager;
  initialContentEditable: boolean;
  historyOffset?: number;
  jumpRef?: JumpRef;
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
  onSelectBlock?: (e: BE.BlockEvent<HTMLElement>) => void;
  onMouseSelect?: (e: BE.MouseEvent<HTMLElement>) => void;
  onMouseEnter?: (e: BE.MouseEvent<HTMLElement>) => void;
}

export interface IBlock<
  P extends BlockProps,
  S extends BlockStates,
  O extends HTMLElement,
  I extends HTMLElement
  > {
  props: P;
  state: S;
  ref: RefObject<HTMLDivElement>;
  wrapBlockEvent<T extends BE.BlockEvent<O>>(e): T;
  handleBlur: (e) => void;
  handleFocus: (e) => void;
  handleSelect: (e) => void;
  handleDataChange: (e, data) => void;
  handleMergeAbove: (e) => void;
  handleMergeBelow: (e) => void;
  handleJumpToAbove: (e: React.KeyboardEvent<I>) => void;
  handleJumpToLeft: (e: React.KeyboardEvent<I>) => void;
  handleJumpToBelow: (e: React.KeyboardEvent<I>) => void;
  handleJumpToRight: (e: React.KeyboardEvent<I>) => void;
  handleInput: (e) => void;
  handleBackspace: (e: React.KeyboardEvent<I>) => void;
  handleDelete: (e: React.KeyboardEvent<I>) => void;
  handleShiftEnter: (e: React.KeyboardEvent<I>) => void;
  handleEnter: (e: React.KeyboardEvent<I>) => void;
  defaultHandleKeyup: (e: React.KeyboardEvent<I>) => void;
  defaultHandleKeyDown: (e: React.KeyboardEvent<I>) => void;
}

export function ContentEditable<T>(props: {
  tagName: string;
  className?: string;
  children: React.ReactNode;
  innerRef?: React.RefObject<T>;
  contentEditable: boolean;
  placeholder?: string;
  onInput?: (...any) => any;
  onChange?: (...any) => any;
  onBlur?: (...any) => any;
  onFocus?: (...any) => any;
  onSelect?: (...any) => any;
  onKeyDown?: (...any) => any;
  onKeyUp?: (...any) => any;
  onMouseMove?: (...any) => any;
  onMouseEnter?: (...any) => any;
  onMouseLeave?: (...any) => any;
  onMouseDown?: (...any) => any;
  onMouseUp?: (...any) => any;
  onCopy?: (...any) => any;
  onPaste?: (...any) => any;
}) {
  return React.createElement(
    props.tagName,
    {
      ref: props.innerRef,
      contentEditable: props.contentEditable,
      className: props.className,
      'data-placeholder': props.placeholder,
      onInput: props.onInput,
      onChange: props.onChange,
      onBlur: props.onBlur,
      onFocus: props.onFocus,
      onSelect: props.onSelect,
      onKeyDown: props.onKeyDown,
      onKeyUp: props.onKeyUp,
      tabIndex: -1,
      onCopy: props.onCopy,
      onPaste: props.onPaste,
      onMouseMove: props.onMouseMove,
      onMouseEnter: props.onMouseEnter,
      onMouseLeave: props.onMouseLeave,
      onMouseDown: props.onMouseDown,
      onMouseUp: props.onMouseUp,
      suppressContentEditableWarning: true,
    },
    props.children
  );
}

export class DefaultBlock<
  P extends BlockProps,
  S extends BlockStates,
  O extends HTMLElement, // outer block element type
  I extends HTMLElement // inner block element type
  >
  extends React.Component<P, S>
  implements IBlock<P, S, O, I>
{


  protected get contentEditableName(): string {
    return "p"
  }

  protected get className(): string {
    return null
  }

  protected get multiContainer(): boolean {
    return false
  }

  static supportTags = []
  static supportType = null
  static html2block = (html: string): Block => {
    throw new Error("not implemented");
  }


  static defaultProps: BlockProps = {
    uid: "",
    selected: false,
    initialContentEditable: false,
    selectionMode: false,
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
    onSelectBlock: (evt) => console.log(['onSelectBlock', evt]),
    onMouseSelect: (evt) => console.log(['onUnSelectBlock', evt]),
  };

  ref: RefObject<HTMLDivElement>;
  editableRootRef: RefObject<O>; // contentEditable element
  constructor(props: P) {
    super(props);
    this.ref = React.createRef();
    this.editableRootRef = React.createRef();
    this.state = {
      html: "",
      jumpRef: this.props.jumpRef,
      contentEditable: this.props.initialContentEditable,
      focused: false,
      data: this.props.data,
      dirty: false,
    } as S;

    this.handleShiftEnter = this.handleShiftEnter.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleDataChange = this.handleDataChange.bind(this);
    this.handleMergeAbove = this.handleMergeAbove.bind(this);
    this.handleMergeBelow = this.handleMergeBelow.bind(this);
    this.handleJumpToAbove = this.handleJumpToAbove.bind(this);
    this.handleJumpToLeft = this.handleJumpToLeft.bind(this);
    this.handleJumpToBelow = this.handleJumpToBelow.bind(this);
    this.handleJumpToRight = this.handleJumpToRight.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.defaultHandleKeyDown = this.defaultHandleKeyDown.bind(this);
    this.defaultHandleKeyup = this.defaultHandleKeyup.bind(this);
  }
  latestData() {
    return this.props.data;
  }
  updateData(data: Block) {
    this.setState({ data: data, dirty: true });
  }

  setEeditable = (flag) => {
    if (this.editableRoot()) {
      if (flag) {
        // this.editableRoot().contentEditable = "true";
        this.editableRoot().focus();
      } else {
        // this.editableRoot().contentEditable = "false";
      }
    }
  };

  serialize(): Dom[] {
    // return [this.outerRoot()];
    return [];
  }


  handleComponentEvent = (evt) => {
    switch (evt.name) {
      case "innerHTML":
        return op.validInnerHTML(this.currentContainer());

      case "endCaretOffset":
        const caretPos = this.lastCaretPosition(this.currentContainer());
        return op.getCaretReletivePosition(
          this.currentContainer(),
          caretPos.container,
          caretPos.offset
        );
      case "serialize":
        return this.serialize();
      // return op.validInnerHTML(this.currentRoot());
      // return this.currentRoot().innerHTML;
    }
  };
  componentDidMount(): void {
    if (this.props.initialContentEditable) {
      this.editableRoot().focus();
    }
    if (this.props.eventManager) {
      this.props.eventManager.on(this.props.uid, this.handleComponentEvent);
    }
  }
  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot?: any
  ): void {
    const outerRoot = this.blockRoot()
    const editorRoot = this.editableRoot()
    if (outerRoot) {
      if (this.props.initialContentEditable) {
        editorRoot.focus();
      }
      if (this.props.selectionMode && this.props.selected) {
        outerRoot.classList.add('block-selected')
      } else {
        outerRoot.classList.remove('block-selected')
      }
    }
  }

  currentContainer = (): I => {
    return this.editableRootRef.current as unknown as I;
  };
  firstContainer = (): I => {
    return this.editableRootRef.current as unknown as I;
  };
  lastContainer = (): I => {
    return this.editableRootRef.current as unknown as I;
  };
  editableRoot = (): O => {
    return this.editableRootRef.current
  };

  blockRoot = (): HTMLDivElement => {
    return this.ref.current
  }

  wrapBlockEvent<T extends BE.BlockEvent<O>>(e): T {
    e["html"] = this.state.html;
    e["ref"] = this.editableRoot();
    return e;
  }

  handleBlur(e) {
    const newE = this.wrapBlockEvent<BE.FocusEvent<O>>(e);
    this.setEeditable(false);
    this.props.onBlur(newE);
  }

  handleFocus(e) {
    // focusEvent will triggered with mouseDown,
    // but the focusNode/Offset will changed with mouseUp
    const newE = this.wrapBlockEvent<BE.FocusEvent<O>>(e);
    const { jumpRef } = this.props;
    if (this.editableRoot()) {
      // this.editableRoot().contentEditable = "true";
    }

    // debugger
    if (jumpRef) {
      var caretPos;
      var innerRoot;
      var setLast = false;
      switch (jumpRef.type) {
        case "jump":
          this.props.eventManager.call("boundhint", {
            data: {},
            name: "unexpand",
          });
          if (jumpRef.from === "below") {
            innerRoot = this.lastContainer()
            setLast = op.setCaretReletivePositionAtLastLine(
              innerRoot,
              jumpRef.offset
            );
          } else {
            innerRoot = this.firstContainer()
            setLast = op.setCaretReletivePosition(
              innerRoot,
              jumpRef.offset
            );
          }
          caretPos = op.currentCaretPosition(this.currentContainer());
          break;
        case "neighbor":
          if (jumpRef.from === "above") {
            innerRoot = this.firstContainer()
            caretPos = op.firstCaretPosition(innerRoot);
          } else {
            innerRoot = this.lastContainer()
            caretPos = op.lastCaretPosition(innerRoot);
          }
          break;
        case "mouse":
          innerRoot = this.currentContainer()
          caretPos = op.currentCaretPosition(innerRoot);
          break;
      }

      const event = new BlockCaretEvent(
        this.state.html,
        innerRoot,
        caretPos
      );
      op.setCaretPosition(caretPos);
      if (setLast) {
        event.offset = jumpRef.offset;
      }
      this.props.onCaretMove(event);
    } else {
      const caret = op.firstCaretPosition(this.firstContainer());
      op.setCaretPosition(caret);
    }

    this.props.onFocus(newE);
  }

  handleSelect(e) {
    const newE = this.wrapBlockEvent<BE.SyntheticEvent<O>>(e);

    const caretPos = op.currentCaretPosition(this.currentContainer());
    const event = new BlockCaretEvent(
      this.state.html,
      this.currentContainer(),
      caretPos,
      "left"
    );
    this.props.onSelect(newE);
    this.props.onCaretMove(event);
  }

  handleDataChange(e, data) {
    // var newE = this.wrapBlockEvent<BE.SyntheticEvent<O>>(e);
    // newE.html = data;
    // this.props.onDataChange(newE);
    e.preventDefault();
  }

  handleMergeAbove(e) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<O>>(e);
    this.props.onMergeAbove(newE);
    e.preventDefault();
  }

  handleMergeBelow(e) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<O>>(e);
    this.props.onMergeBelow(newE);
    e.preventDefault();
  }

  handleJumpToAbove(e: React.KeyboardEvent<I>) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<O>>(e);
    this.props.onJumpAbove(newE);
    e.preventDefault();
  }

  handleJumpToLeft(e: React.KeyboardEvent<I>) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<O>>(e);
    this.props.onJumpToAboveEnd(newE);
    e.preventDefault();
  }

  handleJumpToBelow(e: React.KeyboardEvent<I>) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<O>>(e);
    this.props.onJumpBelow(newE);
    e.preventDefault();
  }

  handleJumpToRight(e: React.KeyboardEvent<I>) {
    const newE = this.wrapBlockEvent<BE.KeyboardEvent<O>>(e);
    this.props.onJumpToBelowStart(newE);
    e.preventDefault();
  }

  handleInput(e) {
    // debugger
    // e.preventDefault();
    const sel = document.getSelection()
    const tag = sel.focusNode.parentElement
    if (op.isTag(tag, 'span') && tag.classList.contains('bound-hint')) {
      const right = sel.focusNode.textContent.slice(-1)
      const left = sel.focusNode.textContent.slice(-0, -1)
      tag.textContent = left
      const newText = document.createTextNode(right)
      tag.parentElement.insertBefore(newText, tag.nextSibling)
      op.setCaretPosition(op.lastCaretPosition(newText))
    }
  }

  handleBackspace(e: React.KeyboardEvent<I>) {

  }

  defaultHandleBackspace = (e: React.KeyboardEvent<I>) => {
    var tag;
    // debugger
    if ((tag = op.isInStyleBound(this.currentContainer(), "left"))) {
      const style = op.tagToStyle(tag);
      if (style) {
        op.deleteStyle(tag, this.currentContainer());
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
  handleDelete(e: React.KeyboardEvent<I>) {
    console.log(["unimplemented", "handleDelete", e]);
    e.preventDefault();
  }
  defaultHandleDelete(e: React.KeyboardEvent<I>) {
    var tag;
    if ((tag = op.isInStyleBound(this.currentContainer(), "right"))) {
      const style = op.tagToStyle(tag);
      if (style) {
        op.deleteStyle(tag, this.currentContainer());
        this.props.eventManager.call("boundhint", {
          name: "expand",
          data: { force: true },
        });
        e.preventDefault();
      }
      return;
    } else if (this.isCursorRight()) {
      this.props.onMergeBelow(this.wrapBlockEvent<BE.KeyboardEvent<O>>(e));
      e.preventDefault();
    }
    this.handleBackspace(e);
  }
  handleSpace(e: React.KeyboardEvent<I>) { }
  handleShiftEnter(e: React.KeyboardEvent<I>) {
    op.insertNode(
      this.currentContainer(),
      document.createElement("br"),
      "right"
    );
    e.preventDefault();
  }
  // handleEnter(e: React.KeyboardEvent<I>) {
  //   // const newE = this.wrapBlockEvent<BE.KeyboardEvent<E>>(e);
  //   this.props.onAppendBelow({
  //     ref: this.outerRoot(),
  //     inner: this.currentInnerRoot(),
  //     html: "",
  //     innerHTML: "",
  //     type: "paragraph",
  //   });
  // }

  handleAppendBelow(e: React.KeyboardEvent<I>) {
    this.props.eventManager.call("boundhint", {
      name: "unexpand",
      data: {},
    });
    const content = op.cloneContentRight(this.currentContainer());
    this.props.onAppendBelow({
      ref: this.blockRoot(),
      inner: this.currentContainer(),
      html: "",
      innerHTML: "",
      type: "paragraph",
    });
    e.preventDefault()
  }
  handleEnter(e: React.KeyboardEvent<I>) {
    this.handleAppendBelow(e)
  }
  handleKeyUp(e: React.KeyboardEvent<I>) { }
  defaultHandleKeyup(e) {
    // 作用只是在 上下键按出后，重新定位 BoundHint，不涉及对光标本身的操作，所有对光标本身的操作，都在 KeyDown 时完成
    // console.log(["KeyUp", e.key]);
    if (this.props.selectionMode) {
      e.preventDefault()
      return
    }

    if (e.key.match("Arrow")) {
      const direction = e.key.match("ArrowRight") ? "right" : "left";
      const caretPos = op.currentCaretPosition(this.currentContainer());
      const event = new BlockCaretEvent(
        this.state.html,
        this.currentContainer(),
        caretPos,
        direction
      );
      this.props.onCaretMove(event);
      e.preventDefault();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      const sel = document.getSelection();
      if (op.supportedTag(sel.focusNode)) {
        op.deleteStyle(sel.focusNode as HTMLElement, this.currentContainer());
        const caretPos = op.currentCaretPosition(this.currentContainer());
        const event = new BlockCaretEvent(
          this.state.html,
          this.currentContainer(),
          caretPos
        );
        this.props.onCaretMove(event);
      }
    } else if (e.key === 'v' && e.metaKey) {

    }
    this.handleKeyUp(e);
    return true
  }

  defaultHandleArrowKeyDown = (e: React.KeyboardEvent<I>) => {
    // 只移动光标，不用管 BoundHint
    const root = this.currentContainer();
    if (e.key === "ArrowUp") {
      if (op.isFirstLine(root)) {
        this.handleJumpToAbove(e);
      }
    } else if (e.key === "ArrowDown") {
      if (op.isLastLine(root)) {
        this.handleJumpToBelow(e);
      }
    } else if (e.key === "ArrowLeft") {
      if (this.isCursorLeft()) {
        this.handleJumpToLeft(e);
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
    } else if (e.key === "ArrowRight") {
      if (this.isCursorRight()) {
        this.handleJumpToRight(e);
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
    return op.isCursorLeft(this.currentContainer());
  };

  isCursorRight = (): boolean => {
    return op.isCursorRight(this.currentContainer());
  };

  isFirstLine = op.isFirstLine;
  isLastLine = op.isLastLine;

  firstCaretPosition = op.firstCaretPosition;
  lastCaretPosition = op.lastCaretPosition;

  handleTab = (e: React.KeyboardEvent<I>) => {
    // const caretPos = op.currentCaretPosition(this.currentRoot());
    if (!e.shiftKey) {
      op.insertNode(
        this.currentContainer(),
        document.createTextNode("\u00A0"),
        "right"
      );
    }
    e.preventDefault();
  };

  handleMouseMove = (e) => {
    // if (e.buttons === 1 && !this.state.focused) {
    //   this.props.onSelectBlock(e)
    // }
  }
  handleMouseLeave = () => { }
  handleMouseEnter = (e) => {
    e.target = this.blockRoot()
    // https://github.com/mui/material-ui/issues/7680
    // mouseEnter and mouseLeave can be triggered at the same time,
    // which will cause state unconsistancy.
    if (e.buttons === 1) {
      // (e as BE.MouseEvent<O>).entered = true;
      this.props.onMouseSelect(e as BE.MouseEvent<O>)
    } else {
      this.props.onMouseEnter(e as BE.MouseEvent<O>)
    }
  }

  handleCopy = (e) => {

    // console.log(e)
    // debugger
  }
  handlePaste = (e) => {
    // console.log(e)
    // this.props.eventManager.call('boundhint', { name: 'unexpand', data: {} })
    // debugger
  }
  handleSelectedKeyDown(e: React.KeyboardEvent<I>) {
    if (e.key === 'Enter') {
      // this.outerRoot().classList.remove('block-selected')
      // e.preventDefault()
    } else if (e.key.match("Arrow")) {
      // this.props.onSelectBlock()
    }
    e.preventDefault()
  }

  defaultHandleKeyDown(e) {
    // const newE = this.wrapBlockEvent<BE.KeyboardEvent<O>>(e);
    // debugger
    if (this.props.selectionMode) {
      this.handleSelectedKeyDown(e)
      return
    }

    if (e.key === "Enter") {
      if (e.shiftKey) {
        this.handleShiftEnter(e);
      } else {
        this.handleEnter(e);
      }
    } else if (e.code === "Space") {
      this.handleSpace(e);
    } else if (e.key === "Escape") {
      this.props.onSelectBlock({
        html: null,
        ref: null,
        inner: null
      })
    } else if (e.key === "Tab") {
      this.handleTab(e);
    } else if (e.key === "Backspace") {
      // backspace -> defaultHandleBackspace ->  default(delete one char)
      // backspace -> defaultHandleBackspace ->  mergeAbove
      // backspace -> defaultHandleBackspace ->  changeBlockType
      // backspace -> defaultHandleBackspace ->  deleteStyle
      this.defaultHandleBackspace(e);
    } else if (e.key === "Delete") {
      this.defaultHandleDelete(e);
    } else if (e.key === "Home") {
      const caretPos = this.firstCaretPosition(this.currentContainer());
      op.setCaretPosition(caretPos);
      const event = new BlockCaretEvent(
        this.state.html,
        this.currentContainer(),
        caretPos,
        "left"
      );
      this.props.onCaretMove(event);
      e.preventDefault();
    } else if (e.key === "End") {
      const caretPos = this.lastCaretPosition(this.currentContainer());
      op.setCaretPosition(caretPos);

      const event = new BlockCaretEvent(
        this.state.html,
        this.currentContainer(),
        caretPos,
        "left"
      );
      this.props.onCaretMove(event);
      e.preventDefault();
    } else if (e.key === "Delete") {
      if (op.isCursorRight(this.currentContainer())) {
        this.handleMergeBelow(e);
      }
    } else if (e.key.match("Arrow")) {
      this.defaultHandleArrowKeyDown(e);
    } else {
      if (e.metaKey) {
        if (op.supportStyleKey(e.key)) {
          op.applyStyle(e.key, this.currentContainer());

          this.props.eventManager.call("boundhint", {
            name: "expand",
            data: { force: true },
          });
          e.preventDefault();
          return;
        }
        if (e.key === 'v') {
          this.props.eventManager.call('boundhint', { name: 'unexpand', data: {} })
        }
      }
      console.log(e);
    }
  }

  handleMouseDown = (e) => { }
  defaultHandleMouseDown = (e) => {
    this.handleMouseDown(e)
  }
  protected inContainer(el: Node): boolean {
    return op.isParent(el, this.currentContainer())
  }
  protected fixCaret() {
    const caretPos = op.firstCaretPosition(this.firstContainer())
    op.setCaretPosition(caretPos)
  }
  handleMouseUp = (e) => {
    // console.log()
    // debugger
    const sel = document.getSelection()
    if (!this.inContainer(sel.focusNode)) {
      this.fixCaret()
    }
  }
  renderBlock(block: Block): React.ReactNode {
    return NestRender(block.data.dom)
  }

  makeContentEditable(contentEditable: React.ReactNode) {
    return contentEditable
  }

  public get placeholder(): string | undefined {
    return undefined
  }


  render(): React.ReactNode {
    const initialData = this.latestData()
    return <div
      // tabIndex={-1}
      className={[
        this.props.className,
        this.className
      ].join(' ')}
      data-block-id={this.props.uid}
      ref={this.ref}
      onMouseMove={this.handleMouseMove}
      onMouseEnter={this.handleMouseEnter}
      onMouseLeave={this.handleMouseLeave}
      onMouseDown={this.defaultHandleMouseDown}
      onMouseUp={this.handleMouseUp}
      onBlur={this.handleBlur}
      onFocus={this.handleFocus}
      onSelect={this.handleSelect}
    >
      {this.makeContentEditable(
        <ContentEditable
          placeholder={this.placeholder}
          className="editable"
          innerRef={this.editableRootRef}
          tagName={this.contentEditableName}
          // contentEditable={this.state.contentEditable}
          contentEditable
          onInput={this.handleInput}
          onCopy={this.handleCopy}
          onChange={this.handleDataChange}
          onKeyDown={this.defaultHandleKeyDown}
          onKeyUp={this.defaultHandleKeyup}
          onPaste={this.handlePaste}
        >
          {this.renderBlock(initialData)}
        </ContentEditable>
      )}

    </div>

  }
}
