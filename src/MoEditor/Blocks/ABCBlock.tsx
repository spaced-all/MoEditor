import { ContentEditable } from "./Common"
import { DefaultBlockData, Caret, ContentItem, Position, UserCaret, MetaInfo } from "../types";
import React from "react";
import produce from "immer"
import { ContentItemRender } from "./Content";
import { contextMenu } from 'react-contexify';


import { CaretChangeEventHandler, DataUpdateEventHandler, JumpEvent, JumpEventHandler, MergeEvent, MergeEventHandler, MergeResult, SplitEvent, SplitEventHandler } from "./events";

import * as op from "../dom"
import { BoundHint, BoundHintType } from "../boundhint";
import { } from "react-dom";



export interface ABCBlockStates {
    lastEditTime?: number
}

export interface JumpRef {
    offset?: number;
    from?: "below" | "above";
    // Arrow up/down makes jump / Arrow left/right makes neighbor, click makes mouse
    type: "neighbor" | "jump" | "mouse" | "merge";
}

export interface ABCBlockProps {
    data?: DefaultBlockData;
    uid: string;
    className?: string,
    meta: MetaInfo
    // above or below, use to determine the position of the caret in this block.

    // block will be locked and can't be edited  if caret is not null
    caret?: UserCaret;
    active?: boolean;
    // initialCaret?: OffsetCaret;
    jumpHistory?: JumpEvent

    // onUpdate?: BlockUpdateEventHandler;
    onSelect?: (e: React.SyntheticEvent<HTMLElement>) => void;

    // triggered by delete/backspace
    onMerge?: MergeEventHandler;
    // when need to append block before and after this block, or change block type
    onSplit?: SplitEventHandler;
    // triggered by arrow key, or mouse click
    onActiveShouldChange?: JumpEventHandler;
    // triggered by mouse and keyboard event
    onCaretMove?: CaretChangeEventHandler;

    onDataUpdate?: DataUpdateEventHandler
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

}

export abstract class ABCBlock<
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

    protected get disableBoundHint(): boolean {
        return false
    }

    static blockName = ''

    static merge(self: DefaultBlockData, block: DefaultBlockData): MergeResult {
        return { notImplement: true }
    }

    static defaultProps: ABCBlockProps = {
        uid: "",
        meta: {},
        active: false,

        onSelect: (evt) => { console.log(['onSelect', evt]) },
        onMerge: (evt) => { console.log(['onMerge', evt]) },
        onSplit: (evt) => { console.log(['onSplit', evt]) },
        onActiveShouldChange: (evt) => { console.log(['onActiveShouldChange', evt]) },
        onCaretMove: (evt) => { console.log(['onCaretMove', evt]) },
        onDataUpdate: (evt) => { console.log(['onDataUpdate', evt]) }
    };


    static serializeContentItem(el: HTMLElement[] | HTMLElement): ContentItem[] {
        if (Array.isArray(el)) {
            return el.map(ABCBlock.serializeContentItem).flat()
        }
        if (!op.isValidTag(el)) {
            return []
        }

        const elName = op.getTagName(el)
        let res: ContentItem
        switch (elName) {
            case "label":
                const data = el.querySelector('data')
                const tagName = data.getAttribute('data-type')
                const value = data.getAttribute('data-value')
                let dataKeys = data.getAttribute('data-key')
                const attributes = {}
                if (dataKeys) {
                    dataKeys.split(' ').forEach(item => {
                        attributes[item] = data.getAttribute(`data-${item}`)
                    })
                }
                // const dataKeys = data.getAttribute('data-keys').split(' ')

                res = {
                    'tagName': tagName,
                    'attributes': attributes,
                    'textContent': value
                }
                break
            case "#text":
                res = {
                    'tagName': elName,
                    'textContent': el.textContent
                }
                break
            default:
                const children = []
                if (op.isFullTextNode(el)) {
                    res = {
                        'tagName': elName,
                        'textContent': el.textContent
                    }
                } else {
                    el.childNodes.forEach(item => children.push(...ABCBlock.serializeContentItem(item as HTMLElement)))
                    res = {
                        'tagName': elName,
                        'children': children,
                        'textContent': ''
                    }
                }
                if (elName === 'a') {
                    res['attributes'] = {
                        href: el.getAttribute('href')
                    }
                }

                break
        }
        return [res]
    }

    static serializeBlockElement(el: HTMLElement): DefaultBlockData {
        throw new Error('not implemented.')
    }

    boundhint: BoundHintType<BoundHint>;
    jumpHistory?: JumpEvent
    caret: Position;
    lastEditTime?: number;
    insertHistory: string[];
    ref: React.RefObject<HTMLDivElement>;
    editableRootRef: React.RefObject<O>; // contentEditable element
    constructor(props: P) {
        super(props);
        this.boundhint = new BoundHint()
        this.jumpHistory = null
        this.caret = null;
        this.lastEditTime = null
        this.insertHistory = []

        this.ref = React.createRef();
        this.editableRootRef = React.createRef();

        this.state = {
        } as S;

        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleDataChange = this.handleDataChange.bind(this);
        this.handleInput = this.handleInput.bind(this);

        this.defaultHandleBackspace = this.defaultHandleBackspace.bind(this)
        this.defaultHandleDelete = this.defaultHandleDelete.bind(this)

        this.handleBackspace = this.handleBackspace.bind(this);
        this.handleEnter = this.handleEnter.bind(this)
        this.handleTab = this.handleTab.bind(this)
        this.handleSpace = this.handleSpace.bind(this)

        this.defaultHandleKeyDown = this.defaultHandleKeyDown.bind(this);
        this.defaultHandleKeyup = this.defaultHandleKeyup.bind(this);

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.defaultHandleMouseDown = this.defaultHandleMouseDown.bind(this);
        this.defaultHandleMouseMove = this.defaultHandleMouseMove.bind(this);
        this.defaultHandleMouseUp = this.defaultHandleMouseUp.bind(this);

        this.defaultHandleMouseEnter = this.defaultHandleMouseEnter.bind(this)
        this.defaultHandleMouseLeave = this.defaultHandleMouseLeave.bind(this)

        this.clearJumpHistory = this.clearJumpHistory.bind(this)
        this.serialize = this.serialize.bind(this)
        this.serializeContentData = this.serializeContentData.bind(this)
    }

    clearJumpHistory() {
        this.jumpHistory = null
    }


    serializeContentData() {
        throw new Error('not implemented.')
    }

    blockData(): DefaultBlockData {
        return this.props.data
    }

    serialize(): DefaultBlockData {
        return produce(this.blockData(), draft => {
            draft[draft.type] = this.serializeContentData()
            draft.lastEditTime = new Date().getTime()
        })
    }
    shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
        // console.log([this.blockData().order, 'shouldComponentUpdate'])
        if (nextProps.jumpHistory && nextProps.jumpHistory.type === 'mouse') {
            // ? hack code to avoid blur after focus triggered when mouse click unactived block
            return false
        }
        const res = nextProps.data.lastEditTime !== this.blockData().lastEditTime || (nextProps.active && !this.props.active)

        return res
    }

    componentDidMount(): void {
        // console.log([this.blockData().order, 'componentDidMount'])
        if (this.props.active) {
            this.editableRoot().focus();
        }
    }
    componentDidUpdate(
        prevProps: Readonly<P>,
        prevState: Readonly<S>,
        snapshot?: any
    ): void {
        console.log([this.blockData().order, 'componentDidUpdate'])
        if (this.props.active && !prevProps.active) {
            this.editableRoot().focus();
        }
    }

    currentContainer(): I {
        if (this.props.active) {
            return this.editableRoot() as any as I
        }
        return null
    }
    firstContainer(): I {
        return this.editableRoot() as any as I
    }
    lastContainer(): I {
        return this.editableRoot() as any as I
    }
    previousContainer(el?: I): I {
        return null
    }
    nextContainer(el?: I): I {
        return null
    }
    previousRowContainer(el?: I): I {
        return null
    }
    nextRowContainer(el?: I): I {
        return null
    }

    editableRoot = (): O => {
        return this.editableRootRef.current
    };

    blockRoot = (): HTMLDivElement => {
        return this.ref.current
    }

    handleCaretMove(e: Position) {
        this.caret = e
    }
    handleBlur(e) {
        console.log([this.blockData().order, 'blur', e])
        // console.log(['block blur', e])
        if (this.lastEditTime) {
            // debugger
            this.boundhint.remove()
            this.props.onDataUpdate({
                // need diff or trigger to ignore unchanged block to call serialize()
                'block': this.serialize()
            })
            this.lastEditTime = null
        }
    }

    handleFocus(e: React.FocusEvent) {
        console.log([this.blockData().order, 'focus', e])
        const jumpHistory = this.props.jumpHistory
        e.preventDefault()
        if (jumpHistory) {
            if (jumpHistory.type === 'jump') {
                let root = jumpHistory.from === 'below' ? this.lastContainer() : this.firstContainer()
                const res = op.setCaretReletivePosition(root, jumpHistory.offset)
                let pos = op.currentPosition(this.currentContainer())
                pos = this.boundhint.safePosition(pos)
                op.setPosition(pos)
                this.boundhint.autoUpdate({ root: root })
                if (!res) {
                    this.jumpHistory = jumpHistory
                } else {
                    this.clearJumpHistory()
                }
                // console.log(['focused', jumpHistory.offset, res, this.jumpHistory ? this.jumpHistory.offset : null])
                return
            } else if (jumpHistory.type === 'neighbor') {
                let root = jumpHistory.from === 'below' ? this.lastContainer() : this.firstContainer()
                let pos = jumpHistory.from === 'below' ? op.lastValidPosition(root) : op.firstValidPosition(root)
                pos = this.boundhint.safePosition(pos)
                op.setPosition(pos)
                this.boundhint.autoUpdate({ root: root })
                this.clearJumpHistory()
                return
            } else {
                // debugger
                // this.boundhint.autoUpdate({ root: this.currentContainer() })
                // // op.setPosition(pos)
                // this.clearJumpHistory()
                return
            }
        }

        this.boundhint.autoUpdate({ root: this.currentContainer() })
        this.clearJumpHistory()

    }

    /**
     * insertCompositionText
     * insertText、deleteContentBackward、insertFromPaste / formatBold
     * @param e 
     */
    handleInput(e) {

        const sel = document.getSelection()
        const tag = sel.focusNode.parentElement

        if (op.isTag(tag, 'span') &&
            tag.classList.contains('bound-hint')) {
            if (e.nativeEvent.inputType === 'insertText') {
                if (tag.classList.contains('bound-hint-right')) {
                    const right = sel.focusNode.textContent.slice(-1)
                    const left = sel.focusNode.textContent.slice(-0, -1)
                    tag.textContent = right
                    var newText = op.makeText(left)
                    if (op.isTag(tag.previousSibling, '#text')) {
                        tag.previousSibling.textContent = tag.previousSibling.textContent + newText.textContent
                        newText = tag.previousSibling as Text
                    } else {
                        tag.parentElement.insertBefore(newText, tag)
                    }
                    op.setPosition(op.lastValidPosition(newText))
                } else {
                    const right = sel.focusNode.textContent.slice(-1)
                    const left = sel.focusNode.textContent.slice(-0, -1)
                    const newText = op.makeText(right)
                    tag.textContent = left
                    tag.parentElement.insertBefore(newText, tag.nextSibling)
                    op.setPosition(op.lastValidPosition(newText))
                }
            } else if (e.nativeEvent.inputType === 'deleteContentBackward' || e.nativeEvent.inputType === 'deleteContentForward') {
                // debugger
                console.log(tag.className)
                let pos = op.nextValidPosition(this.editableRoot())
                pos = this.boundhint.safePosition(pos)
                op.setPosition(pos)
            }
        }

        this.lastEditTime = new Date().getTime()
    }

    handleContextMenu(e: React.MouseEvent) {
    }
    handleKeyUp(e: React.KeyboardEvent<I>) { }
    defaultHandleKeyup(e) {
        // 作用只是在 上下键按出后，重新定位 BoundHint，不涉及对光标本身的操作，所有对光标本身的操作，都在 KeyDown 时完成
        // console.log(["KeyUp", e.key]);

        // 作用只是在 上下键按出后，重新定位 BoundHint，不涉及对光标本身的操作，所有对光标本身的操作，都在 KeyDown 时完成
        // console.log(["KeyUp", e.key]);

        if (e.key.match("Arrow") || e.key === 'Home' || e.key === 'End') {
            this.boundhint.safeMousePosition()
            this.boundhint.autoUpdate()
            e.preventDefault();
        } else if (e.key === "Backspace" || e.key === "Delete") {
            this.boundhint.autoUpdate({ force: true, root: this.currentContainer() })
            e.preventDefault()
        } else if (e.metaKey) {
            // this.boundhint.autoUpdate({ force: true })
            e.preventDefault()
        }

        this.handleKeyUp(e);
        return true
    }


    defaultHandleMouseMove(e) {
        // if (e.buttons === 1 && !this.state.focused) {
        //   this.props.onSelectBlock(e)
        // }

        // const range = document.getSelection().getRangeAt(0)
        // console.log([this.props.active, this.props.uid])

        // const left = op.findTopNode(range.startContainer, this.currentContainer())
        // const right = op.findTopNode(range.endContainer, this.currentContainer())

        // if (left) {
        //     console.log([left, right])
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

    isLastLine() {
        return op.isFirstLine(this.currentContainer())
    }
    isFirstLine() {
        return op.isLastLine(this.currentContainer())
    }
    isCursorLeft() {
        return op.isCursorLeft(this.currentContainer())
    }
    isCursorRight() {
        return op.isCursorRight(this.currentContainer())
    }

    activeContainer(el, direction: 'left' | 'right' | 'offset' = 'left', offset?: number) {
        if (direction === 'left') {
            op.setCaretReletivePosition(el as HTMLElement, 0)
        } else if (direction === 'right') {
            const pos = op.lastValidPosition(el)
            op.setPosition(pos)
        } else {
            op.setCaretReletivePosition(el, offset)
        }
    }

    handleArrowKeyDown(e: React.KeyboardEvent) {
        console.log('press')
        const root = this.currentContainer();
        if (e.key === "ArrowUp") {
            if (op.isFirstLine(root)) {

                let event: JumpEvent = {
                    'from': 'below',
                    'type': 'jump',
                    'offset': op.getCaretReletivePosition(this.currentContainer())
                }
                if (this.jumpHistory) {
                    event.offset = this.jumpHistory.offset
                    this.clearJumpHistory()
                }
                console.log(['Arrow Up', event.offset])
                this.processJumpEvent(event);
                e.preventDefault();
                return
            }
            this.boundhint.autoUpdate()
        } else if (e.key === "ArrowDown") {
            if (op.isLastLine(root)) {
                let event: JumpEvent = {
                    'from': 'above',
                    'type': 'jump',
                    'offset': op.getCaretReletivePositionAtLastLine(this.currentContainer())
                }
                if (this.jumpHistory) {
                    event.offset = this.jumpHistory.offset
                    this.jumpHistory = null
                }
                console.log(['Arrow Down', event.offset])
                this.processJumpEvent(event);
                e.preventDefault()
                return
            }
            this.boundhint.autoUpdate()
        } else if (e.key === "ArrowLeft") {
            const sel = document.getSelection()
            const range = sel.getRangeAt(0)
            let pos = op.previousValidPosition(root, range.startContainer, range.startOffset);
            if (!pos) {
                // on left bound
                this.processJumpEvent({ 'from': 'below', 'type': 'neighbor' });
                e.preventDefault()
            } else {
                if (e.altKey) {
                } else { }

                pos = this.boundhint.safePosition(pos)
                if (e.shiftKey) {
                    op.setPosition(pos, true, false);
                }
                else {
                    op.setPosition(pos);
                }
                this.boundhint.autoUpdate()
                console.log(pos)
                e.preventDefault();
            }
        } else if (e.key === "ArrowRight") {
            const sel = document.getSelection()
            const range = sel.getRangeAt(0)
            let pos = op.nextValidPosition(root, range.endContainer, range.endOffset);
            if (!pos) {
                // on right bound
                this.processJumpEvent({ 'from': 'above', 'type': 'neighbor' });
                e.preventDefault()
            } else {
                if (e.altKey) {
                } else {
                }
                // debugger


                pos = this.boundhint.safePosition(pos)

                if (e.shiftKey) {
                    op.setPosition(pos, false, true);
                } else {
                    op.setPosition(pos);
                }
                this.boundhint.autoUpdate()

                e.preventDefault();
            }
        }
    }



    defaultHandleDelete(e: React.KeyboardEvent) {
        var tag;
        if ((tag = op.isInStyleBound(this.currentContainer(), "right"))) {
            const style = op.tagToStyle(tag);
            if (style) {
                op.deleteStyle(tag, this.currentContainer());
                e.preventDefault();
            }
            return;
        } else {
            const sel = document.getSelection()
            if (op.isTag(sel.focusNode, 'label')) {
                sel.focusNode.parentElement.removeChild(sel.focusNode)
                e.preventDefault()
                return
            }
        }
        this.handleDelete(e)
    }
    defaultHandleBackspace(e: React.KeyboardEvent) {
        var tag;
        if ((tag = op.isInStyleBound(this.currentContainer(), "left"))) {
            const style = op.tagToStyle(tag);
            if (style) {
                op.deleteStyle(tag, this.currentContainer());
                e.preventDefault();
            }
            return;
        } else {
            const sel = document.getSelection()
            if (op.isTag(sel.focusNode, 'label')) {
                sel.focusNode.parentElement.removeChild(sel.focusNode)
                e.preventDefault()
                return
            }
        }
        this.handleBackspace(e);
    }
    handleBackspace(e: React.KeyboardEvent) {
        if (this.isCursorLeft()) {
            this.processMergeEvent({
                direction: 'left',
            })
            e.preventDefault()
        }
    }
    handleDelete(e: React.KeyboardEvent) {
        if (this.isCursorRight()) {
            this.processMergeEvent({
                direction: 'right'
            })
            e.preventDefault()
        }
    }

    handleEnter(e: React.KeyboardEvent) {

    }
    handleSpace(e: React.KeyboardEvent) {

    }
    handleInputKeyDown(e: React.KeyboardEvent) {
        const target = e.target as HTMLElement
        const editableRoot = this.editableRoot()
        const parent = op.findParentMatchTagName(target, 'label', editableRoot)

        if (parent) {
            editableRoot.focus()
            let pos = op.createPosition(this.currentContainer(), parent, 0)
            pos = op.nextValidPosition(this.currentContainer(), pos.container, pos.offset)
            pos = this.boundhint.safePosition(pos)
            op.setPosition(pos)
            this.boundhint.autoUpdate({ force: true, root: this.currentContainer() })

            e.preventDefault()
        }
    }
    handleTab(e: React.KeyboardEvent) {

    }



    defaultHandleKeyDown(e: React.KeyboardEvent) {
        console.log(['keydown', e.key])
        if (e.key.match(/[a-zA-Z@#/]/)) {
            this.insertHistory.push(e.key)
            while (this.insertHistory.length > 5) {
                this.insertHistory.splice(0, 1)
            }
        } else {
            this.insertHistory.splice(0, this.insertHistory.length)
        }

        if (this.insertHistory[this.insertHistory.length - 1] === '/') {
            if (this.insertHistory[this.insertHistory.length - 2] === '/') {
                contextMenu.show({
                    id: 'slash-menu',
                    event: e
                });
            }
        }

        if (op.isTag(((e as any).target), 'input')) {
            this.handleInputKeyDown(e)
        }
        if (e.key === "Enter") {
            const pos = op.currentPosition(this.currentContainer())
            if (op.isTag(pos.container, 'label')) {
                this.boundhint.autoUpdate({ root: this.currentContainer(), enter: true, keyboardEvent: e })
                e.preventDefault()
                return
            }

            this.handleEnter(e);
        } else if (e.code === "Space") {
            this.handleSpace(e);
        } else if (e.key === "Escape") {
            // this.props.onSelectBlock({
            //     html: null,
            //     ref: null,
            //     inner: null
            // })
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
            // const caretPos = this.firstCaretPosition(this.currentContainer());
            // op.setCaretPosition(caretPos);
            // const event = new BlockCaretEvent(
            //     this.state.html,
            //     this.currentContainer(),
            //     caretPos,
            //     "left"
            // );
            // this.props.onCaretMove(event);
            // e.preventDefault();
        } else if (e.key === "End") {
            // const caretPos = this.lastCaretPosition(this.currentContainer());
            // op.setCaretPosition(caretPos);

            // const event = new BlockCaretEvent(
            //     this.state.html,
            //     this.currentContainer(),
            //     caretPos,
            //     "left"
            // );
            // this.props.onCaretMove(event);
            // e.preventDefault();
        } else if (e.key === "Delete") {
            // if (op.isCursorRight(this.currentContainer())) {
            //     this.handleMergeBelow(e);
            // }
        } else if (e.key.match("Arrow")) {
            this.handleArrowKeyDown(e);
        } else {
            if (e.metaKey) {
                if (op.supportStyleKey(e.key)) {
                    op.applyStyle(e.key, this.currentContainer());
                    this.boundhint.autoUpdate({ force: true, root: this.currentContainer() })
                    e.preventDefault();
                    return;
                }

            }
        }

        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
            this.clearJumpHistory()
        }
    }

    handleMouseDown(e: React.MouseEvent) { }
    defaultHandleMouseEnter(e) { }
    defaultHandleMouseDown(e) {
        console.log([this.blockData().order, 'MouseDown', e])
        if (!this.props.active) {
            this.props.onActiveShouldChange({ type: 'mouse' })
        }

        this.boundhint.safeMouseClick(this.editableRoot())

        this.handleMouseDown(e)
        this.clearJumpHistory()
    }

    defaultHandleMouseUp(e: React.MouseEvent) {
        console.log([this.blockData().order, 'MouseUp', e])
        const valid = this.boundhint.safeMousePosition()
        if (!valid) {
            const parent = op.findParentMatchTagName(e.target as Node, 'label', this.currentContainer())
            if (parent) {
                const pos = op.createPosition(this.currentContainer(), parent, 0)
                op.setPosition(pos)
            }
        }

        this.boundhint.autoUpdate({ root: this.currentContainer(), click: true, mouseEvent: e })
    }
    renderContentItem(item: ContentItem | ContentItem[]): React.ReactNode {
        return ContentItemRender(item)
    }

    renderBlock(block: DefaultBlockData): React.ReactNode {
        return <></>
    }

    makeContentEditable(contentEditable: React.ReactNode) {
        return contentEditable
    }

    processMergeEvent(e: MergeEvent): boolean {
        return true
    }

    processJumpEvent(e: JumpEvent): boolean {
        if (e.type === 'mouse') {
            return true
        }

        let cur = this.currentContainer()
        let direction, neighbor, offset;
        if (e.type === 'jump') {
            if (e.from === 'below') {
                neighbor = this.previousRowContainer(cur)
                direction = 'offset'
            } else {
                neighbor = this.nextRowContainer(cur)
                direction = 'offset'
            }
            offset = op.getCaretReletivePosition(cur)
        } else if (e.type === 'neighbor') {
            if (e.from === 'below') {
                neighbor = this.previousContainer(cur)
                direction = 'right'
            } else {
                neighbor = this.nextContainer(cur)
                direction = 'left'
            }
        }
        if (neighbor) {
            this.activeContainer(neighbor, direction, offset)
        } else {
            if (e.noPropagation) {
                return false
            } else {
                this.props.onActiveShouldChange(e)
                return true
            }
        }
        return true
    }

    renderContextMenu() {
        return

    }

    handleSelect(e) {
        // console.log(e)

    }
    handleDataChange(e) {

    }
    public get placeholder(): string | undefined {
        return undefined
    }

    render(): React.ReactNode {
        const initialData = this.blockData()

        return <div
            className={[
                this.props.className,
                this.className
            ].join(' ')}
            data-block-id={this.props.uid}
            ref={this.ref}
            onMouseLeave={this.defaultHandleMouseLeave}
            onMouseMove={this.defaultHandleMouseMove}
            onMouseEnter={this.defaultHandleMouseEnter}
            onSelect={this.handleSelect}
            onContextMenu={this.handleContextMenu}

            onMouseDown={this.defaultHandleMouseDown}
            onMouseUp={this.defaultHandleMouseUp}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
        >
            {this.makeContentEditable(
                <ContentEditable
                    placeholder={this.placeholder}
                    className="moe-block-editable"
                    innerRef={this.editableRootRef}
                    tagName={this.contentEditableName}
                    contentEditable

                    onInput={this.handleInput}
                    onSelect={this.handleSelect}
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


// export interface ABCBlockType<T extends typeof ABCBlock> {
//     block: T
// }

export type ABCBlockType<T extends typeof ABCBlock> = T 