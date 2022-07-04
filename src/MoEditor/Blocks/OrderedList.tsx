import React from "react";
import { DefaultBlock, DefaultBlockData } from "../types";

import { ABCList, ABCListProps, ABCListStats } from "./ABCList";

export interface OListProps extends ABCListProps {

}

export interface OListStats extends ABCListStats {
}



export class OList extends ABCList<OListProps, OListStats, HTMLOListElement, HTMLLIElement> {

    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'orderedList';

    protected get contentEditableName(): string {
        return 'ol'
    }

    serialize(): DefaultBlock {
        return this.props.data
    }

    renderBlock(block: DefaultBlockData): React.ReactNode {
        return block.orderedlist.children.map((item, ind) => {
            return <li key={ind}>{this.renderContentItem(item.children)}</li>
        })
    }

}