import React from "react";
import { DefaultBlock, DefaultBlockData } from "../types";

import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";

export interface CodeProps extends ABCBlockProps {

}

export interface CodeStats extends ABCBlockStates {
}



export class Code extends ABCBlock<CodeProps, CodeStats, HTMLElement, HTMLPreElement> {
    serialize(): DefaultBlockData {
        return this.props.data
    }
    protected get disableBoundHint(): boolean {
        return true
    }
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