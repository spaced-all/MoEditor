import { ContentEditable } from "./Common"
import 'katex/dist/katex.min.css';
import {
    DefaultBlockData,
    Caret,
    ContentItem,
    Position,
    UserCaret,
    MetaInfo,
    TargetPosition as AimPosition,
    hdirection,
    TargetPosition
} from "../types";
import React from "react";
import produce from "immer"
import { ContentItemRender } from "./Content";
import { contextMenu } from 'react-contexify';
import * as html from "../html"

import {
    CaretChangeEventHandler,
    DataUpdateEventHandler,
    JumpEvent,
    JumpEventHandler,
    MergeEvent,
    MergeEventHandler,
    MergeResult,
    SplitEvent,
    SplitEventHandler
} from "./events";

import * as op from "../utils"
import { BoundHint, BoundHintType } from "../boundhint";
import { } from "react-dom";
import { InlineMath } from "../html/inlinemath";


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
    // jumpHistory?: JumpEvent
    posHistory?: AimPosition
    // positionHistory?: Relative
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


export interface IBlock<P extends ABCBlockProps,
    S extends ABCBlockStates,
    O extends HTMLElement,
    I extends HTMLElement> {
    props: P;
    state: S;
    ref: React.RefObject<HTMLDivElement>;

}

export abstract class ABCBlock<P extends ABCBlockProps,
    S extends ABCBlockStates,
    O extends HTMLElement, // outer block element type
    I extends HTMLElement // inner block element type
    >
    extends React.Component<P, S>
    implements IBlock<P, S, O, I> {

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

        onSelect: (evt) => {
            console.log(['onSelect', evt])
        },
        onMerge: (evt) => {
            console.log(['onMerge', evt])
        },
        onSplit: (evt) => {
            console.log(['onSplit', evt])
        },
        onActiveShouldChange: (evt) => {
            console.log(['onActiveShouldChange', evt])
        },
        onCaretMove: (evt) => {
            console.log(['onCaretMove', evt])
        },
        onDataUpdate: (evt) => {
            console.log(['onDataUpdate', evt])
        }
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
    posHistory?: AimPosition
    caret: Position;
    lastEditTime?: number;
    insertHistory: string[];
    ref: React.RefObject<HTMLDivElement>;
    editableRootRef: React.RefObject<O>; // contentEditable element

    inComposition?: boolean
    constructor(props: P) {
        super(props);
        this.boundhint = new BoundHint()
        // this.jumpHistory = null
        this.posHistory = null
        this.caret = null;
        this.lastEditTime = null
        this.inComposition = false
        this.insertHistory = []

        this.ref = React.createRef();
        this.editableRootRef = React.createRef();


        this.state = {} as S;

        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleDataChange = this.handleDataChange.bind(this);
        this.handleInput = this.handleInput.bind(this);

        this.handleCompositionEnd = this.handleCompositionEnd.bind(this);
        this.handleCompositionStart = this.handleCompositionStart.bind(this);
        this.handleCompositionUpdate = this.handleCompositionUpdate.bind(this);

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

        this.getContainerByIndex = this.getContainerByIndex.bind(this)
    }

    clearJumpHistory() {
        // this.jumpHistory = null
        this.posHistory = null
    }


    serializeContentData() {
        throw new Error('not implemented.')
    }

    blockData(): DefaultBlockData {
        return this.props.data
    }

    createLatestTime() {
        return new Date().getTime()
    }

    serialize(force?: boolean): DefaultBlockData {
        if (!this.lastEditTime && !force) {
            return this.blockData()
        }

        return produce(this.blockData(), draft => {
            draft[draft.type] = this.serializeContentData()
            draft.lastEditTime = new Date().getTime()
        })
    }

    shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
        const res = nextProps.data.lastEditTime !== this.blockData().lastEditTime || (nextProps.active && !this.props.active)
        return res
    }

    componentDidMount(): void {

        this.lazyRender(this.lazyGetContainers(), null, this.blockData())

        if (this.props.active) {
            this.editableRoot().focus();
        } else {
            this.boundhint.autoUpdate({ root: this.currentContainer() })
        }
    }

    shouldRenderContent(prevProps: DefaultBlockData, nextProps: DefaultBlockData) {
        return prevProps.lastEditTime !== nextProps.lastEditTime
    }

    componentDidUpdate(
        prevProps: Readonly<P>,
        prevState: Readonly<S>,
        snapshot?: any
    ): void {
        console.log([this.blockData().order, 'componentDidUpdate'])
        console.log(this.posHistory)

        this.lazyRender(this.lazyGetContainers(), prevProps.data, this.blockData())

        if (this.props.active && !prevProps.active) {
            this.editableRoot().focus();
        } else {
            this.boundhint.autoUpdate({ root: this.currentContainer() })
        }
    }
    lazyCreateElement(item: ContentItem | ContentItem[]) {
        return html.createElement(item)
    }

    lazyGetContainers(): HTMLElement | HTMLElement[] {
        return this.editableRoot()
    }
    lazyPutContentItem(el: HTMLElement, contentItem: ContentItem[]) {
        el.innerHTML = ''
        const [nodes, noticable] = this.lazyCreateElement(contentItem)
        if (nodes) {
            nodes.forEach(c => {
                el.appendChild(c)
            })
            noticable.forEach(c => c.componentDidMount())
        }
    }

    lazyRender(container: HTMLElement | HTMLElement[],
        prevProps: DefaultBlockData,
        nextProps: DefaultBlockData) {
    }

    getContainerByIndex(index: number | number[]): I {
        if (index === 0 || index === -1) {
            return this.editableRoot() as any as I
        }
        return null
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
        if (op.findParentMatchTagName(e.relatedTarget, 'label', this.currentContainer())) {
            e.preventDefault()
            return
        }

        if (op.isTag(e.target, 'input')) {
            e.preventDefault()
        }
        if (this.lastEditTime) {
            this.boundhint.remove()
            this.props.onDataUpdate({
                // need diff or trigger to ignore unchanged block to call serialize()
                'block': this.serialize()
            })
            this.lastEditTime = null
        }
    }

    setTargetPosition(posHistory: TargetPosition) {
        if (posHistory && posHistory.type !== 'mouse') {
            const sel = document.getSelection()
            if (sel.rangeCount === 0) {
                return
            }


            if (posHistory.isRange) {
                // 一般情况下不会有跨 block 的 range posHistory
                // 一般都是 list 下多选情况的删除、tab、enter 导致的同 block 的更改
                const { start, end } = posHistory.range
                const startRange = document.createRange()
                const endRange = document.createRange()
                const startEl = this.getContainerByIndex(start.index)
                const endEl = this.getContainerByIndex(end.index)
                op.setCaretReletivePosition(startEl, start.offset, startRange)
                op.setCaretReletivePosition(endEl, end.offset, endRange)
                const sel = document.getSelection()
                sel.setBaseAndExtent(
                    startRange.startContainer, startRange.startOffset,
                    endRange.endContainer, endRange.endOffset
                )
                // const range = document.getSelection().getRangeAt(0)
                // range.setStart(startRange.startContainer, startRange.startOffset)
                // range.setEnd(endRange.endContainer, endRange.endOffset)
                this.boundhint.autoUpdate({ root: this.editableRoot() })
            } else {
                const el = this.getContainerByIndex(posHistory.index)
                let res: boolean;
                if (posHistory.softwrap) {
                    res = op.setCaretReletivePositionAtLastLine(el, posHistory.offset)
                } else {
                    res = op.setCaretReletivePosition(el, posHistory.offset)
                }

                let pos = op.currentPosition(this.currentContainer())
                pos = this.boundhint.safePosition(pos)
                op.setPosition(pos)
                this.boundhint.autoUpdate({ root: this.editableRoot() })
                if (!res) {
                    this.posHistory = posHistory
                } else {
                    this.clearJumpHistory()
                }
            }


        }
    }

    handleFocus(e: React.FocusEvent) {
        console.log([this.blockData().order, 'focus', e])

        let label;
        if ((label = op.findParentMatchTagName(e.relatedTarget, 'label', this.currentContainer()))) {
            let pos = op.previousValidPosition(this.currentContainer(), label, 0)
            if (!pos || !pos.container) {
                return
            }
            pos = this.boundhint.safePosition(pos)
            op.setPosition(pos)
            this.boundhint.autoUpdate({ root: this.currentContainer() })
            e.preventDefault()
            e.stopPropagation()
            return
        }

        if (op.isTag(e.target, 'input')) {
            e.stopPropagation()
            return
        }
        // debugger
        // const jumpHistory = this.props.jumpHistory
        const posHistory = this.props.posHistory
        e.preventDefault()
        this.setTargetPosition(posHistory)
        const root = this.currentContainer()

        if (root && !e.relatedTarget) {
            // initial situation
            this.boundhint.autoUpdate({ root: root })
        }
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
        this.boundhint.autoUpdate()
        this.lastEditTime = new Date().getTime()
        console.log(['input', e.nativeEvent.inputType])
    }
    handleCompositionStart(e: React.CompositionEvent) {
        console.log(['handleCompositionStart', this.props.data.order, e])
        this.inComposition = true
    }
    handleCompositionEnd(e: React.CompositionEvent) {
        console.log(['handleCompositionEnd', this.props.data.order, e])
        this.inComposition = false
    }
    handleCompositionUpdate(e: React.CompositionEvent) {
        console.log(['handleCompositionUpdate', this.props.data.order, e])
    }


    handleContextMenu(e: React.MouseEvent) {
    }

    handleKeyUp(e: React.KeyboardEvent<I>) {
    }

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

    defaultHandleMouseLeave(e) {
    }

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

    currentContainerIndex(): number {
        return 0
    }

    activeContainer2(el, offset, softwrap): boolean {
        if (softwrap) {
            return op.setCaretReletivePositionAtLastLine(el, offset)
        } else {
            return op.setCaretReletivePosition(el, offset)
        }
    }


    handleArrowKeyDown(e: React.KeyboardEvent) {
        const root = this.currentContainer();

        if (e.key === "ArrowUp") {
            if (op.isFirstLine(root)) {
                let posHistory: AimPosition = {
                    // 'index': this.currentContainerIndex() - 1,
                    // 'native': e,
                    'direction': 'up',
                    'offset': op.getCaretReletivePosition(this.currentContainer()),
                    'softwrap': true,
                    'type': 'keyboard'
                }
                if (this.posHistory) {
                    posHistory.offset = this.posHistory.offset
                    this.clearJumpHistory()
                }
                this.processJumpEvent(posHistory)
                e.preventDefault();
                return
            }
            this.boundhint.autoUpdate()
        } else if (e.key === "ArrowDown") {
            if (op.isLastLine(root)) {
                let posHistory: AimPosition = {
                    // 'index': this.currentContainerIndex() + 1,
                    // 'native': e,
                    'direction': 'down',
                    'offset': op.getCaretReletivePositionAtLastLine(this.currentContainer()),
                    'softwrap': false,
                    'type': 'keyboard'
                }
                if (this.posHistory) {
                    posHistory.offset = this.posHistory.offset
                    this.clearJumpHistory()
                }
                this.processJumpEvent(posHistory)
                e.preventDefault()
                return
            }
            this.boundhint.autoUpdate()
        } else if (e.key === "ArrowLeft") {
            if (e.altKey) {
                return
            }
            const sel = document.getSelection()
            const range = sel.getRangeAt(0)
            // debugger
            let pos = op.previousValidPosition(root, sel.focusNode, sel.focusOffset);
            if (!pos) {
                // on left bound
                let posHistory: AimPosition = {
                    // 'index': this.currentContainerIndex() - 1,
                    // 'native': e,
                    'offset': -1,
                    'direction': 'left',
                    // 'softwrap': false,
                    'type': 'keyboard'
                }
                this.processJumpEvent(posHistory)

                e.preventDefault()
            } else {
                if (e.altKey) {
                } else {
                }
                console.log([sel.focusNode, sel.focusOffset, pos.container, pos.offset])
                // console.log(pos)
                pos = this.boundhint.safePosition(pos)
                if (e.shiftKey) {
                    while (pos && !op.isTag(pos.container, '#text')) {
                        pos = this.boundhint.safePosition(pos)
                        if (op.isTag(pos.container, 'label')) {
                            pos = op.previousValidPosition(root, pos.container, pos.offset);
                            break
                        }
                        pos = op.previousValidPosition(root, pos.container, pos.offset);
                    }
                    pos = this.boundhint.safePosition(pos)
                    document.getSelection().setBaseAndExtent(
                        sel.anchorNode,
                        sel.anchorOffset,
                        pos.container,
                        pos.offset
                    )
                    console.log([sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset])
                } else {
                    op.setPosition(pos);
                }
                this.boundhint.autoUpdate()
                e.preventDefault();
            }
        } else if (e.key === "ArrowRight") {
            if (e.altKey) {
                return
            }
            const sel = document.getSelection()
            const range = sel.getRangeAt(0)

            let pos: Position;
            pos = op.nextValidPosition(root, sel.focusNode, sel.focusOffset);
            if (!pos) {
                // on right bound
                let posHistory: AimPosition = {
                    // 'index': this.currentContainerIndex() + 1,
                    // 'native': e,
                    'offset': 0,
                    'direction': 'right',
                    // 'softwrap': false,
                    'type': 'keyboard'
                }
                this.processJumpEvent(posHistory)
                e.preventDefault()
            } else {
                if (e.altKey) {
                }
                console.log(op.validChildNodes(root))
                pos = this.boundhint.safePosition(pos)
                if (e.shiftKey) {
                    while (pos && !op.isTag(pos.container, '#text')) {
                        pos = this.boundhint.safePosition(pos)
                        if (op.isTag(pos.container, 'label')) {
                            pos = op.nextValidPosition(root, pos.container, pos.offset);
                            break
                        }
                        pos = op.nextValidPosition(root, pos.container, pos.offset);
                    }
                    pos = this.boundhint.safePosition(pos)
                    // op.setPosition(pos, false, true);
                    document.getSelection().setBaseAndExtent(
                        sel.anchorNode,
                        sel.anchorOffset,
                        pos.container,
                        pos.offset
                    )
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
        if (!document.getSelection().isCollapsed) {
            if (this.isSelectedMultiContainer()) {
                this.handleDelete(e)
            } else {
                this.deleteSelecte()
                e.preventDefault()
            }
            return
        }

        if ((tag = op.isInStyleBound(this.currentContainer(), "right"))) {
            const style = op.tagToStyle(tag);
            if (style) {
                op.deleteStyle(tag, this.currentContainer());
                e.preventDefault();
            }
            return;
        } else if ((tag = op.isInLabelBound(this.currentContainer(), "right"))) {
            let pos = op.previousValidPosition(this.editableRoot(), tag, 0)
            tag.parentElement.removeChild(tag)
            pos = this.boundhint.safePosition(pos)
            op.setPosition(pos)
            this.boundhint.autoUpdate()

            e.preventDefault();
            this.dispatchInputEvent()
            return
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

    isSelectedMultiContainer() {
        return false
    }

    defaultHandleBackspace(e: React.KeyboardEvent) {
        let tag;

        if (!document.getSelection().isCollapsed) {
            if (this.isSelectedMultiContainer()) {
                this.handleBackspace(e)
            } else {
                this.deleteSelecte()
                e.preventDefault()
            }
            return
        }

        // debugger
        if ((tag = op.isInStyleBound(this.currentContainer(), "left"))) {
            const style = op.tagToStyle(tag);
            if (style) {
                op.deleteStyle(tag, this.currentContainer());
                e.preventDefault();
            }
            this.dispatchInputEvent()
            return;
        } else if ((tag = op.isInLabelBound(this.currentContainer(), "left"))) {
            let pos = op.previousValidPosition(this.editableRoot(), tag, 0)
            tag.parentElement.removeChild(tag)
            pos = this.boundhint.safePosition(pos)
            op.setPosition(pos)
            this.boundhint.autoUpdate()
            e.preventDefault();
            this.dispatchInputEvent()
            return
        } else {
            const sel = document.getSelection()
            if (op.isTag(sel.focusNode, 'label')) {
                sel.focusNode.parentElement.removeChild(sel.focusNode)
                e.preventDefault()
                this.dispatchInputEvent()
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

    dispatchInputEvent() {
        const event = new Event('input', { 'bubbles': true, cancelable: true })
        this.editableRoot().dispatchEvent(event)
    }

    handleInputKeyDown(e: React.KeyboardEvent) {
        console.log(['input key down', e])
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


    deleteSelecte() {
        // if (document.getSelection().isCollapsed) {
        //     return
        // }
        document.getSelection().getRangeAt(0).deleteContents()
        let pos = op.currentPosition(this.editableRoot())
        pos = this.boundhint.safePosition(pos)
        op.setPosition(pos)
        this.dispatchInputEvent()
    }

    defaultHandleKeyDown(e: React.KeyboardEvent) {
        if (this.inComposition) {
            e.preventDefault()
            e.stopPropagation()
            return
        }

        console.log(['keydown', e.key])
        if (e.key.match(/[a-zA-Z@#/$]/)) {
            this.insertHistory.push(e.key)
            while (this.insertHistory.length > 5) {
                this.insertHistory.splice(0, 1)
            }
        } else {
            this.insertHistory.splice(0, this.insertHistory.length)
        }

        if (this.insertHistory[this.insertHistory.length - 1] === '$') {
            if (this.insertHistory[this.insertHistory.length - 2] === '$') {
                const textRange = op.previousTextRange(this.currentContainer())
                if (textRange.cloneContents().textContent.match(/[￥$]/)) {
                    textRange.deleteContents()
                }
                const [node, noticable] = this.lazyCreateElement({
                    'tagName': 'math',
                    'textContent': '',
                })

                const range = document.getSelection().getRangeAt(0)
                range.insertNode(node[0])
                noticable[0].componentDidMount()
                const math = noticable[0] as any as InlineMath
                math.root.click()
                e.preventDefault()
                e.stopPropagation()
                return
            }
        }

        if (op.isTag(((e as any).target), 'input')) {
            debugger
            this.handleInputKeyDown(e)
            return
        }

        if (e.key === "Enter") {
            const pos = op.currentPosition(this.currentContainer())
            if (op.isTag(pos.container, 'label')) {
                const lb: HTMLLabelElement = pos.container as HTMLLabelElement
                lb.click()
                // lb.classList.add("inline-key-hovered");
                this.boundhint.autoUpdate({ root: this.currentContainer(), enter: true, keyboardEvent: e })
                e.preventDefault()
                return
            }
            // debugger
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
                    this.dispatchInputEvent()
                    op.applyStyle(e.key, this.currentContainer());
                    this.boundhint.autoUpdate({ force: true, root: this.currentContainer() })

                    this.lastEditTime = new Date().getTime()

                    e.preventDefault();
                    return;
                }

            }
        }

        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
            this.clearJumpHistory()
        }
    }

    handleMouseDown(e: React.MouseEvent) {
    }

    defaultHandleMouseEnter(e) {
    }

    storePosition(posHistory?: AimPosition) {
        if (!posHistory) {
            posHistory = {
                'index': this.currentContainerIndex(),
                'offset': op.getCaretReletivePosition(this.currentContainer()),
            }
        }
        this.posHistory = posHistory
    }
    releasePosition() {
        this.setTargetPosition(this.posHistory)
    }

    defaultHandleMouseDown(e) {
        console.log([this.blockData().order, 'MouseDown', e.target])

        this.clearJumpHistory()

        this.boundhint.safeMouseClick(this.editableRoot())
        if (op.findParentMatchTagName(e.target as any, 'label', this.editableRoot())) {
            this.boundhint.remove()
            return
        }
        // 取消这一行的效果，否则会导致按下时的选中位置和实际位置不一致
        // this.boundhint.hintElement(e.target)

        if (!this.props.active) {
            this.props.onActiveShouldChange({
                relative: {
                    'type': 'mouse',
                }
            })
        }

        this.handleMouseDown(e)
    }

    defaultHandleMouseUp(e: React.MouseEvent) {
        console.log([this.blockData().order, 'MouseUp', e])
        if (op.findParentMatchTagName(e.target as any, 'label', this.editableRoot())) {
            this.boundhint.remove()
            return
        }

        const valid = this.boundhint.safeMousePosition()
        if (!valid) { // 非合法的位置
            const parent = op.findParentMatchTagName(e.target as Node, 'label', this.currentContainer())
            if (parent) {
                const pos = op.createPosition(this.currentContainer(), parent, 0)
                op.setPosition(pos)
            }
        }
        this.boundhint.autoUpdate({ root: this.currentContainer(), click: true, mouseEvent: e })
        console.log()
    }

    makeContentEditable(contentEditable: React.ReactNode) {
        return contentEditable
    }

    processMergeEvent(e: MergeEvent): boolean {
        return true
    }

    processJumpEvent(e: AimPosition): boolean {
        if (e.type === 'mouse') {
            return true
        }
        console.log(['jump', e])

        let neighbor
        const cur = this.currentContainer()
        if (e.direction === 'up') {
            neighbor = this.previousRowContainer(cur)
        } else if (e.direction === 'down') {
            neighbor = this.nextRowContainer(cur)
        } else if (e.direction === 'left') {
            neighbor = this.previousContainer(cur)
        } else if (e.direction === 'right') {
            neighbor = this.nextContainer(cur)
        }


        if (neighbor) {
            this.activeContainer2(neighbor, e.offset, e.softwrap)
            return true
        } else {
            if (e.stopPropagation) {
                return false
            }
            const blockDelta = ((e.direction === 'up' || e.direction === 'left') ? -1 : 0)
            e.index = blockDelta
            this.props.onActiveShouldChange({ 'relative': e })
            return true
        }
    }

    renderContextMenu() {
        return

    }

    handleSelect(e) {
        // console.log(e)

    }

    handleDataChange(e) {
        debugger
    }

    public get placeholder(): string | undefined {
        return undefined
    }

    renderContentEditable() {
        const inner = this.renderInnerContainer()
        return <ContentEditable
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
            {inner}
        </ContentEditable>
    }

    renderInnerContainer() {
        return undefined
    }

    render(): React.ReactNode {
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
            onCompositionStart={this.handleCompositionStart}
            onCompositionEnd={this.handleCompositionEnd}
            onCompositionUpdate={this.handleCompositionUpdate}
            onMouseDown={this.defaultHandleMouseDown}
            onMouseUp={this.defaultHandleMouseUp}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
        >
            {this.makeContentEditable(
                this.renderContentEditable()
            )}
        </div>
    }
}


// export interface ABCBlockType<T extends typeof ABCBlock> {
//     block: T
// }

export type ABCBlockType<T extends typeof ABCBlock> = T 