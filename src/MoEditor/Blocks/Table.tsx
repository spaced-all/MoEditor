import React from "react";
import { Block } from "../types";

import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";

export interface TableProps extends ABCBlockProps {

}

export interface TableStats extends ABCBlockStates {
}



export class Table extends ABCBlock<TableProps, TableStats, HTMLTableElement, HTMLTableElement> {
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'table';

    protected get contentEditableName(): string {
        return 'table'
    }

    public get placeholder(): string {
        return "Type '/' for commands"
    }

    renderBlock(block: Block): React.ReactNode {
        return <tbody>
            {
                block.table.children.map((row, rid) => {
                    const rowEl = row.children.map((col, cid) => {
                        return <td key={cid}>{this.renderContentItem(col.children)}</td>
                    })
                    return <tr key={rid}>{rowEl}</tr>
                })
            }
        </tbody>
    }

}