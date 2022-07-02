import React from "react";
import { Block } from "../types";

import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";

export interface HeadingProps extends ABCBlockProps {

}

export interface HeadingStats extends ABCBlockStates {
}



export class Heading extends ABCBlock<HeadingProps, HeadingStats, HTMLHeadingElement, HTMLHeadingElement> {
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'heading';

    protected get contentEditableName(): string {
        return `h${this.props.data.heading.level}`
    }

    public get placeholder(): string {
        return `Heading ${this.props.data.heading.level}`
    }

    renderBlock(block: Block): React.ReactNode {
        return this.renderContentItem(block.heading.children)
    }

}