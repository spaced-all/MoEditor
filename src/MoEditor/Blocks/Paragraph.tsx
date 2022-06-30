import React from "react";
import { Block } from "../types";
// import { Block, BlockProps, BlockStates } from "./Common"
// import { ParagraphBlock, DefaultBlock } from "./Common"
// import * as op from "../operation"
// import * as BE from "../event/eventtype"
// import { Serialize } from "./render";
import { ABCBlock } from "./ABCBlock";
import { ABCBlockProps, ABCBlockStates } from "./ABCBlock";

export interface ParagraphProps extends ABCBlockProps {

}

export interface ParagraphStats extends ABCBlockStates {
}



export class Paragraph extends ABCBlock<ParagraphProps, ParagraphStats, HTMLParagraphElement, HTMLParagraphElement> {
    static defaultProps = ABCBlock.defaultProps;
    public get placeholder(): string {
        return "Type '/' for commands"
    }

    renderBlock(block: Block): React.ReactNode {
        return this.renderContentItem(block.paragraph.children)
    }

    handleBackspace = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
        if (op.isCursorLeft(this.editableRoot())) {
            const caretPos = op.lastCaretPosition(this.editableRoot())
            const offset = op.getCaretReletivePosition(this.editableRoot(), caretPos.container, caretPos.offset)
            this.props.onMerge({
                'block': this.serialize(),
                'direction': 'left',
                'offset': -offset
            })
            e.preventDefault()
        }
    }

    handleDelete(e: React.KeyboardEvent<HTMLParagraphElement>) {
        if (op.isCursorRight(this.editableRoot())) {
            const caretPos = op.lastCaretPosition(this.editableRoot())
            const offset = op.getCaretReletivePosition(this.editableRoot(), caretPos.container, caretPos.offset)
            this.props.onMerge({
                'block': this.serialize(),
                'direction': 'right',
                'offset': offset
            })
            e.preventDefault()
        }
    }

    handleSpace = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
        const key = op.textContentBefore(this.editableRoot()).trim()
        if (key.length > 5) {
            return
        }
        const block: Block = {
            ...this.props.data,
            'data': { dom: [] }
        }
        var children
        switch (key) {
            case '#':
            case '##':
            case '###':
            case '####':
            case '#####':
                children = Serialize(op.wrapIn(op.extractContentRight(this.editableRoot()), 'span').innerHTML)
                block.type = 'heading'
                block.level = key.length
                block.data.dom = children
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '>':
                children = Serialize(op.wrapIn(op.extractContentRight(this.editableRoot()), 'span').innerHTML)
                block.type = 'blockquote'
                block.data.dom = children
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '1.':
                children = Serialize(op.wrapIn(op.extractContentRight(this.editableRoot()), 'span').innerHTML)
                block.type = 'orderedList'
                block.data.dom = [
                    {
                        'tagName': 'li',
                        'children': children,
                        'attributes': {
                            level: 1
                        }
                    }
                ]
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '-':
                children = Serialize(op.wrapIn(op.extractContentRight(this.editableRoot()), 'span').innerHTML)
                block.type = 'list'
                block.data.dom = [
                    {
                        'tagName': 'li',
                        'children': children,
                        'attributes': {
                            level: 1
                        }
                    }
                ]
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
    };

}