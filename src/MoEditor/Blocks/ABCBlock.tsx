import { ContentEditable } from "./Common"
import { Block, Caret, ContentItem, UserCaret } from "../types";
import React from "react";
import { ContentItemRender } from "./Content";

import { BlockUpdateEvent, BlockUpdateEventHandler, CaretChangeEventHandler, JumpEventHandler, MergeEventHandler, SplitEventHandler } from "./events";

import * as op from "../dom/node"

export interface ABCBlockStates {
    // html: string;
    // jumpRef?: JumpRef;
    // contentEditable: boolean;
    // data?: Block;
    // dirty?: boolean;
    // focused: boolean
}

export interface JumpRef {
    offset?: number;
    from?: "below" | "above";
    // Arrow up/down makes jump / Arrow left/right makes neighbor, click makes mouse
    type: "neighbor" | "jump" | "mouse" | "merge";
}

export interface Relative {

}

export interface ABCBlockProps {
    data?: Block;
    uid: string;
    className?: string,

    // above or below, use to determine the position of the caret in this block.
    relative?: Relative;

    // block will be locked and can't be edited  if caret is not null
    caret?: UserCaret;

    // selected?: boolean,
    // selectionMode?: boolean,
    // eventManager?: EventManager;
    // historyOffset?: number;
    // jumpRef?: JumpRef;
    // initialPos?: { start: number; end: number };
    // onShiftEnter?: (e: React.KeyboardEvent<HTMLElement>) => void;
    // onEnter?: (e: React.KeyboardEvent<HTMLElement>) => void;
    // onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
    // onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
    onUpdate?: BlockUpdateEventHandler;
    onSelect?: (e: React.SyntheticEvent<HTMLElement>) => void;
    // onDataChange?: (e: React.BlockEvent<HTMLElement>) => void;


    // triggered by delete/backspace
    onMerge?: MergeEventHandler;
    // include append before and after
    onSplit?: SplitEventHandler;
    // triggered by arrow key
    onJump?: JumpEventHandler;
    // triggered by mouse and keyboard event
    onCaretMove?: CaretChangeEventHandler;

    // onJumpAbove?: (e: React.KeyboardEvent<HTMLElement>) => void;
    // onJumpToAboveEnd?: (e: React.KeyboardEvent<HTMLElement>) => void;
    // onJumpBelow?: (e: React.KeyboardEvent<HTMLElement>) => void;
    // onJumpToBelowStart?: (e: React.KeyboardEvent<HTMLElement>) => void;

    // onCaretMoveTo?: (e: React.CaretEvent<HTMLElement>) => void;
    // onAppendAbove?: (e: React.BlockAppendEvent<HTMLElement>) => void;
    // onAppendBelow?: (e: React.BlockAppendEvent<HTMLElement>) => void;
    // onSplitAbove?: (e: React.BlockEvent<HTMLElement>) => void;
    // onChangeBlockType?: (e: React.BlockChangeEvent<HTMLElement>) => void;
    // onComponentUpdate?: (e: React.ComponentUpdatedEvent<HTMLElement>) => void;
    // onSelectBlock?: (e: React.BlockEvent<HTMLElement>) => void;
    // onMouseSelect?: (e: React.MouseEvent<HTMLElement>) => void;
    // onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
}


export interface IBlock<
    P extends ABCBlockProps,
    S extends ABCBlockStates,
    O extends HTMLElement,
    I extends HTMLElement
    > {
    props: P;
    state: S;
    ref: React.RefObject<HTMLDivElement>;
    // handleBlur: (e) => void;
    // handleFocus: (e) => void;
    // handleSelect: (e) => void;
    // handleDataChange: (e, data) => void;

    // handleInput: (e) => void;

    // defaultHandleKeyup: (e: React.KeyboardEvent<I>) => void;
    // defaultHandleKeyDown: (e: React.KeyboardEvent<I>) => void;
}





export class ABCBlock<
    P extends ABCBlockProps,
    S extends ABCBlockStates,
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

    static blockName = ''

    static defaultProps: ABCBlockProps = {
        uid: "",
        // selected: false,
        onUpdate: (evt) => { console.log(['onUpdate', evt]) },
        onSelect: (evt) => { console.log(['onSelect', evt]) },
        onMerge: (evt) => { console.log(['onMerge', evt]) },
        onSplit: (evt) => { console.log(['onSplit', evt]) },
        onJump: (evt) => { console.log(['onJump', evt]) },
        onCaretMove: (evt) => { console.log(['onCaretMove', evt]) },
        // selectionMode: false,
        // onShiftEnter: (evt) => console.log(["onShiftEnter", evt]),
        // onEnter: (evt) => console.log(["onEnter", evt]),
        // onBlur: (evt) => console.log(["onBlur", evt]),
        // onFocus: (evt) => console.log(["onFocus", evt]),
        // onSelect: (evt) => console.log(["onSelect", evt]),
        // onDataChange: (evt) => console.log(["onDataChange", evt]),
        // onMergeAbove: (evt) => console.log(["onMergeAbove", evt]),
        // onMergeBelow: (evt) => console.log(["onMergeBelow", evt]),
        // onJumpAbove: (evt) => console.log(["onJumpAbove", evt]),
        // onJumpToAboveEnd: (evt) => console.log(["onJumpToAboveEnd", evt]),
        // onJumpBelow: (evt) => console.log(["onJumpBelow", evt]),
        // onJumpToBelowStart: (evt) => console.log(["onJumpToBelowStart", evt]),
        // onCaretMove: (evt) => console.log(["onCaretMove", evt]),
        // onAppendAbove: (evt) => console.log(["onAppendAbove", evt]),
        // onAppendBelow: (evt) => console.log(["onAppendBelow", evt]),
        // onSplitAbove: (evt) => console.log(["onSplitAbove", evt]),
        // onCaretMoveTo: (evt) => console.log(["onCaretMoveTo", evt]),
        // onComponentUpdate: (evt) => console.log(["onCaretMoveTo", evt]),
        // onSelectBlock: (evt) => console.log(['onSelectBlock', evt]),
        // onMouseSelect: (evt) => console.log(['onUnSelectBlock', evt]),
    };

    ref: React.RefObject<HTMLDivElement>;
    editableRootRef: React.RefObject<O>; // contentEditable element
    constructor(props: P) {
        super(props);
        this.ref = React.createRef();
        this.editableRootRef = React.createRef();
        this.state = {
            // html: "",
            // jumpRef: this.props.jumpRef,
            // contentEditable: this.props.initialContentEditable,
            // focused: false,
            // data: this.props.data,
            // dirty: false,
        } as S;


        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleDataChange = this.handleDataChange.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.defaultHandleKeyDown = this.defaultHandleKeyDown.bind(this);
        this.defaultHandleKeyup = this.defaultHandleKeyup.bind(this);
    }

    serializeContentItem(el: HTMLElement): ContentItem {
        return
    }

    serialize(dom?: Block[]): Block {
        throw new Error('not implemented.')
    }

    componentDidMount(): void {

    }
    componentDidUpdate(
        prevProps: Readonly<P>,
        prevState: Readonly<S>,
        snapshot?: any
    ): void {

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

    handleBlur(e) {

    }

    handleFocus(e) {
        // focusEvent will triggered with mouseDown,
        // but the focusNode/Offset will changed with mouseUp

    }



    handleInput(e) {
    }


    handleKeyUp(e: React.KeyboardEvent<I>) { }
    defaultHandleKeyup(e) {
        // 作用只是在 上下键按出后，重新定位 BoundHint，不涉及对光标本身的操作，所有对光标本身的操作，都在 KeyDown 时完成
        // console.log(["KeyUp", e.key]);
    }


    defaultHandleMouseMove(e) {
        // if (e.buttons === 1 && !this.state.focused) {
        //   this.props.onSelectBlock(e)
        // }
    }
    defaultHandleMouseLeave(e) { }
    handleCopy(e) {

        // console.log(e)
        // debugger
    }
    handlePaste(e) {
        // console.log(e)
        // this.props.eventManager.call('boundhint', { name: 'unexpand', data: {} })
        // debugger
    }

    defaultHandleKeyDown(e) {
    }

    handleMouseDown(e) { }
    defaultHandleMouseEnter(e) { }
    defaultHandleMouseDown(e) {
        this.handleMouseDown(e)
    }

    defaultHandleMouseUp(e) {
    }
    renderContentItem(item: ContentItem | ContentItem[]): React.ReactNode {
        return ContentItemRender(item)
    }

    renderBlock(block: Block): React.ReactNode {
        return <></>
    }

    makeContentEditable(contentEditable: React.ReactNode) {
        return contentEditable
    }


    handleSelect(e) {

    }
    handleDataChange(e) {

    }
    public get placeholder(): string | undefined {
        return undefined
    }

    render(): React.ReactNode {
        const initialData = this.props.data
        return <div
            // tabIndex={-1}
            className={[
                this.props.className,
                this.className
            ].join(' ')}
            data-block-id={this.props.uid}
            ref={this.ref}
            onMouseMove={this.defaultHandleMouseMove}
            onMouseEnter={this.defaultHandleMouseEnter}
            onMouseLeave={this.defaultHandleMouseLeave}
            onMouseDown={this.defaultHandleMouseDown}
            onMouseUp={this.defaultHandleMouseUp}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            onSelect={this.handleSelect}
        >
            {this.makeContentEditable(
                <ContentEditable
                    placeholder={this.placeholder}
                    className="block-editable"
                    innerRef={this.editableRootRef}
                    tagName={this.contentEditableName}
                    contentEditable
                    onInput={this.handleInput}
                    onCopy={this.handleCopy}
                    onChange={this.handleDataChange}
                    onPaste={this.handlePaste}
                    onKeyDown={this.defaultHandleKeyDown}
                    onKeyUp={this.defaultHandleKeyup}
                >
                    {this.renderBlock(initialData)}
                </ContentEditable>
            )}

        </div>

    }
}


export interface ABCBlockType<T extends typeof ABCBlock> {
    block: T
}