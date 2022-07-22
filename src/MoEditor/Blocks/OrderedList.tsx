import React from "react";
import { DefaultBlockData, OrderedIndentItem, OrderedListData } from "../types";
import * as op from "../dom"
import { ABCList, ABCListProps, ABCListStats } from "./ABCList";
import { parseContent } from "./Common";

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

    serializeContentData(): OrderedListData {
        let cur = this.firstContainer()
        const items: OrderedIndentItem[] = []

        while (cur) {

            items.push({
                level: parseFloat(cur.getAttribute('data-level')),
                marker: parseFloat(cur.getAttribute('data-marker')),
                children: parseContent(op.validChildNodes(cur))
            })
            cur = this.nextRowContainer(cur)
        }

        return {
            children: items
        }
    }
    renderBlock(block: DefaultBlockData): React.ReactNode {
        return block.orderedList.children.map((item, ind) => {
            return <li
                style={{
                    listStyleType: 'decimal',
                    marginLeft: item.level * 40
                }}
                data-index={ind}
                data-level={item.level}
                key={ind}>{this.renderContentItem(item.children)}</li>
        })
    }

}