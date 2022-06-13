import React from "react";
import { NestRender } from "./render";
import { BlockProps, BlockStates, ContentEditable } from "./Common"
import { BlockquoteBlock, DefaultBlock, IBlock } from "./Common"
import { RefObject } from "react";
import * as op from "../operation"

interface BlockquoteProps extends BlockProps {
    data: BlockquoteBlock
}


interface BlockquoteStats extends BlockStates {
}


export class Blockquote extends DefaultBlock<BlockquoteProps, BlockquoteStats, HTMLQuoteElement, HTMLParagraphElement> {

    static defaultProps = DefaultBlock.defaultProps;
    pref: RefObject<HTMLParagraphElement>;

    constructor(props) {
        super(props)
        this.pref = React.createRef<HTMLParagraphElement>()
    }
    handleBackspace = (e: React.KeyboardEvent<HTMLElement>) => {
        if (op.isCursorLeft(this.currentInnerRoot())) {
            this.props.onChangeBlockType({
                html: op.validInnerHTML(this.outerRoot()), 'type': "paragraph", ref: this.outerRoot(),
                inner: this.currentInnerRoot(),
            })

            e.preventDefault()
        }
    }
    outerRoot = () => {
        return this.ref.current
    };
    currentInnerRoot = () => {
        return this.pref.current
    };
    firstInnerRoot = () => {
        return this.pref.current
    };
    lastInnerRoot = () => {
        return this.pref.current
    };

    render() {
        const data = this.latestData()
        const element = NestRender(data.data.dom)

        return <ContentEditable
            tagName={`blockquote`}
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
            <p ref={this.pref}>

                {element}
            </p>
        </ContentEditable>
    }
}