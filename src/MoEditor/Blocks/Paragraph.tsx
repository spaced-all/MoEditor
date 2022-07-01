import React from "react";
import { Block } from "../types";

import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";

export interface ParagraphProps extends ABCBlockProps {

}

export interface ParagraphStats extends ABCBlockStates {
}



export class Paragraph extends ABCBlock<ParagraphProps, ParagraphStats, HTMLParagraphElement, HTMLParagraphElement> {
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'paragraph';

    public get placeholder(): string {
        return "Type '/' for commands"
    }

    renderBlock(block: Block): React.ReactNode {
        return this.renderContentItem(block.paragraph.children)
    }

}