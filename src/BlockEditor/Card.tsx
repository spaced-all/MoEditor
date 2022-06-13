import React from "react";
import * as block from "./Blocks"
import styles from "./Card.module.css"
import { Block, JumpRef } from "./Blocks/Common"
import { Serialize } from "./Blocks/render";
import produce from "immer"
import * as op from "./operation"
import * as BE from "./event/eventtype";
import { EventManager, TEvent } from "./event/emitter";
import { BoundHint } from "./BoundHint";



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
}


const emptyBlock = {
    order: ''
}


const defaultPropsV2: CardProps = {
    blocks: [
        { order: 'a', type: 'header', level: 1, 'data': { dom: [{ tagName: '#text', textContent: 'Header 1' }] } },
        {
            order: 'b', type: 'paragraph', 'data': {
                dom: [{ tagName: '#text', textContent: 'normal' }]
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
        { order: 'e', type: 'header', level: 2, 'data': { dom: [{ tagName: '#text', textContent: 'Header 2' }] } },
        { order: 'f', type: 'header', level: 3, 'data': { dom: [{ tagName: '#text', textContent: 'Header 3' }] } },
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
        { order: 'g', type: 'header', level: 4, 'data': { dom: [{ tagName: '#text', textContent: 'Header 4' }] } },
        {
            order: 'ga', type: 'orderedList', 'data': {
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
        { order: 'h', type: 'header', level: 5, 'data': { dom: [{ tagName: '#text', textContent: 'Header 5' }] } },
        {
            order: 'i', type: 'list', 'data': {
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
        {
            order: 'j', type: 'table', 'data': {
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
                            { tagName: 'td', textContent: 'td3-1' },
                            { tagName: 'td', textContent: 'td3-2' },
                            { tagName: 'td', textContent: 'td3-3' },
                            { tagName: 'td', textContent: 'td3-4' },
                        ]
                    },
                ]
            }
        },
        {
            order: 'k', type: 'code', level: 5, 'data': {
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
    constructor(props) {
        super(props);
        this.portalCaller = new EventManager()
        this.state = {
            blocks: (this.props.blocks || defaultPropsV2.blocks || []),
            cursor: 0,
            jumpRef: null,
            selectionMode: false,
            selection: {},
        }
    }
    handleComponentEvent = (evt: TEvent) => {
        // if (evt.name ==='rerender') {
        //     if (this.state.historyOffset) {
        //         this.eventManager.call(evt.data.uid, { name: 'moveTo', data: { type: 'history', offset: this.state.historyOffset, from: 'above' } })
        //     }
        //     // evt.data.ref
        //     // this.eventManager.call(blocks[ind + 1].order, { name: 'moveTo', data: { type: 'history', offset: offset, from: 'above' } })
        // }
    }
    componentDidMount(): void {
        // const nextDirtyBlocks = produce(this.state.dirtyHtml, draft => {
        //     for (var b of this.state.blocks) {
        //         draft[b.order] = b
        //     }
        // })
        this.portalCaller.on('card', this.handleComponentEvent)

        // this.setState({ dirtyHtml: nextDirtyBlocks })
    }
    componentDidUpdate(prevProps: Readonly<CardProps>, prevState: Readonly<CardStats>, snapshot?: any): void {
        console.log(this.state.cursor)
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
        // this.setState({ historyOffset: offset, cursor: Math.min(ind + 1, blocks.length - 1) })

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
        //     const { blocks } = this.state
        //     this.portalCaller.call(blocks[ind + 1].order, { name: 'moveTo', data: { type: 'fisrt' } })
        // }

        this.setState({
            cursor: Math.min(ind + 1, blocks.length - 1),
            jumpRef: {
                "from": 'above',
                "type": "neighbor"
            }
        })

    }
    handleChangeBlockType = (evt: BE.BlockChangeEvent<HTMLElement>, ind) => {
        const { blocks } = this.state
        // this.eventManager.call(blocks[ind].order, { name: 'changeBlockType', data: { type: evt.target.value } })
        const newState = produce(this.state.blocks, draft => {
            draft[ind].type = evt.type
            draft[ind].level = evt.level
            draft[ind].lang = evt.lang
            // TODO get serialized dom from block 
            // draft[ind].data.dom = 
        })
        this.setState({ blocks: newState, cursor: ind })
    };
    handleShiftEnter = (e) => {
        this.props.onShiftEnter(e);
    }
    handleAppendAbove = (e, ind) => {
        const { blocks } = this.state
        const newOrder = op.midString((blocks[ind - 1] || emptyBlock).order, blocks[ind].order)
        const newState = produce(this.state, draft => {
            const block = {
                id: 0, order: newOrder, type: 'paragraph',
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
            const block = {
                id: 0, order: newOrder, type: 'paragraph',
                data: { dom: [] }
            }
            draft.blocks.splice(ind + 1, 0, block)
            draft.cursor = ind + 1
            // draft.dirtyHtml[newOrder] = block
        })
        this.setState(newState)
    }
    handleMergeAbove = (evt, ind) => {
        const { blocks } = this.state
        console.log(['handleMergeAbove', evt])
        const blockA = produce(this.state.blocks[ind - 1], draft => {
            draft.data.dom = Serialize(this.portalCaller.call(blocks[ind - 1].order, { 'name': 'serialize', data: {} }))
        })

        const blockB = produce(this.state.blocks[ind], draft => {
            draft.data.dom = Serialize(this.portalCaller.call(blocks[ind].order, { 'name': 'serialize', data: {} }))
        })

        const caretPos = this.portalCaller.call(blocks[ind - 1].order, { 'name': 'endCaretOffset', data: {} })
        const merged = op.mergeBlockData(blockA, blockB)
        const newState = produce(this.state, draft => {
            draft.blocks.splice(ind - 1, 2, merged)
            draft.cursor = ind - 1
            draft.historyOffset = caretPos
            draft.jumpRef = {
                "from": 'below',
                'offset': caretPos,
                "type": 'jump'
            }
        })

        this.setState(newState)
    }


    handleMergeBelow = (evt, ind) => {
        const { blocks } = this.state
        const val = blocks[ind]
        debugger
        this.portalCaller.call('boundhint', { name: 'unexpand', 'data': {} })
        const blockA = produce(this.state.blocks[ind], draft => {
            draft.data.dom = Serialize(this.portalCaller.call(blocks[ind].order, { 'name': 'serialize', data: {} }))
        })

        const blockB = produce(this.state.blocks[ind + 1], draft => {
            draft.data.dom = Serialize(this.portalCaller.call(blocks[ind + 1].order, { 'name': 'serialize', data: {} }))
        })

        const merged = op.mergeBlockData(blockA, blockB)
        const newState = produce(this.state, draft => {
            draft.blocks.splice(ind + 1, 1)
            draft.blocks[ind] = merged
            draft.cursor = ind
        })

        this.setState(newState)

    }
    handleCaretMove = (evt: BE.CaretEvent<HTMLElement>, ind) => {
        console.log(evt.caret)
        var cur = evt.caret.container

        const direction = evt.direction
        const offset = evt.offset
        this.setState({ historyOffset: offset })
        this.portalCaller.call('boundhint', { name: 'expand', data: { el: cur, offset: evt.caret.offset, direction } })

    }
    handleFocus = (e, ind) => {
        console.log(['focus', ind, this.state.blocks[ind], e]) // TODO 记录光标位置，用于merge 后回滚

        this.setState({ cursor: ind })
    }
    handleDataChange = (e: BE.BlockEvent<HTMLElement>, ind) => {
        // debugger
    }

    render() {
        const { blocks, cursor } = this.state

        return <article
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
                const range = document.getSelection().getRangeAt(0)
                const target = e.target as Node
                if (op.isTag(target, 'input')) {
                    // const sel = document.getSelection()
                    // const neighbor = op.nextCaretPosition(target.parentElement, target, 0)
                    // op.setCaretPosition(neighbor)
                    // this.portalCaller.call('boundhint', { data: { el: range.startContainer, offset: 0 }, name: 'expand' })
                    return
                } else if (op.isTag(target, 'textarea')) {
                    return
                }
                console.log(e)
                this.portalCaller.call('boundhint', { data: { el: range.startContainer, offset: 0 }, name: 'expand' })
            }}
            // onMouseMove={(e) => {
            //     console.log((e.target as Node).nodeName)
            // }}
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
                if (op.isTag(target, 'input')) {
                    e.preventDefault()
                }
            }}
            className={[
                styles.card,
                this.state.selectionMode ? 'block-selection-mode' : '',
            ].join(' ')}>
            <BoundHint
                disable={this.state.selectionMode}
                eventManager={this.portalCaller}></BoundHint>
            {blocks.map((val, ind) => {
                var blockType;
                switch (val.type) {
                    case 'header':
                        blockType = block.Section
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
                    case 'ol':
                    case 'orderedList':
                    case 'orderedlist':
                        blockType = block.OrderedList
                        break
                    case 'task':
                    case 'todo':
                    case 'taskList':
                    case 'todoList':
                        blockType = block.TaskList
                        break
                    case 'table':
                        blockType = block.Table
                        break
                    case 'code':
                        blockType = block.Code
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
                    onAppendAbove: (e) => this.handleAppendAbove(e, ind),
                    onAppendBelow: (e) => this.handleAppendBelow(e, ind),
                    onCaretMove: (e) => this.handleCaretMove(e, ind),
                    onCaretMoveTo: (e) => this.handleCaretMove(e, ind),
                    onMergeAbove: (e) => this.handleMergeAbove(e, ind),
                    onMergeBelow: (e) => this.handleMergeBelow(e, ind),
                    onJumpAbove: (evt) => this.handleJumpToAbove(evt, ind),
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
                // return <div className="selection-board">
                //     <input type={'checkbox'} checked={this.state.selection[val.order] === true} onChange={(e) => {
                //         const newSelection = produce(this.state.selection, draft => {
                //             draft[val.order] = (draft[val.order] === false || draft[val.order] === undefined) ? true : false
                //         })
                //         this.setState({ selection: newSelection })
                //     }}></input>
                //     {blockEl}
                // </div>
                // if (this.state.selectionMode) {
                // } else {
                return blockEl
                // }
            })}
            <button onClick={() => { this.setState({ cursor: cursor - 1 }) }}>up</button>
            <button onClick={() => { this.setState({ cursor: cursor + 1 }) }}>down</button>

        </article>
    }
}

// Card.defaultProps = defaultProps;

export { Card }