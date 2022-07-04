import React from "react";
import { DefaultBlock, DefaultBlockData, ParagraphData } from "../types";
import { InlineMath } from "../Inline/InlineMath";
import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";
import * as op from "../dom"
export interface ParagraphProps extends ABCBlockProps {

}

export interface ParagraphStats extends ABCBlockStates {
}



export class Paragraph extends ABCBlock<ParagraphProps, ParagraphStats, HTMLParagraphElement, HTMLParagraphElement> {
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'paragraph';

    public get placeholder(): string {
        return "Type '/' for commands"
    }

    serialize(): DefaultBlock {
        const arr = []
        this.editableRoot().childNodes.forEach(item => arr.push(item))
        return {
            ...this.props.data,
            'paragraph': {
                'children': Paragraph.serializeContentItem(arr)
            }
        }
    }
    serializeData(): ParagraphData {
        const arr = []
        this.editableRoot().childNodes.forEach(item => arr.push(item))
        return {
            'children': Paragraph.serializeContentItem(arr)
        }
    }

    handleSpace(e: React.KeyboardEvent<Element>): void {
        const key = op.textContentBefore(this.editableRoot()).trim()
        if (key.length > 5 || key.length === 0) {
            return
        }
        const block: DefaultBlockData = {
            ...this.props.data,
        }
        delete block['paragraph']
        let children: ParagraphData
        switch (key) {
            case '#':
            case '##':
            case '###':
            case '####':
            case '#####':
                op.deleteTextBefore(this.currentContainer())
                children = this.serializeData()
                block.type = 'heading'
                block.heading = {
                    'level': key.length,
                    'children': children.children
                }
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '>':
                op.deleteTextBefore(this.currentContainer())
                children = this.serializeData()
                block.type = 'blockquote'
                block.blockquote = {
                    'children': children.children
                }

                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '1.':
                op.deleteTextBefore(this.currentContainer())
                children = this.serializeData()
                block.type = 'orderedList'
                block.orderedlist = {
                    'children': [{
                        'level': 1,
                        'children': children.children
                    }]
                }
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '-':
                op.deleteTextBefore(this.currentContainer())
                children = this.serializeData()
                block.type = 'list'
                block.list = {
                    'children': [{
                        'level': 1,
                        'children': children.children
                    }]
                }
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '[]':
            case '[ ]':
                break
            case '$$':
                break
            case '!!': // for block img
                break
            default:
                if (key.match(/1-9\./g)) {

                } else if (key.match(/```[a-z0-9]*/g)) {

                }
        }
    }
    renderBlock(block: DefaultBlockData): React.ReactNode {
        return this.renderContentItem(block.paragraph.children)
    }

}