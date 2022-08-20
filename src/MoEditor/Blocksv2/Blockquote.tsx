import React from "react";
import { DefaultBlockData, BlockQuoteData } from "../types";
import * as op from "../utils"
import { ABCLine, ABCLineProps, ABCLineStats } from "./ABCLine";
import { parseContent } from "./Common";
export interface BlockquoteProps extends ABCLineProps {

}

export interface BlockquoteStats extends ABCLineStats {
}



export class Blockquote extends ABCLine<BlockquoteProps, BlockquoteStats, HTMLQuoteElement, HTMLParagraphElement> {

    static blockName = 'blockquote';

    public get placeholder(): string {
        return ""
    }



    serializeContentData(): BlockQuoteData {
        return {
            children: parseContent(op.validChildNodes(this.editableRoot()))
        }
    }

    handleBackspace(e: React.KeyboardEvent<Element>): void {
        if (this.isCursorLeft()) {
            const block: DefaultBlockData = {
                ...this.props.data,
            }
            delete block['blockquote']
            op.deleteTextBefore(this.currentContainer())
            let children = this.serializeContentData()
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


    makeContentEditable(contentEditable: React.ReactNode): React.ReactNode {
        return <blockquote>{contentEditable}</blockquote>
    }

}