import React from "react";
import { ABCListData, DefaultBlock, DefaultBlockData, IndentItem, OrderedListData, TargetPosition as NextPosition, TargetPosition } from "../types";
import produce from "immer"
import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";
import * as op from "../dom"
import { MergeEvent, MergeResult } from "./events";
import { parseContent } from "./Common";

export interface ABCListProps extends ABCBlockProps {
}

export interface ABCListStats extends ABCBlockStates {
    data?: any
    isEnter?: boolean,
    historyPosition?: {
        ind: number,
        offset: number
    }
    posHistory?: TargetPosition
}


export abstract class ABCList<
    P extends ABCListProps,
    S extends ABCListStats,
    O extends HTMLElement, // outer block element type
    I extends HTMLElement // inner block element type
    > extends ABCBlock<P, S, O, I> {
    // static defaultProps = ABCBlock.defaultProps;
    // static blockName = 'heading';

    protected get contentEditableName(): string {
        return ``
    }

    static merge(self: DefaultBlockData, block: DefaultBlockData): MergeResult {
        // let blockData: ABCListData<IndentItem> = self[self.type]

        switch (block.type) {
            case 'blockquote':
            case 'paragraph':
            case 'heading':
                self = produce(self, draft => {
                    let blockData: ABCListData<IndentItem> = draft[self.type]
                    blockData.children[blockData.children.length - 1].children = [
                        ...blockData.children[blockData.children.length - 1].children,
                        ...block[block.type].children
                    ]
                    draft.lastEditTime = new Date().getTime()
                })
                return { self }

            case 'list':
            case 'todo':
            case 'orderedList':
                self = produce(self, draft => {
                    let blockData: ABCListData<IndentItem> = draft[draft.type]
                    blockData.children = [
                        ...blockData.children,
                        ...block[block.type].children
                    ]
                    if (self.type === 'list') {
                        draft.list.children = blockData.children.map((item) => {
                            return {
                                'children': item.children,
                                'level': item.level
                            }
                        })
                    } else if (self.type === 'orderedList') {
                        draft.orderedList.children = blockData.children.map((item) => {
                            return {
                                'children': item.children,
                                'level': item.level,
                                'marker': item['marker']
                            }
                        })
                    } else if (self.type === 'todo') {
                        draft.todo.children = blockData.children.map((item) => {
                            return {
                                'children': item.children,
                                'level': item.level,
                                'progress': item['progress']
                            }
                        })
                    }

                    draft.lastEditTime = new Date().getTime()
                })
                return { self }
            default:
                return { notImplement: true }
        }
    }

    constructor(props: P) {
        super(props)
        this.state = {
            data: props.data,
            isEnter: false,
        } as S
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: any): void {
        super.componentDidUpdate(prevProps, prevState, snapshot)
        if (this.state.posHistory) {
            this.setTargetPosition(this.state.posHistory)
            this.boundhint.autoUpdate()
            this.setState({
                posHistory: null
            })
        }
    }

    blockData(): DefaultBlock {
        return this.state.data
    }

    currentContainer = (): I => {
        const sel = document.getSelection()
        const container = op.findParentMatchTagName(sel.focusNode, 'li', this.editableRoot()) as I
        return container
    };

    rowNumber = (): number => {
        const el = this.editableRoot()
        return el.querySelectorAll('li').length
    }

    getContainerByIndex(index: number): I {
        if (index < 0) {
            index = this.rowNumber() + index
        }
        const el = this.editableRoot()

        // const container = el.querySelector(`[data-index="${index}"]`) as I
        const container = el.querySelector(`li:nth-child(${index + 1})`) as I
        return container
    }

    firstContainer = (): I => {
        return op.firstValidChild(this.editableRoot()) as I
    };

    lastContainer = (): I => {
        return op.lastValidChild(this.editableRoot()) as I
    };

    previousContainer(el?: I): I {
        if (!el) {
            el = this.currentContainer()
        }
        return el.previousElementSibling as I
    }
    nextContainer(el?: I): I {
        if (!el) {
            el = this.currentContainer()
        }
        return el.nextElementSibling as I
    }

    nextRowContainer(el?: I): I {
        return this.nextContainer(el)
    }
    previousRowContainer(el?: I): I {
        return this.previousContainer(el)
    }

    currentContainerIndex(): number {
        const el = this.currentContainer()
        return parseFloat(el.getAttribute('data-index'))
    }

    isSelectedMultiContainer(): boolean {
        if (document.getSelection().isCollapsed) {
            return false
        }
        const range = document.getSelection().getRangeAt(0)
        const start = op.findParentMatchTagName(range.startContainer, 'li', this.editableRoot()) as I
        const end = op.findParentMatchTagName(range.endContainer, 'li', this.editableRoot()) as I
        return start !== end
    }

    selectedContainer(): I[] {
        if (!this.isSelectedMultiContainer()) {
            return [this.currentContainer()]
        }
        const range = document.getSelection().getRangeAt(0)
        const start = op.findParentMatchTagName(range.startContainer, 'li', this.editableRoot()) as I
        const end = op.findParentMatchTagName(range.endContainer, 'li', this.editableRoot()) as I
        const res = []
        let cur = start
        while (cur !== end) {
            res.push(cur)
            cur = this.nextRowContainer(cur)
        }
        res.push(cur)
        return res
    }
    changeIndent(offset) {
        const block: DefaultBlockData = this.blockData()
        const els = this.selectedContainer()

        let update = true
        const newBlock = produce(block, draft => {
            for (const el of els) {
                const ind = parseFloat(el.getAttribute('data-index'))
                const line = draft[draft.type].children[ind]
                const level = line.level + offset
                const newLevel = Math.max(Math.min(level, 8), 0)
                if (newLevel !== level) {
                    update = false
                    return
                }

                draft[draft.type].children[ind] = {
                    ...line,
                    level: newLevel
                }

                if (this.lastEditTime) {
                    draft[draft.type].children[ind].children = parseContent(op.validChildNodes(this.currentContainer()))
                }
            }

        })
        if (!update) {
            return false
        }

        const range = document.getSelection().getRangeAt(0)
        this.setState({
            data: newBlock,
            posHistory: {
                isRange: true,
                range: {
                    start: {
                        'index': parseFloat(els[0].getAttribute('data-index')),
                        'offset': op.getCaretReletivePosition(els[0], range.startContainer, range.startOffset),
                    },
                    end: {
                        'index': parseFloat(els[els.length - 1].getAttribute('data-index')),
                        'offset': op.getCaretReletivePosition(els[els.length - 1], range.endContainer, range.endOffset),
                    }
                }
            }
        })
        this.forceUpdate()
        return update
    }

    processMergeEvent(e: MergeEvent): boolean {
        e.block = this.serialize()

        const ind = this.currentContainerIndex()
        const old = this.blockData()

        if (ind === old[old.type].children.length - 1) {
            const relative: NextPosition = {
                'index': e.direction === 'left' ? -1 : this.currentContainerIndex(),
                'offset': (
                    e.direction === 'left' ?
                        -op.getContentSize(this.currentContainer()) - 1 :
                        op.getContentSize(this.currentContainer())
                ),
                'type': 'merge',
            }
            e.relative = relative
            this.props.onMerge(e)
            return
        }
        const data: ABCListData<IndentItem> = this.serializeContentData() as any

        const newBlock = produce(this.blockData(), draft => {
            draft[draft.type].children.splice(ind, 2, {
                ...data.children[ind],
                'children': [
                    ...data.children[ind].children,
                    ...data.children[ind + 1].children],
            })

        })
        this.setState({
            'data': newBlock,
            'posHistory': {
                'index': ind,
                'offset': op.getContentSize(this.currentContainer()),
                'type': 'merge'
            }
        })
        this.forceUpdate()
        return true
    }
    handleBackspace(e: React.KeyboardEvent<Element>): void {
        if (this.isSelectedMultiContainer()) {
            e.preventDefault()
            const res = this.selectedContainer()
            if (res.length > 3) {

            }

        }

        if (this.isCursorLeft()) {
            e.preventDefault()
            const hitLeft = !this.changeIndent(-1)
            if (hitLeft) {
                const data = this.serializeContentData() as any
                const ind = this.currentContainerIndex()
                const focus: DefaultBlockData = {
                    'order': '',
                    'type': 'paragraph',
                    paragraph: {
                        'children': data.children[ind].children
                    }
                }
                let left, right: DefaultBlockData;
                if (ind > 0) {

                    left = produce(this.blockData(), draft => {
                        draft.order = ''
                        draft.id = undefined
                        draft[draft.type] = produce(data, draft => {
                            draft.children.splice(ind, draft.children.length - ind)
                        })
                    })
                }
                if (ind < data.children.length - 1) {
                    right = produce(this.blockData(), draft => {
                        draft.order = ''
                        draft.id = undefined
                        draft[draft.type] = produce(data, draft => {
                            draft.children.splice(0, ind + 1)
                        })
                    })
                }

                this.props.onSplit({
                    'left': left,
                    'focus': focus,
                    'right': right,
                })
            }
        }
    }
    handleEnter(e: React.KeyboardEvent<Element>): void {
        e.preventDefault()

        if (e.shiftKey) {
            const cur = this.serialize()
            const newBlock: DefaultBlockData = {
                type: 'paragraph',
                order: '',
                lastEditTime: new Date().getTime(),
                paragraph: {
                    'children': []
                }
            }
            this.props.onSplit({
                'left': cur,
                'focus': newBlock
            })
            return
        }
        this.deleteSelecte()
        const leftFrag = op.cloneFragmentsBefore(this.currentContainer())
        const rightFrag = op.cloneFragmentsAfter(this.currentContainer())
        const ind = this.currentContainerIndex()
        // TODO 这里存在效率问题，需要优化更小的更新粒度
        const left = parseContent(op.validChildNodes(leftFrag))
        const right = parseContent(op.validChildNodes(rightFrag))
        const block = this.blockData()
        const innerData = produce(this.serializeContentData() as any, draft => {
            draft.children.splice(ind, 1,
                {
                    ...draft.children[ind],
                    'children': left,
                },
                {
                    ...draft.children[ind],
                    'children': right,
                })
        })


        const newBlock = produce(block, draft => {
            draft[draft.type] = innerData
        })
        this.setState({
            data: newBlock,
            posHistory: {
                'index': ind + 1,
                offset: 0,
                'type': 'keyboard',
            }
        })
        this.forceUpdate()

    }

    handleTab(e: React.KeyboardEvent<Element>): void {
        e.preventDefault()
        if (e.shiftKey) {
            this.changeIndent(-1)
        } else {
            this.changeIndent(1)
        }
    }
    renderBlock(block: DefaultBlockData): React.ReactNode {
        return this.renderContentItem(block.heading.children)
    }
}