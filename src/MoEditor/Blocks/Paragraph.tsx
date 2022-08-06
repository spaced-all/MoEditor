import React from "react";
import { ContentItem, DefaultBlockData, ParagraphData } from "../types";
import * as op from "../dom"
import { MergeResult } from "./events";
import { ABCLine, ABCLineProps, ABCLineStats } from "./ABCLine";
import { parseContent } from "./Common";
export interface ParagraphProps extends ABCLineProps {

}

export interface ParagraphStats extends ABCLineStats {
}



export class Paragraph extends ABCLine<ParagraphProps, ParagraphStats, HTMLParagraphElement, HTMLParagraphElement> {
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'paragraph';

    public get placeholder(): string {
        return "Type '/' for commands"
    }

    serializeContentData(): ParagraphData {
        return {
            children: parseContent(op.validChildNodes(this.editableRoot()))
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
        let data: ParagraphData
        switch (key) {
            case '#':
            case '##':
            case '###':
            case '####':
            case '#####':
                op.deleteTextBefore(this.currentContainer())
                data = this.serializeContentData()
                block.type = 'heading'
                block.heading = {
                    'level': key.length,
                    'children': data.children
                }
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '>':
            case '》':
                op.deleteTextBefore(this.currentContainer())
                data = this.serializeContentData()
                block.type = 'blockquote'
                block.blockquote = {
                    'children': data.children
                }

                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '1.':
                op.deleteTextBefore(this.currentContainer())
                data = this.serializeContentData()
                block.type = 'orderedList'
                block.orderedList = {
                    'children': [{
                        'level': 0,
                        'children': data.children
                    }]
                }
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '-':
                op.deleteTextBefore(this.currentContainer())
                data = this.serializeContentData()
                block.type = 'list'
                block.list = {
                    'children': [{
                        'level': 0,
                        'children': data.children
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
    // renderBlock(block: DefaultBlockData): React.ReactNode {
    //     return this.renderContentItem(block.paragraph.children)
    // }

}