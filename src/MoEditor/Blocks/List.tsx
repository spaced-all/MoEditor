import React from "react";
import produce from "immer"
import { DefaultBlockData, IndentItem, UnorderedListData } from "../types";
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





    handleBackspace(e: React.KeyboardEvent<Element>): void {
        if (this.isCursorLeft()) {
            e.preventDefault()
            const hitLeft = !this.changeIndent(-1)
            console.log(['hitLeft', hitLeft])
            if (hitLeft) {
                const data = this.serializeContentData()
                const ind = this.currentContainerIndex()
                const focus: DefaultBlockData = {
                    'order': '',
                    'type': 'paragraph',
                    paragraph: {
                        'children': data.children[ind].children
                    }
                }
                let left, right: DefaultBlockData;
                if (ind > 0) {
                    left = {
                        'order': '',
                        'type': 'list',
                        list: produce(data, draft => {
                            draft.children.splice(ind, draft.children.length - ind)
                        })
                    }
                }
                if (ind < data.children.length - 1) {
                    right = {
                        'order': '',
                        'type': 'list',
                        list: produce(data, draft => {
                            draft.children.splice(0, ind + 1)
                        })
                    }
                }

                this.props.onSplit({
                    'left': left,
                    'focus': focus,
                    'right': right,
                })
            }
        }
    }
    renderBlock(block: DefaultBlockData): React.ReactNode {
        return block.list.children.map((item, ind) => {
            return <li
                style={{
                    listStyleType: ['circle', 'disc', 'square'][item.level % 3],
                    marginLeft: (item.level - 1) * 40
                }}
                data-index={ind}
                data-level={item.level}
                key={ind}>{this.renderContentItem(item.children)}</li>
        })
    }

}