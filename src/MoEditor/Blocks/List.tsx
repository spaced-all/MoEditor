import React from "react";
import produce from "immer"
import { DefaultBlockData, IndentItem, UnorderedListData } from "../types";
import * as op from "../utils"
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


    public get listStyleTypes(): string[] {
        return ['disc', 'circle', 'square']
    }
    // renderInnerContainer(): React.ReactNode {
    //     const block = this.blockData()
    //     return block.list.children.map((item, ind) => {
    //         return <li
    //             style={{
    //                 listStyleType: ['disc', 'circle', 'square'][item.level % 3],
    //                 marginLeft: item.level * 40
    //             }}
    //             data-index={ind}
    //             data-level={item.level}
    //             key={ind}></li>
    //     })
    // }

}