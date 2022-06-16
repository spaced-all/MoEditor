import React from "react";
import { NestRender } from "./render";
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
        if (op.isCursorLeft(this.currentContainer())) {
            this.props.onChangeBlockType({
                html: op.validInnerHTML(this.editableRoot()), 'type': "paragraph", ref: this.editableRoot(),
                inner: this.currentContainer(),
            })

            e.preventDefault()
        }
    }
    // blockRoot = () => {
    //     return this.ref.current
    // };
    // currentContainer = () => {
    //     return this.pref.current
    // };
    // firstContainer = () => {
    //     return this.pref.current
    // };
    // lastContainer = () => {
    //     return this.pref.current
    // };

    // renderBlock(block: Block): React.ReactNode {
    //     const element = NestRender(block.data.dom)
    //     return <p ref={this.pref}>
    //         {element}
    //     </p>
    // }
    makeContentEditable(contentEditable: React.ReactNode): React.ReactNode {
        return <blockquote>
            {contentEditable}
        </blockquote>
    }
}
