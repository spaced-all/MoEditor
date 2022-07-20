import React from "react";
import { ABCListData, DefaultBlock, DefaultBlockData, IndentItem } from "../types";
import produce from "immer"
import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";
import * as op from "../dom"
import { MergeResult } from "./events";

export interface ABCListProps extends ABCBlockProps {
}

export interface ABCListStats extends ABCBlockStates {
    data?: any
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
                    let blockData: ABCListData<IndentItem> = draft[self.type]
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
                        draft.orderedlist.children = blockData.children.map((item) => {
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
            data: props.data
        } as S
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

    renderBlock(block: DefaultBlockData): React.ReactNode {
        return this.renderContentItem(block.heading.children)
    }
}