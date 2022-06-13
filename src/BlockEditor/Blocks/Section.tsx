import React from "react";
import { SectionBlock, BlockStates, BlockProps, DefaultBlock, ContentEditable } from "./Common"
import { NestRender } from "./render"
import * as op from "../operation"
import * as BE from "../event/eventtype"

interface SectionProps extends BlockProps {
    data: SectionBlock
}
interface SectionStats extends BlockStates {

}

export class Section extends DefaultBlock<SectionProps, SectionStats, HTMLHeadingElement, HTMLHeadingElement> {


    handleBackspace = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
        if (op.isCursorLeft(this.ref.current)) {
            this.props.onChangeBlockType({
                html: op.validInnerHTML(this.outerRoot()), 'type': "paragraph",
                ref: this.outerRoot(),
                inner: this.currentInnerRoot(),
            })
            e.preventDefault()
        }
    }
    handleDelete = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
        const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLHeadingElement>>(e)
        if (op.isCursorRight(this.ref.current)) {
            this.props.onMergeBelow(newE)
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
                if (key.length === this.props.data.level) {
                    this.props.onChangeBlockType({
                        html: '',
                        ref: this.outerRoot(),
                        type: 'paragraph',
                        level: key.length,
                        inner: this.currentInnerRoot(),
                    })
                } else {
                    this.props.onChangeBlockType({
                        html: '',
                        ref: this.outerRoot(),
                        inner: this.currentInnerRoot(),
                        type: 'header',
                        level: key.length,
                    })
                }

                e.preventDefault()
        }
    };
    render() {
        const data = this.latestData()
        const element = NestRender(data.data.dom)


        return <ContentEditable
            tagName={`h${data.level}`}
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
    }
}