import React from "react";
import { DefaultBlock, DefaultBlockData, BlockQuoteData } from "../types";
import { InlineMath } from "../Inline/InlineMath";
import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";
import * as op from "../dom"
export interface BlockquoteProps extends ABCBlockProps {

}

export interface BlockquoteStats extends ABCBlockStates {
}



export class Blockquote extends ABCBlock<BlockquoteProps, BlockquoteStats, HTMLQuoteElement, HTMLParagraphElement> {
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'blockquote';

    public get placeholder(): string {
        return ""
    }


    serialize(): DefaultBlock {
        const arr = []
        this.editableRoot().childNodes.forEach(item => arr.push(item))
        return {
            ...this.props.data,
            'blockquote': {
                'children': Blockquote.serializeContentItem(arr)
            }
        }
    }
    serializeData(): BlockQuoteData {
        const arr = []
        this.editableRoot().childNodes.forEach(item => arr.push(item))
        return {
            'children': Blockquote.serializeContentItem(arr)
        }
    }

    handleBackspace(e: React.KeyboardEvent<Element>): void {
        if (this.isCursorLeft()) {
            const block: DefaultBlockData = {
                ...this.props.data,
            }
            delete block['blockquote']
            op.deleteTextBefore(this.currentContainer())
            let children = this.serializeData()
            block.type = 'paragraph'
            block.paragraph = {
                'children': children.children
            }

            this.props.onSplit({
                'focus': block
            })
            e.preventDefault()
        }
    }

    handleSpace(e: React.KeyboardEvent<Element>): void {
    }
    renderBlock(block: DefaultBlockData): React.ReactNode {
        return this.renderContentItem(block.blockquote.children)
    }
    makeContentEditable(contentEditable: React.ReactNode): React.ReactNode {
        return <blockquote>{contentEditable}</blockquote>
    }

}