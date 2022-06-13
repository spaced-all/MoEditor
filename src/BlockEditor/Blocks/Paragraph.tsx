import React from "react";
import { BlockProps, BlockStates } from "./Common"
import { NestRender } from "./render";
import { ContentEditable, ParagraphBlock, DefaultBlock } from "./Common"
import * as op from "../operation"
import * as BE from "../event/eventtype"



export interface ParagraphProps extends BlockProps {
    data: ParagraphBlock
}

export interface ParagraphStats extends BlockStates {
}



export class Paragraph extends DefaultBlock<ParagraphProps, ParagraphStats, HTMLParagraphElement, HTMLParagraphElement> {
    static defaultProps = DefaultBlock.defaultProps;

    handleBackspace = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
        const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLParagraphElement>>(e)
        if (op.isCursorLeft(this.ref.current)) {
            this.props.onMergeAbove(newE)
            e.preventDefault()
        }
    }
    handleSpace = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
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
                this.props.onChangeBlockType({
                    html: '',
                    ref: this.outerRoot(),
                    inner: this.currentInnerRoot(),
                    type: 'header',
                    level: key.length,
                })
                e.preventDefault()
                break
            case '>':
                this.props.onChangeBlockType({
                    html: '',
                    ref: this.outerRoot(),
                    inner: this.currentInnerRoot(),
                    type: 'blockquote',
                    level: key.length,
                })
                e.preventDefault()
                break
            case '-':
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
    handleDelete = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
        const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLParagraphElement>>(e)
        if (op.isCursorRight(this.ref.current)) {
            this.props.onMergeBelow(newE)
            e.preventDefault()
        }
    }

    render() {
        const data = this.latestData()
        const element = NestRender(data.data.dom)

        return <>
            <ContentEditable
                tagName='p'
                contentEditable={this.state.contentEditable}
                innerRef={this.ref}
                onInput={this.handleInput}
                onBlur={this.handleBlur}
                onFocus={this.handleFocus}
                onSelect={this.handleSelect}
                onKeyDown={this.defaultHandleKeyDown}
                onKeyUp={this.defaultHandleKeyup}
                onMouseMove={this.handleMouseMove}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                onCopy={this.handleCopy}
                onPaste={this.handlePaste}
            >
                {element}
            </ContentEditable>

        </>
    }
}