import React from "react";
import produce from "immer"
import { DefaultBlock, DefaultBlockData, ParagraphData, TargetPosition } from "../types";
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
            case 'todo':
            case 'orderedList':
            case 'list':
                debugger
                const bType = block.type
                self = produce(self, draft => {
                    draft[draft.type].children = [
                        ...self[self.type].children,
                        ...block[bType].children[0].children
                    ]
                    draft.lastEditTime = new Date().getTime()
                })
                if (block[bType].children.length === 1) {
                    return { self }

                } else {
                    block = produce(block, draft => {
                        draft[bType].children.splice(0, 1)
                        draft.lastEditTime = new Date().getTime()
                    })
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
        const relative: TargetPosition = {
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

            this.deleteSelecte()
            const frag = op.extractFragmentsAfter(this.editableRoot())
            const nodes = []
            frag.childNodes.forEach(item => nodes.push(item))

            cur = this.serialize(true)
            if (cur.type === 'blockquote') {
                newBlock = produce(cur, draft => {
                    draft.order = ''
                    draft.lastEditTime = new Date().getTime()
                    draft.blockquote.children = parseContent(nodes)
                })
            } else {
                newBlock = {
                    type: 'paragraph',
                    order: '',
                    lastEditTime: new Date().getTime(),
                    paragraph: {
                        'children': parseContent(nodes)
                    }
                }
            }
        }
        this.props.onSplit({
            'left': cur,
            'focus': newBlock
        })
        e.preventDefault()
    }

    lazyRender(container: HTMLElement): void {
        const data = this.props.data

        container.innerHTML = ''
        const [nodes, noticable] = this.lazyCreateElement(data[data.type].children)
        if (nodes) {
            nodes.forEach(c => {
                container.appendChild(c)
            })
            noticable.forEach(c => c.componentDidMount())
        }
    }

}