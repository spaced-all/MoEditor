import React from "react";
import { ABCListData, ContentItem, DefaultBlock, DefaultBlockData, IndentItem, OrderedListData, TargetPosition as NextPosition, TargetPosition } from "../types";
import produce from "immer"
import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";
import * as op from "../utils"
import { MergeEvent, MergeResult } from "./events";
import { parseContent } from "./Common";
import * as html from "../html"

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
                    blockData.children[blockData.children.length - 1].lastEditTime = op.getTime()
                    draft.lastEditTime = op.getTime()
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

                    draft.lastEditTime = op.getTime()
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
        return op.indexOfNode(el, 'li')
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
        const els = this.selectedContainer()

        for (const el of els) {
            let level = parseFloat(el.getAttribute('data-level')) + offset
            level = Math.max(Math.min(level, 8), 0)
            this.updateLi(el as any as HTMLLIElement, level)
        }
        this.updateValue()
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

        this.props.onDataUpdate({
            'block': newBlock
        })
        return true
    }
    handleBackspace(e: React.KeyboardEvent<Element>): void {
        if (this.isSelectedMultiContainer()) {
            e.preventDefault()
            const els = this.selectedContainer()
            const startEl = els[0]
            const level = parseFloat(startEl.getAttribute('data-level'))
            const index = parseFloat(startEl.getAttribute('data-index'))
            const newLi = this.createLi(level, index)
            els[0].parentElement.insertBefore(newLi, els[0])

            this.deleteSelecte()
            const remains: ContentItem[] = []
            const indexs: number[] = []
            let offset: number = 0
            els.forEach((el, ind) => {
                if (el.parentElement) {
                    if (ind === 0) {
                        offset = op.getContentSize(el)
                    }
                    remains.push(...parseContent(op.validChildNodes(el)))
                    el.remove()
                }
                indexs.push(parseFloat(el.getAttribute('data-index')))
            })

            const newBlock = produce(this.blockData(), draft => {
                const start = indexs[0]
                const startLevel = draft[draft.type].children[start].level

                indexs.sort().reverse().forEach(c => {
                    draft[draft.type].children.splice(c, 1)
                })

                draft[draft.type].children.splice(start, 0, {
                    'children': remains,
                    'level': startLevel,
                    'lastEditTime': op.getTime(),
                })
                draft.lastEditTime = op.getTime()
            })

            html.putContentItem(newLi, remains)

            this.setTargetPosition({
                'index': index,
                offset: offset,
                'type': 'keyboard',
            })

            this.props.onDataUpdate({
                // need diff or trigger to ignore unchanged block to call serialize()
                'block': newBlock
            })

            return
        }

        if (this.isCursorLeft()) {
            e.preventDefault()
            const el = this.currentContainer()
            const level = parseFloat(el.getAttribute('data-level'))
            if (level === 0) {
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
                        draft.lastEditTime = op.getTime()
                    })
                }
                if (ind < data.children.length - 1) {
                    right = produce(this.blockData(), draft => {
                        draft.order = ''
                        draft.id = undefined
                        draft[draft.type] = produce(data, draft => {
                            draft.children.splice(0, ind + 1)
                        })
                        draft.lastEditTime = op.getTime()
                    })
                }

                this.props.onSplit({
                    'left': left,
                    'focus': focus,
                    'right': right,
                })
            } else {
                this.changeIndent(-1)
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
        if (this.isSelectedMultiContainer()) {
            const els = this.selectedContainer()
            const startEl = els[0]
            const level = parseFloat(startEl.getAttribute('data-level'))
            const index = parseFloat(startEl.getAttribute('data-index'))
            const newLi = this.createLi(level, index)
            els[0].parentElement.insertBefore(newLi, els[0])

            this.deleteSelecte()
            const remains: ContentItem[] = []
            const indexs: number[] = []
            let offset: number = 0
            els.forEach((el, ind) => {
                if (el.parentElement) {
                    if (ind === 0) {
                        offset = op.getContentSize(el)
                    }
                    remains.push(...parseContent(op.validChildNodes(el)))
                    el.remove()
                }
                indexs.push(parseFloat(el.getAttribute('data-index')))
            })
            html.putContentItem(newLi, remains)

            this.setTargetPosition({
                'index': index,
                offset: offset,
                'type': 'keyboard',
            })

        } else {
            this.deleteSelecte()
        }
        const leftFrag = op.cloneFragmentsBefore(this.currentContainer())
        const rightFrag = op.cloneFragmentsAfter(this.currentContainer())
        const ind = this.currentContainerIndex()
        // TODO 这里存在效率问题，需要优化更小的更新粒度
        const left = parseContent(op.validChildNodes(leftFrag))
        const right = parseContent(op.validChildNodes(rightFrag))
        const block = this.blockData()
        const lastEditTime = this.createLatestTime()
        const innerData = produce(this.serializeContentData() as any as ABCListData<IndentItem>, draft => {
            draft.children.splice(ind, 1,
                {
                    ...draft.children[ind],
                    'children': left,
                    lastEditTime,
                },
                {
                    ...draft.children[ind],
                    'children': right,
                    lastEditTime,
                })
        })

        const newBlock = produce(block, draft => {
            draft[draft.type] = innerData
            draft.lastEditTime = lastEditTime
        })

        const newLi = this.createLi()
        const cur = this.currentContainer()
        cur.parentElement.insertBefore(newLi, cur.nextElementSibling)
        this.setTargetPosition({
            'index': ind + 1,
            offset: 0,
            'type': 'keyboard',
        })
        this.props.onDataUpdate({
            'block': newBlock
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

    createLi(level?, ind?) {
        const li = document.createElement('li')
        this.updateLi(li, level, ind)
        return li
    }
    updateValue() {

    }

    public get listStyleTypes(): string[] {
        return []
    }


    updateLi(li: HTMLLIElement, level?, ind?, value?) {
        if (Number.isInteger(ind)) {
            li.setAttribute('data-index', `${ind}`)
        }
        if (Number.isInteger(level)) {
            li.setAttribute('data-level', `${level}`)
            const types = this.listStyleTypes
            li.style.listStyleType = types[level % types.length]
            li.style.marginLeft = `${level * 40}px`
        }
        if (Number.isInteger(value)) {
            li.setAttribute('value', `${value}`)
        }
    }

    lazyRenderInnerContainer(root: HTMLElement, prevProps: DefaultBlock, nextProps: DefaultBlock): void {
        if (prevProps && prevProps.lastEditTime === nextProps.lastEditTime) {
            return
        }
        const children: IndentItem[] = nextProps[nextProps.type].children
        let containers = root.querySelectorAll('li')

        let sizeDelta = children.length - containers.length
        while (sizeDelta > 0) {
            const newLi = this.createLi(0, 0)
            root.appendChild(newLi)
            sizeDelta--
        }

        // containers.forEach((container, ind, arr) => {
        //     const nextItem: IndentItem = nextProps[nextProps.type].children[ind]
        //     this.updateLi(container, nextItem.level, ind, 1)
        // })

    }
    lazyRender(container: HTMLElement, prevProps: DefaultBlock, nextProps: DefaultBlock): void {
        console.log(prevProps)
        if (prevProps && prevProps.lastEditTime === nextProps.lastEditTime) {
            return
        }
        if (this.currentContainer()) {
            this.storePosition()
        }

        const containers = container.querySelectorAll('li')

        containers.forEach((container, ind, arr) => {
            const nextItem: IndentItem = nextProps[nextProps.type].children[ind]

            if (prevProps) {
                const prevItem: IndentItem = prevProps[prevProps.type].children[ind]
                if (prevItem && prevItem.lastEditTime === nextItem.lastEditTime) {
                    return
                }
            }
            // console.log(prevProps)

            this.updateLi(container, nextItem.level, ind)

            html.putContentItem(container, nextItem.children)

        })
        this.updateValue()
        if (this.currentContainer()) {
            this.releasePosition()
        }
    }

}