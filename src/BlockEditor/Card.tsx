import React, { RefObject } from "react";
import * as block from "./Blocks"
import styles from "./Card.module.css"
import { Block, JumpRef } from "./Blocks/Common"
import { Serialize, mergeBlockData } from "./Blocks/render";
import produce from "immer"
import * as op from "./operation"
import * as BE from "./event/eventtype";
import { EventManager, TEvent } from "./event/emitter";
import { BoundHint } from "./BoundHint";
import { FunctionButton } from "./FunctionButton"


interface CardProps {
    blocks?: Block[]
    onShiftEnter?: (e: React.KeyboardEvent) => void
    onEnter?: (e: React.KeyboardEvent) => void
    onBlur?: (e: React.FocusEvent) => void
    onChange?: (e: React.SyntheticEvent) => void
}
interface CardStats {
    blocks: Block[]
    // dirtyHtml: { [key: number]: string }
    cursor: number
    selectionMode: boolean
    selectionStart?: number
    selectionEnd?: number
    selection: {}

    initialPos?: { start: number, end: number }
    historyOffset?: number
    jumpRef?: JumpRef
    focusBlockRef?: HTMLElement
}


const emptyBlock = {
    order: ''
}


const defaultPropsV2: CardProps = {
    blocks: [
        { order: 'a', type: 'heading', level: 1, 'data': { dom: [{ tagName: '#text', textContent: 'Header 1' }] } },
        {
            order: 'b', type: 'paragraph', 'data': {
                dom: [{ tagName: '#text', textContent: 'normal' }]
            }
        },
        {
            order: 'ba', type: 'paragraph', 'data': {
                dom: []
            }
        },
        {
            order: 'c', type: 'paragraph', 'data': {
                dom: [
                    { tagName: '#text', textContent: 'normal' },
                    { tagName: 'b', textContent: 'bold' },
                    {
                        tagName: 'i', textContent: 'italic', children:
                            [
                                { tagName: 'b', textContent: 'Bold Italic' },
                                { tagName: '#text', textContent: 'italic' }
                            ]
                    },
                ]
            }
        },
        {
            order: 'd', type: 'paragraph', 'data': {
                dom: [
                    { tagName: '#text', textContent: 'Normal Text' },
                    { tagName: '#text', textContent: 'Normal Text' },
                    { tagName: 'math', textContent: "\\int_0^\\infty x^2 dx" },
                    { tagName: '#text', textContent: 'Normal Text' },
                    { tagName: '#text', textContent: 'Normal Text' },
                    { tagName: '#text', textContent: 'Normal Text' },
                    { tagName: '#text', textContent: 'Normal Text' },
                    { tagName: '#text', textContent: 'Normal Text' },
                    { tagName: '#text', textContent: 'Normal Text' },
                    { tagName: '#text', textContent: 'Normal Text' },
                    { tagName: 'b', textContent: 'Bold Text' },
                    { tagName: 'i', textContent: 'Itali Text' },
                    { tagName: 'i', textContent: 'Itali Text', children: [{ tagName: 'b', textContent: '' }] },
                ]
            }
        },
        {
            order: 'da', type: 'blockquote', 'data': {
                dom: [
                    { tagName: '#text', textContent: 'Normal Text' },
                    { tagName: 'b', textContent: 'Bold Text' },
                    { tagName: 'i', textContent: 'Itali Text' },
                    { tagName: '#text', textContent: 'Normal Text' },
                ]
            }
        },
        { order: 'e', type: 'heading', level: 2, 'data': { dom: [{ tagName: '#text', textContent: 'Header 2' }] } },
        { order: 'ea', type: 'formular', 'data': { dom: [{ tagName: 'math', textContent: String.raw`c = \pm\sqrt{a^2 + b^2}` }] } },
        { order: 'f', type: 'heading', level: 3, 'data': { dom: [{ tagName: '#text', textContent: 'Header 3' }] } },
        {
            order: 'fa', type: 'taskList', 'data': {
                dom: [
                    { tagName: 'li', attributes: { level: 1 }, textContent: 'list 1' },
                    {
                        tagName: 'li', attributes: { level: 2 }, textContent: 'list 2', children: [
                            { tagName: '#text', textContent: 'Normal Text' },
                            { tagName: 'b', textContent: 'Bold Text' },
                            { tagName: 'i', textContent: 'Itali Text' },
                            { tagName: '#text', textContent: 'Normal Text' },
                        ]
                    },
                    { tagName: 'li', attributes: { level: 1 }, textContent: 'list 1' },
                ]
            }
        },
        { order: 'g', type: 'heading', level: 4, 'data': { dom: [{ tagName: '#text', textContent: 'Header 4' }] } },
        {
            order: 'ga', type: 'orderedList', 'data': {
                dom: [
                    { tagName: 'li', attributes: { level: 1 }, children: [{ tagName: '#text', textContent: 'Normal Text' },] },
                    {
                        tagName: 'li', attributes: { level: 2 }, children: [
                            { tagName: '#text', textContent: 'Normal Text' },
                            { tagName: 'b', textContent: 'Bold Text' },
                            { tagName: 'i', textContent: 'Itali Text' },
                            { tagName: '#text', textContent: 'Normal Text' },
                        ]
                    },
                    { tagName: 'li', attributes: { level: 1 }, children: [{ tagName: '#text', textContent: 'List 3' },] },
                ]
            }
        },
        { order: 'h', type: 'heading', level: 5, 'data': { dom: [{ tagName: '#text', textContent: 'Header 5' }] } },
        {
            order: 'i', type: 'list', 'data': {
                dom: [
                    { tagName: 'li', attributes: { level: 1 }, children: [{ tagName: '#text', textContent: 'Normal Text' },] },
                    {
                        tagName: 'li', attributes: { level: 2 }, children: [
                            { tagName: '#text', textContent: 'Normal Text' },
                            { tagName: 'b', textContent: 'Bold Text' },
                            { tagName: 'i', textContent: 'Itali Text' },
                            { tagName: '#text', textContent: 'Normal Text' },
                        ]
                    },
                    { tagName: 'li', attributes: { level: 1 }, children: [{ tagName: '#text', textContent: 'List 3' },] },
                ]
            }
        },
        {
            order: 'j',
            type: 'table',
            unmergeable: true,
            'data': {
                dom: [
                    {
                        tagName: 'tr', children: [
                            { tagName: 'td', textContent: 'td1-1' },
                            { tagName: 'td', textContent: 'td1-2' },
                            { tagName: 'td', textContent: 'td1-3' },
                            { tagName: 'td', textContent: 'td1-4' },
                        ]
                    },
                    {
                        tagName: 'tr', children: [
                            { tagName: 'td', textContent: 'td2-1' },
                            { tagName: 'td', textContent: 'td2-2' },
                            { tagName: 'td', textContent: 'td2-3' },
                            { tagName: 'td', textContent: 'td2-4' },
                        ]
                    },
                    {
                        tagName: 'tr', children: [
                            { tagName: 'td', textContent: 'td3-1', children: [{ tagName: 'b', textContent: 'Bold Text' },] },
                            { tagName: 'td', textContent: 'td3-2' },
                            { tagName: 'td', textContent: 'td3-3' },
                            { tagName: 'td', textContent: 'td3-4' },
                        ]
                    },
                ]
            }
        },
        {
            order: 'k',
            unmergeable: true,
            type: 'code', level: 5, 'data': {
                dom: [
                    { tagName: 'code', attributes: { mark: true }, textContent: 'Line 1' },
                    { tagName: 'code', attributes: { mark: true }, textContent: 'Line 2' }
                ]
            }
        },

        // { order: 'j', 'type': 'list', 'data': { 'style': 'ordered', 'items': [[0, 'Item 1'], [1, 'Item 2'], [0, 'Item 3']] } },
        // { order: 'l', 'type': 'list', 'data': { 'style': 'unordered', 'items': [[0, 'Item 1'], [1, 'Item 2'], [0, 'Item 3']] } },
    ]
}


class Card extends React.Component<CardProps, CardStats> {
    static defaultProps = defaultPropsV2
    portalCaller: EventManager
    focusBlockRef: RefObject<HTMLElement>
    ref: RefObject<HTMLElement>
    constructor(props) {
        super(props);
        this.portalCaller = new EventManager()
        this.state = {
            blocks: (this.props.blocks || defaultPropsV2.blocks || []),
            cursor: 0,
            jumpRef: null,
            selectionMode: false,
            selection: {},
            focusBlockRef: null,
        }
        this.ref = React.createRef()
        this.focusBlockRef = React.createRef()
    }
    handleComponentEvent = (evt: TEvent) => {
    }
    componentDidMount(): void {
        this.portalCaller.on('card', this.handleComponentEvent)
    }
    componentDidUpdate(prevProps: Readonly<CardProps>, prevState: Readonly<CardStats>, snapshot?: any): void {
        // console.log(this.state.cursor)
    }

    handleJumpToAbove = (evt, ind) => {
        const { blocks, historyOffset } = this.state
        let offset = historyOffset;
        if (!offset) {
            offset = op.getCaretReletivePosition(evt.ref)
        }
        this.setState({
            cursor: Math.max(0, ind - 1),
            historyOffset: offset,
            jumpRef: {
                "from": 'below',
                "offset": offset,
                "type": "jump"
            }
        })
    }
    handleJumpToBelow = (evt, ind) => {
        const { blocks, historyOffset } = this.state
        let offset = historyOffset;
        if (!offset) {
            offset = op.getCaretReletivePositionAtLastLine(evt.ref)
        } else {
            this.portalCaller.call('boundhint', { name: 'unexpand', 'data': {} })
        }

        this.setState({
            cursor: Math.min(ind + 1, blocks.length - 1),
            historyOffset: offset,
            jumpRef: {
                "from": 'above',
                "offset": offset,
                "type": "jump"
            }
        })
    }
    handleJumpToAboveEnd = (evt, ind) => {
        this.setState({
            cursor: Math.max(0, ind - 1),
            jumpRef: {
                "from": 'below',
                "type": "neighbor"
            }
        })
    }
    handleJumpToBelowStart = (evt, ind) => {
        const { blocks } = this.state
        // if (ind < blocks.length - 1) {

        this.setState({
            cursor: Math.min(ind + 1, blocks.length - 1),
            jumpRef: {
                "from": 'above',
                "type": "neighbor"
            }
        })

    }
    handleChangeBlockType = (evt: BE.BlockChangeEvent<HTMLElement>, ind) => {
        // this.eventManager.call(blocks[ind].order, { name: 'changeBlockType', data: { type: evt.target.value } })
        const newState = produce(this.state, draft => {
            draft.blocks[ind].type = evt.type
            draft.blocks[ind].level = evt.level
            draft.blocks[ind].lang = evt.lang
            draft.cursor = ind
            draft.historyOffset = null
            draft.jumpRef = null
            // TODO get serialized dom from block 
            // draft[ind].data.dom = 
        })
        this.setState(newState)
    };
    handleShiftEnter = (e) => {
        this.props.onShiftEnter(e);
    }
    handleAppendAbove = (e, ind) => {
        const { blocks } = this.state
        const newOrder = op.midString((blocks[ind - 1] || emptyBlock).order, blocks[ind].order)
        const newState = produce(this.state, draft => {
            const block: Block = {
                id: 0, order: newOrder,
                type: 'paragraph',
                data: { dom: [] }
            }

            draft.blocks.splice(ind, 0, block)
            draft.cursor = ind + 1
            // draft.dirtyHtml[newOrder] = block
        })
        console.log([`cursor`, ind, this.state.cursor, newState.cursor])
        this.setState(newState)
    }
    handleAppendBelow = (e, ind) => {
        // debugger
        const { blocks } = this.state

        const newOrder = op.midString(blocks[ind].order, (blocks[ind + 1] || emptyBlock).order)
        const newState = produce(this.state, draft => {
            const block: Block = {
                id: 0, order: newOrder,
                type: 'paragraph',
                data: { dom: [] }
            }
            draft.blocks.splice(ind + 1, 0, block)
            draft.cursor = ind + 1
            // draft.dirtyHtml[newOrder] = block
        })
        this.setState(newState)
    }

    handleMerge = (evt: BE.MergeEvent, ind) => {
        const { blocks } = this.state

        const nind = ind + (evt.direction === 'left' ? -1 : 1)
        const nblock = this.portalCaller.call(blocks[nind].order, { name: 'serialize', data: {} }) as Block
        console.log(nblock)
        const newBlocks = evt.direction === 'left' ?
            mergeBlockData(nblock, evt.block) :
            mergeBlockData(evt.block, nblock)
        console.log([evt.offset])
        const newState = produce(this.state, draft => {
            if (evt.direction === 'left') {
                draft.blocks.splice(ind - 1, 2, newBlocks)
                draft.cursor = ind - 1
            } else {
                draft.blocks.splice(ind, 2, newBlocks)
            }
            draft.jumpRef = {
                'type': 'merge',
                offset: evt.offset,
            }
        })

        this.setState(newState)
    }
    handleSplit = (evt: BE.SplitEvent, ind) => {
        const { blocks } = this.state
        const up = blocks[ind - 1]
        const down = blocks[ind]
        var upOrder = up ? up.order : ""
        var downOrder = down ? down.order : ""
        console.log(evt.left)
        const newState = produce(this.state, draft => {
            var news = [evt.left, evt.focus, evt.right].filter((item) => (item !== undefined))
            var offset = evt.left ? 1 : 0
            news = news.map((item, i) => {
                item.order = op.midString(upOrder, downOrder)
                item.lastEditTime = new Date().getTime()
                // item order should be 'new' or React will not render because we currently use order as the component 'key' property
                upOrder = item.order
                return item
            })

            draft.cursor += offset
            draft.blocks.splice(ind, 1, ...news)
            draft.jumpRef = undefined
        })
        this.setState(newState)
    }

    handleCaretMove = (evt: BE.CaretEvent<HTMLElement>, ind) => {
        var cur = evt.caret.container

        const direction = evt.direction
        const offset = evt.offset
        this.setState({ historyOffset: offset })
        this.portalCaller.call('boundhint', { name: 'expand', data: { el: cur, offset: evt.caret.offset, direction } })

    }
    handleFocus = (e, ind) => {
        console.log(['focus', ind, this.state.blocks[ind], e]) // TODO 记录光标位置，用于merge 后回滚
        if (this.state.cursor !== ind) {
            this.setState({ cursor: ind })
        }
    }
    handleDataChange = (e: BE.BlockEvent<HTMLElement>, ind) => {
        // debugger
    }

    render() {
        const { blocks, cursor } = this.state

        return <article
            ref={this.ref}
            onKeyDown={(e) => {
                if (this.state.selectionMode) {
                    if (e.key === 'Enter') {
                        this.setState({
                            cursor: this.state.selectionEnd,
                            selection: {}, selectionMode: false
                        })
                        e.preventDefault()
                    } else if (e.key === 'ArrowDown') {
                        const newState = produce(this.state, draft => {
                            if (draft.cursor < draft.blocks.length - 1) {
                                if (e.shiftKey) {
                                    if (draft.selectionEnd < draft.selectionStart) {
                                        const cur = draft.blocks[draft.selectionEnd].order
                                        draft.selection[cur] = false
                                    }
                                } else {
                                    draft.selection = {}
                                }
                                draft.selectionEnd++
                                if (!e.shiftKey) {
                                    draft.selectionStart = draft.selectionEnd
                                }
                                // draft.cursor++
                                const newSelected = draft.blocks[draft.selectionEnd].order
                                draft.selection[newSelected] = true
                            }
                        })
                        this.setState(newState)
                        e.preventDefault()
                    } else if (e.key === 'ArrowUp') {
                        const newState = produce(this.state, draft => {
                            if (draft.cursor > 0) {
                                if (e.shiftKey) {
                                    if (draft.selectionEnd > draft.selectionStart) {
                                        const cur = draft.blocks[draft.selectionEnd].order
                                        draft.selection[cur] = false
                                    }
                                } else {
                                    draft.selection = {}
                                }
                                draft.selectionEnd--
                                if (!e.shiftKey) {
                                    draft.selectionStart = draft.selectionEnd
                                }
                                // draft.cursor--
                                const newSelected = draft.blocks[draft.selectionEnd].order
                                draft.selection[newSelected] = true
                            }
                        })
                        this.setState(newState)
                        e.preventDefault()
                    }

                }
                console.log(['Card', 'key down', e])
            }}

            onMouseUp={(e) => {
                // MouseUpEvent bubbled from Block Component, and Block Component will fix caret position first,
                // then boundhint will be applied,
                // there is no need for boundhint to consider block type.
                const range = document.getSelection().getRangeAt(0)
                const target = e.target as Node
                if (op.isTag(target, 'input')) {
                    return
                } else if (op.isTag(target, 'textarea')) {
                    return
                }
                console.log(e)
                this.portalCaller.call('boundhint', { data: { el: range.startContainer, offset: 0 }, name: 'expand' })
            }}

            onMouseDownCapture={(e) => {
                const newState = produce(this.state, draft => {
                    if (this.state.selectionMode) {
                        draft.selectionEnd = null
                        draft.selectionStart = null
                        draft.selectionMode = false
                        draft.selection = {}
                    }
                })
                this.setState(newState)
                if (op.isTag(e.target as Node, 'article')) {
                    console.log('prevent')
                    e.preventDefault()
                }
                const target = e.target as Node
                if (op.isTag(target, 'input') && (target as HTMLInputElement).type === 'checkbox') {
                    e.preventDefault()
                }
            }}
            className={[
                styles.card,
                this.state.selectionMode ? 'block-selection-mode' : '',
            ].join(' ')}>
            <FunctionButton rel={this.state.focusBlockRef} ></FunctionButton>
            <BoundHint
                root={this.ref.current}
                disable={this.state.selectionMode}
                eventManager={this.portalCaller}></BoundHint>
            {blocks.map((val, ind) => {
                var blockType;

                switch (val.type) {
                    case 'heading':
                        blockType = block.Heading
                        break
                    case 'paragraph':
                        blockType = block.Paragraph
                        break
                    case 'blockquote':
                        blockType = block.Blockquote
                        break
                    case 'list':
                        blockType = block.List
                        break
                    case 'orderedList':
                        blockType = block.OrderedList
                        break
                    case 'taskList':
                        blockType = block.TaskList
                        break
                    case 'table':
                        blockType = block.Table
                        break
                    case 'code':
                        blockType = block.Code
                        break
                    case 'formular':
                        blockType = block.Formular
                        break
                    default:
                        return <></>
                }

                const blockEl = React.createElement(blockType as typeof block.DefaultBlock, {
                    key: val.order,
                    uid: val.order,
                    initialContentEditable: ind === cursor,
                    eventManager: this.portalCaller,
                    jumpRef: ind === cursor ? this.state.jumpRef : undefined,
                    selected: (this.state.selection[val.order] === true),
                    selectionMode: this.state.selectionMode,
                    onFocus: (e) => this.handleFocus(e, ind),
                    onDataChange: (e) => this.handleDataChange(e, ind),
                    onCaretMove: (e) => this.handleCaretMove(e, ind),
                    onCaretMoveTo: (e) => this.handleCaretMove(e, ind),
                    onMerge: (e) => this.handleMerge(e, ind),
                    onSplit: (e) => this.handleSplit(e, ind),
                    onJumpAbove: (evt) => this.handleJumpToAbove(evt, ind),
                    onMouseEnter: (e) => {
                        this.setState({
                            focusBlockRef: e.target as HTMLElement,
                        })
                    },
                    onSelectBlock: (evt) => {
                        console.log(['Select Block', val.order, ind,
                            evt,
                            this.state.selectionMode,
                            this.state.selectionStart])
                        const newState = produce(this.state, draft => {
                            draft.selection[val.order] = true
                            if (!draft.selectionMode) {
                                draft.selectionStart = ind
                                draft.selectionEnd = ind
                                draft.selectionMode = true
                            }
                        })
                        this.setState(newState)
                    },
                    onMouseSelect: (evt) => {
                        const newState = produce(this.state, draft => {
                            if (!this.state.selectionMode) {
                                draft.selectionMode = true
                                draft.selectionStart = cursor
                                draft.selectionEnd = ind
                                draft.selection[draft.blocks[cursor].order] = true
                            }
                            draft.selection[val.order] = true

                            // draft.cursor = ind
                            if (ind < draft.selectionStart) {
                                draft.selection = {}
                                for (let i = draft.selectionStart; i >= ind; i--) {
                                    draft.selection[draft.blocks[i].order] = true
                                }
                            } else if (ind > draft.selectionStart) {
                                draft.selection = {}
                                for (let i = draft.selectionStart; i <= ind; i++) {
                                    draft.selection[draft.blocks[i].order] = true
                                }
                            } else {
                                draft.selection = {}
                                draft.selection[draft.blocks[ind].order] = true
                            }
                            draft.selectionEnd = ind
                        })

                        console.log(newState.selection)
                        this.setState(newState)
                    },
                    onJumpBelow: (evt) => this.handleJumpToBelow(evt, ind),
                    onChangeBlockType: (evt) => this.handleChangeBlockType(evt, ind),
                    onJumpToAboveEnd: (evt) => this.handleJumpToAboveEnd(evt, ind),
                    onJumpToBelowStart: (evt) => this.handleJumpToBelowStart(evt, ind),
                    data: val,
                })
                return blockEl
            })}
            <button onClick={() => { this.setState({ cursor: cursor - 1 }) }}>up</button>
            <button onClick={() => { this.setState({ cursor: cursor + 1 }) }}>down</button>
        </article>
    }
}

// Card.defaultProps = defaultProps;

export { Card }