import React from "react";
import { ABCListData, DefaultBlock, DefaultBlockData, IndentItem, OrderedListData } from "../types";
import produce from "immer"
import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";
import * as op from "../dom"
import { MergeEvent, MergeResult } from "./events";
import { parseContent } from "./Common";

export interface ABCListProps extends ABCBlockProps {
}

export interface ABCListStats extends ABCBlockStates {
    data?: any
    isEnter?: boolean
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
        if (this.state.isEnter) {
            this.setState({
                isEnter: false
            })
            const next = this.nextRowContainer(this.currentContainer())
            let pos = op.firstValidPosition(next)
            pos = this.boundhint.safePosition(pos)
            op.setPosition(pos)
            this.boundhint.autoUpdate()
        }
    }

    /**
     * TODO first/last container cannot be merged in some situation, 
     * so index should be passed in block to avoid unnecessary serialization.
     * 
     * @param e 
     * @returns 
     */
    processMergeEvent(e: MergeEvent): boolean {
        e.block = this.serialize()
        if (e.direction === 'left') {
            e.offset = -op.getContentSize(this.editableRoot()) - 1
        } else {
            e.offset = op.getContentSize(this.editableRoot()) - 1
        }
        this.props.onMerge(e)
        return true
    }

    blockData(): DefaultBlock {
        return this.state.data
    }

    currentContainer = (): I => {
        const sel = document.getSelection()
        const container = op.findParentMatchTagName(sel.focusNode, 'li', this.editableRoot()) as I
        return container
    };

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
    changeIndent(offset) {
        const block: DefaultBlockData = this.blockData()
        const el = this.currentContainer()
        const ind = parseFloat(el.getAttribute('data-index'))
        let update = true
        const newBlock = produce(block, draft => {
            const line = draft[draft.type].children[ind]
            const level = line.level + offset
            const newLevel = Math.max(Math.min(level, 8), 1)
            if (newLevel !== level) {
                update = false
            }

            draft[draft.type].children[ind] = {
                ...line,
                level: newLevel
            }
            if (this.lastEditTime) {
                draft[draft.type].children[ind].children = parseContent(op.validChildNodes(this.currentContainer()))
            }
        })
        this.setState({
            data: newBlock
        })
        if (update) {
            this.forceUpdate()
        }
        return update
    }
    handleDelete(e: React.KeyboardEvent<Element>): void {
        if (this.isCursorRight()) {
            e.preventDefault()
            const data: ABCListData<IndentItem> = this.serializeContentData() as any
            const ind = this.currentContainerIndex()
            const newBlock = produce(this.blockData(), draft => {
                draft[draft.type].children.splice(ind, 2, {
                    ...data.children[ind].children,
                    'children': [
                        ...data.children[ind].children,
                        ...data.children[ind + 1].children],

                })

            })
            this.setState({
                'data': newBlock
            })
            this.forceUpdate()
        }
    }
    renderBlock(block: DefaultBlockData): React.ReactNode {
        return this.renderContentItem(block.heading.children)
    }
}