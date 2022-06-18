import React from "react";
import { BlockStates, BlockProps, DefaultBlock, Block } from "./Common"
import { NestRender, Serialize } from "./render"
import * as op from "../operation"
import * as BE from "../event/eventtype"
import './Heading.css'
interface HeadingProps extends BlockProps { }
interface HeadingStats extends BlockStates {

}

export class Heading extends DefaultBlock<HeadingProps, HeadingStats, HTMLHeadingElement, HTMLSpanElement> {
    protected get contentEditableName(): string {
        return `h${this.props.data.level}`
    }

    static supportTag = ['h1', 'h2', 'h3', 'h4', 'h5']


    pref: React.RefObject<HTMLSpanElement>
    constructor(props) {
        super(props)
        this.pref = React.createRef()
    }
    public get placeholder(): string {
        return `Heading ${this.props.data.level}`
    }

    handleBackspace = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
        if (op.isCursorLeft(this.editableRoot())) {
            const block = this.serialize()
            block.type = 'paragraph'
            this.props.onSplit({
                'focus': block
            })
            e.preventDefault()
        }
    }

    handleDelete = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
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

    handleSpace = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
        const key = op.textContentBefore(this.ref.current).trim()
        if (key.length > 5) {
            return
        }
        switch (key) {
            case '#':
            case '##':
            case '###':
            case '####':
            case '#####':
                const block = this.serialize()
                if (key.length === this.props.data.level) {
                    block.type = 'paragraph'
                } else {
                    block.level = key.length
                }

                block.type = 'heading'
                block.level = key.length
                block.data.dom = Serialize(op.wrapIn(op.extractContentRight(this.editableRoot()), 'span').innerHTML)
                this.props.onSplit({
                    'focus': block
                })

                e.preventDefault()
        }
    };

    handleMouseDown = (e) => {
        if (e.target === this.pref.current) {
            op.setCaretPosition(op.firstCaretPosition(this.currentContainer()))
            e.preventDefault()
        }
    };
    handleFocus(e: any): void {
        super.handleFocus(e)
        this.pref.current.textContent = '#'.repeat(this.props.data.level) + ' '
        this.pref.current.style.paddingRight = '0.2em'
    }
    handleBlur(e: any): void {
        if (this.currentContainer().textContent.trim() === '') {
            this.pref.current.textContent = ' '
        } else {
            this.pref.current.textContent = ''
        }
        this.pref.current.style.paddingRight = '0em'
    }

    makeContentEditable(contentEditable: React.ReactNode): React.ReactNode {
        return <div
            style={{ display: 'flex' }}
            className="heading">
            {React.createElement(this.contentEditableName, {
                style: { flex: 0 },
                ref: this.pref,
                tabIndex: -1,
            }, '')}
            <div style={{ flex: 1 }}>
                {contentEditable}
            </div>
        </div>
    }

}