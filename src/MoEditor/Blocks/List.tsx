import React from "react";
import { Block } from "../types";

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

    renderBlock(block: Block): React.ReactNode {
        return block.list.children.map((item, ind) => {
            return <li key={ind}>{this.renderContentItem(item.children)}</li>
        })
    }

}