import React from "react";
import produce from "immer"
import { DefaultBlock, DefaultBlockData, ParagraphData } from "../types";
import { InlineMath } from "../Inline/InlineMath";
import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";
import * as op from "../dom"
import { MergeEvent, MergeResult } from "./events";
import { parseBaseContent, parseContent } from "./Common";


export interface ABCLineProps extends ABCBlockProps {
}

export interface ABCLineStats extends ABCBlockStates {
}

export abstract class ABCLine<
    P extends ABCLineProps,
    S extends ABCLineStats,
    O extends HTMLElement, // outer block element type
    I extends HTMLElement // inner block element type
    > extends ABCBlock<P, S, O, I>{





    static merge(self: DefaultBlock, block: DefaultBlock): MergeResult {
        switch (block.type) {
            case 'blockquote':
            case 'paragraph':
            case 'heading':
                self = produce(self, draft => {
                    draft[self.type].children = [
                        ...self[self.type].children,
                        ...block[block.type].children
                    ]
                    draft.lastEditTime = new Date().getTime()
                })
                return { self }

            case 'list':

                self = produce(self, draft => {
                    draft[self.type].children = [
                        ...self[self.type].children,
                        ...self.list.children[0].children
                    ]
                    draft.lastEditTime = new Date().getTime()
                })
                if (block.list.children.length === 1) {
                    return { self }

                } else {
                    block.list.children.splice(0, 1)
                    return { self, block }
                }
            case 'todo':
                self = produce(self, draft => {
                    draft[self.type].children = [
                        ...self[self.type].children,
                        ...self.todo.children[0].children
                    ]
                    draft.lastEditTime = new Date().getTime()
                })
                if (block.todo.children.length === 1) {
                    return { self }

                } else {
                    block.todo.children.splice(0, 1)
                    return { self, block }
                }
            case 'orderedList':
                self = produce(self, draft => {
                    draft[self.type].children = [
                        ...self[self.type].children,
                        ...self.orderedlist.children[0].children
                    ]
                    draft.lastEditTime = new Date().getTime()
                })
                if (block.orderedlist.children.length === 1) {
                    return { self }

                } else {
                    block.orderedlist.children.splice(0, 1)
                    return { self, block }
                }
            default:
                return { notImplement: true }
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
            e.offset = op.getContentSize(this.editableRoot())
        }
        this.props.onMerge(e)
        return true
    }


    handleEnter(e: React.KeyboardEvent<Element>): void {
        let cur: DefaultBlockData, newBlock: DefaultBlockData;
        if (e.shiftKey) {
            cur = this.serialize()
            newBlock = {
                type: 'paragraph',
                order: '',
                lastEditTime: new Date().getTime(),
                paragraph: {
                    'children': []
                }
            }
        } else {
            const frag = op.extractFragmentsAfter(this.editableRoot())
            const nodes = []
            frag.childNodes.forEach(item => nodes.push(item))
            this.serializeContentData()
            cur = this.serialize()
            newBlock = {
                type: 'paragraph',
                order: '',
                lastEditTime: new Date().getTime(),
                paragraph: {
                    'children': parseContent(nodes)
                }
            }
        }
        this.props.onSplit({
            'left': cur,
            'focus': newBlock
        })
        e.preventDefault()
    }

}