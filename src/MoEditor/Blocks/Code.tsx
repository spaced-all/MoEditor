import React from "react";
import { DefaultBlockData } from "../types";

import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";

export interface ParagraphProps extends ABCBlockProps {

}

export interface ParagraphStats extends ABCBlockStates {
}



export class Paragraph extends ABCBlock<ParagraphProps, ParagraphStats, HTMLParagraphElement, HTMLParagraphElement> {
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'code';

    protected get contentEditableName(): string {
        return 'code'
    }

    renderBlock(block: DefaultBlockData): React.ReactNode {
        return block.code.code.map((item, ind) => {
            return <>{item}<br /></>
        })
    }
    makeContentEditable(contentEditable: React.ReactNode): React.ReactNode {
        return <pre>{contentEditable}</pre>
    }
}   