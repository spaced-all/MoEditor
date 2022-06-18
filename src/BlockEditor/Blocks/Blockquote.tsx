import React from "react";
import { NestRender, Serialize } from "./render";
import { Block, BlockProps, BlockStates, ContentEditable } from "./Common"
import { BlockquoteBlock, DefaultBlock } from "./Common"
import { RefObject } from "react";
import * as op from "../operation"

interface BlockquoteProps extends BlockProps {
    data: BlockquoteBlock
}


interface BlockquoteStats extends BlockStates {
}


export class Blockquote extends DefaultBlock<BlockquoteProps, BlockquoteStats, HTMLQuoteElement, HTMLParagraphElement> {
    static defaultProps = DefaultBlock.defaultProps;
    protected get contentEditableName(): string {
        return 'p'
    }
    pref: RefObject<HTMLParagraphElement>;

    constructor(props) {
        super(props)
        this.pref = React.createRef<HTMLParagraphElement>()
    }
    handleBackspace = (e: React.KeyboardEvent<HTMLElement>) => {
        if (op.isCursorLeft(this.editableRoot())) {
            const block = this.serialize()
            block.type = 'paragraph'
            this.props.onSplit({
                'focus': block
            })
            e.preventDefault()
        }
    }

    handleEnter(e: React.KeyboardEvent<HTMLParagraphElement>): void {
        this.props.eventManager.call('boundhint', { name: 'unexpand', data: {} })

        const contents = op.extractContentRight(this.editableRoot())
        const children = op.validChildNodes(this.editableRoot(), { 'br': false })
        if (children.length === 0) {
            this.props.onSplit({
                'focus': {
                    'type': 'paragraph',
                    'order': '',
                    'data': { dom: [] }
                },
            })
            e.preventDefault()
        } else {
            const block = this.serialize()
            const temp = document.createElement('div')
            temp.append(contents)
            this.props.onSplit({
                'left': block,
                'focus': {
                    'type': 'blockquote',
                    'order': '',
                    'data': { dom: Serialize(temp.innerHTML) }
                },
            })
            e.preventDefault()
        }
    }
    makeContentEditable(contentEditable: React.ReactNode): React.ReactNode {
        return <blockquote>
            {contentEditable}
        </blockquote>
    }
}
