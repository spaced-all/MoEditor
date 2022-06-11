import React from "react";
import { NestRender } from "./render";
import { BlockProps, BlockStates, ContentEditable } from "./common"
import { BlockquoteBlock, DefaultBlock, IBlock } from "./common"
import { RefObject } from "react";
import * as op from "../operation"

interface BlockquoteProps extends BlockProps {
    data: BlockquoteBlock
}


interface BlockquoteStats extends BlockStates {
}


export class Blockquote extends DefaultBlock<BlockquoteProps, BlockquoteStats, HTMLParagraphElement> {

    static defaultProps = DefaultBlock.defaultProps;
    constructor(props) {
        super(props);
    }
    handleBackspace = (e: React.KeyboardEvent<HTMLElement>) => {
        if (op.isCursorLeft(this.ref.current)) {
            this.props.onChangeBlockType({ html: op.validInnerHTML(this.ref.current), 'type': "paragraph", "ref": this.ref.current })
            e.preventDefault()
        }
    }

    render() {
        const { data } = this.props
        const element = NestRender(data.data.dom)

        return <blockquote>
            <ContentEditable
                tagName={`p`}
                contentEditable={this.state.contentEditable}
                innerRef={this.ref}
                onInput={this.handleInput}
                onBlur={this.handleBlur}
                onFocus={this.handleFocus}
                onSelect={this.handleSelect}
                onKeyDown={this.defaultHandleKeyDown}
                onKeyUp={this.defaultHandleKeyup}>
                {element}
            </ContentEditable>
        </blockquote>
    }
}