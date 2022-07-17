import React from "react";
import { DefaultBlock, DefaultBlockData, IndentItem, UnorderedListData } from "../types";
import * as op from "../dom"
import { ABCList, ABCListProps, ABCListStats } from "./ABCList";
import { MergeResult } from "./events";
import { parseContent } from "./Common";

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

    serializeContentData(): UnorderedListData {
        let cur = this.firstContainer()
        const items: IndentItem[] = []

        while (cur) {

            items.push({
                level: parseFloat(cur.getAttribute('data-level')),
                children: parseContent(op.validChildNodes(cur))
            })
            cur = this.nextRowContainer(cur)
        }

        return {
            children: items
        }
    }

    renderBlock(block: DefaultBlockData): React.ReactNode {
        return block.list.children.map((item, ind) => {
            return <li
            
                data-level={item.level}
                key={ind}>{this.renderContentItem(item.children)}</li>
        })
    }

}