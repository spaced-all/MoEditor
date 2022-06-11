import React from "react";
import * as block from "./Blocks"
import styles from "./Card.module.css"
import { Block, BlockquoteBlock, ParagraphBlock, SectionBlock, Dom } from "./Blocks/common"
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

    initialPos?: { start: number, end: number }
    historyOffset?: number
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
        { order: 'g', type: 'header', level: 4, 'data': { dom: [{ tagName: '#text', textContent: 'Header 4' }] } },
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

        // { order: 'j', 'type': 'list', 'data': { 'style': 'ordered', 'items': [[0, 'Item 1'], [1, 'Item 2'], [0, 'Item 3']] } },
        // { order: 'l', 'type': 'list', 'data': { 'style': 'unordered', 'items': [[0, 'Item 1'], [1, 'Item 2'], [0, 'Item 3']] } },
    ]
}


class Card extends React.Component<CardProps, CardStats> {
    static defaultProps = defaultPropsV2
    eventManager: EventManager
    constructor(props) {
        super(props);
        this.eventManager = new EventManager()
        this.state = {
            blocks: (this.props.blocks || defaultPropsV2.blocks || []),
            cursor: 0,
        }
    }
    handleComponentEvent = (evt: TEvent) => {
        // if (evt.name == 'rerender') {
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
        this.eventManager.on('card', this.handleComponentEvent)

        // this.setState({ dirtyHtml: nextDirtyBlocks })
    }
    componentDidUpdate(prevProps: Readonly<CardProps>, prevState: Readonly<CardStats>, snapshot?: any): void {
        console.log(this.state.cursor)
    }

    handleJumpAbove = (evt, ind) => {
        const { blocks, historyOffset } = this.state
        let offset = historyOffset;
        if (!offset) {
            offset = op.getCaretReletivePosition(evt.ref)
        }
        this.eventManager.call(blocks[Math.max(0, ind - 1)].order, { name: 'moveTo', data: { type: 'history', offset: offset, from: 'below' } })
    }
    handleJumpBelow = (evt, ind) => {
        const { blocks, historyOffset } = this.state
        let offset = historyOffset;
        if (!offset) {
            offset = op.getCaretReletivePositionAtLastLine(evt.ref)
        } else {
            this.eventManager.call('boundhint', { name: 'unexpand', 'data': {} })
        }
        this.eventManager.call(blocks[Math.min(ind + 1, blocks.length - 1)].order, { name: 'moveTo', data: { type: 'history', offset: offset, from: 'above' } })
    }
    handleJumpToAboveEnd = (evt, ind) => {
        if (ind > 0) {
            const { blocks } = this.state
            this.eventManager.call(blocks[ind - 1].order, { name: 'moveTo', data: { type: 'last' } })
        }
    }
    handleJumpToBelowStart = (evt, ind) => {
        const { blocks } = this.state
        if (ind < blocks.length - 1) {
            const { blocks } = this.state
            this.eventManager.call(blocks[ind + 1].order, { name: 'moveTo', data: { type: 'fisrt' } })
        }
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
            draft.data.dom = Serialize(this.eventManager.call(blocks[ind - 1].order, { 'name': 'innerHTML', data: {} }))
        })

        const blockB = produce(this.state.blocks[ind], draft => {
            draft.data.dom = Serialize(this.eventManager.call(blocks[ind].order, { 'name': 'innerHTML', data: {} }))
        })

        const caretPos = this.eventManager.call(blocks[ind - 1].order, { 'name': 'endCaretOffset', data: {} })

        const merged = op.mergeBlockData(blockA, blockB)
        const newState = produce(this.state, draft => {
            draft.blocks.splice(ind - 1, 2, merged)
            draft.cursor = ind - 1
            draft.historyOffset = caretPos
        })

        this.setState(newState)
    }

    handleMerge = (evt, aind, bind) => {
        const { blocks } = this.state

        this.eventManager.call('boundhint', { name: 'unexpand', 'data': {} })
        const blockA = produce(this.state.blocks[aind], draft => {
            draft.data.dom = Serialize(this.eventManager.call(blocks[aind].order, { 'name': 'innerHTML', data: {} }))
        })

        const blockB = produce(this.state.blocks[bind], draft => {
            draft.data.dom = Serialize(this.eventManager.call(blocks[bind].order, { 'name': 'innerHTML', data: {} }))
        })

        const merged = op.mergeBlockData(blockA, blockB)
        const newState = produce(this.state, draft => {
            draft.blocks.splice(bind, 1)
            draft.blocks[aind] = merged
            draft.cursor = aind
        })

        this.setState(newState)
    }

    handleMergeBelow = (evt, ind) => {
        const { blocks } = this.state
        const val = blocks[ind]
        debugger
        this.eventManager.call('boundhint', { name: 'unexpand', 'data': {} })
        const blockA = produce(this.state.blocks[ind], draft => {
            draft.data.dom = Serialize(this.eventManager.call(blocks[ind].order, { 'name': 'innerHTML', data: {} }))
        })

        const blockB = produce(this.state.blocks[ind + 1], draft => {
            draft.data.dom = Serialize(this.eventManager.call(blocks[ind + 1].order, { 'name': 'innerHTML', data: {} }))
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

        const direction = evt.direction === 'right' ? 1 : 0
        const offset = evt.offset
        this.setState({ historyOffset: offset })
        this.eventManager.call('boundhint', { name: 'expand', data: { el: cur, offset: evt.caret.offset, direction } })

    }
    handleFocus = (e, ind) => {
        console.log(['focus', this.state.blocks[ind], e]) // TODO 记录光标位置，用于merge 后回滚
        const sel = document.getSelection()
        //  workaround
        const { blocks } = this.state
        if (!op.isParent(sel.focusNode, e.target)) {
            console.log(['workaround', sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset])
            if (this.state.historyOffset) {
                this.eventManager.call(blocks[ind].order, { name: 'moveTo', data: { type: 'history', offset: this.state.historyOffset, from: 'above' } })
                this.setState({ historyOffset: null })
            } else {
                const caret = op.firstCaretPosition(e.target)
                op.setCaretPosition(caret)
            }
        }
        // debugger
        // fix cursor

        // op.inTag

        this.setState({ cursor: ind })

    }
    handleDataChange = (e: BE.BlockEvent<HTMLElement>, ind) => {
        // debugger
    }

    render() {
        const { blocks, cursor } = this.state


        return <article
            onMouseUp={(e) => {
                const range = document.getSelection().getRangeAt(0)
                this.eventManager.call('boundhint', { data: { el: range.startContainer, offset: 0 }, name: 'expand' })
            }}
            onMouseDownCapture={(e) => {
                if (op.isTag(e.target as Node, 'article')) {
                    e.preventDefault()
                }
            }}
            className={styles.card}>
            <BoundHint eventManager={this.eventManager}></BoundHint>
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
                    default:
                        return <></>
                }

                return React.createElement(blockType as typeof block.DefaultBlock, {
                    key: val.order,
                    uid: val.order,
                    initialContentEditable: ind == cursor,
                    eventManager: this.eventManager,
                    initialPos: ind == cursor ? this.state.initialPos : undefined,
                    onFocus: (e) => this.handleFocus(e, ind),
                    onDataChange: (e) => this.handleDataChange(e, ind),
                    onAppendAbove: (e) => this.handleAppendAbove(e, ind),
                    onAppendBelow: (e) => this.handleAppendBelow(e, ind),
                    onCaretMove: (e) => this.handleCaretMove(e, ind),
                    onCaretMoveTo: (e) => this.handleCaretMove(e, ind),
                    onMergeAbove: (e) => this.handleMergeAbove(e, ind),
                    onMergeBelow: (e) => this.handleMergeBelow(e, ind),
                    onJumpAbove: (evt) => this.handleJumpAbove(evt, ind),
                    onJumpBelow: (evt) => this.handleJumpBelow(evt, ind),
                    onChangeBlockType: (evt) => this.handleChangeBlockType(evt, ind),
                    onJumpToAboveEnd: (evt) => this.handleJumpToAboveEnd(evt, ind),
                    onJumpToBelowStart: (evt) => this.handleJumpToBelowStart(evt, ind),
                    data: val as ParagraphBlock,
                })
            })}
            <button onClick={() => { this.setState({ cursor: cursor - 1 }) }}>up</button>
            <button onClick={() => { this.setState({ cursor: cursor + 1 }) }}>down</button>

        </article>
    }
}

// Card.defaultProps = defaultProps;

export { Card }