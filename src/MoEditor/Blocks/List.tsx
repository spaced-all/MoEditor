import React from "react";
import { DefaultBlock, DefaultBlockData } from "../types";

import { ABCList, ABCListProps, ABCListStats } from "./ABCList";

export interface ListProps extends ABCListProps {

}

export interface ListStats extends ABCListStats {
}



export class List extends ABCList<ListProps, ListStats, HTMLUListElement, HTMLLIElement> {

    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'list';

    protected get contentEditableName(): string {
        return 'ul'
    }
    serialize(): DefaultBlockData {
        return this.props.data
    }
    renderBlock(block: DefaultBlockData): React.ReactNode {
        return block.list.children.map((item, ind) => {
            return <li key={ind}>{this.renderContentItem(item.children)}</li>
        })
    }

}