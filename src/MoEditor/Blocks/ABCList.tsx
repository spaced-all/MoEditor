import React from "react";
import { DefaultBlockData } from "../types";

import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";

export interface ABCListProps extends ABCBlockProps {

}

export interface ABCListStats extends ABCBlockStates {
}



export class ABCList<
    P extends ABCBlockProps,
    S extends ABCBlockStates,
    O extends HTMLElement, // outer block element type
    I extends HTMLElement // inner block element type
    > extends ABCBlock<P, S, O, I> {
    // static defaultProps = ABCBlock.defaultProps;
    // static blockName = 'heading';

    protected get contentEditableName(): string {
        return ``
    }

    renderBlock(block: DefaultBlockData): React.ReactNode {
        return this.renderContentItem(block.heading.children)
    }

}