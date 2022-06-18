import React from "react";
import { BlockProps, BlockStates } from "./Common"
import { ParagraphBlock, DefaultBlock } from "./Common"
import * as op from "../operation"
import * as BE from "../event/eventtype"
import { Serialize } from "./render";



export interface ParagraphProps extends BlockProps {
    data: ParagraphBlock
}

export interface ParagraphStats extends BlockStates {
}



export class Paragraph extends DefaultBlock<ParagraphProps, ParagraphStats, HTMLParagraphElement, HTMLParagraphElement> {
    static defaultProps = DefaultBlock.defaultProps;
    public get placeholder(): string {
        return "Type '/' for commands"
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
        const block = this.serialize()
        switch (key) {
            case '#':
            case '##':
            case '###':
            case '####':
            case '#####':
                block.type = 'heading'
                block.level = key.length
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '>':
                block.type = 'blockquote'
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
            case '-':
                block.type = 'blockquote'
                block.data.dom = [
                    {
                        'tagName': 'li',
                        'children': block.data.dom,
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