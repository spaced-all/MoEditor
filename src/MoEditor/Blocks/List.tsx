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

    currentContainerIndex(): number {
        const el = this.currentContainer()
        return parseFloat(el.getAttribute('data-index'))
    }

    handleBackspace(e: React.KeyboardEvent<Element>): void {
        if (this.isCursorLeft()) {
            const block: DefaultBlockData = {
                ...this.blockData(),
            }
            const el = this.currentContainer()
            const ind = parseFloat(el.getAttribute('data-index'))
            const level = parseFloat(el.getAttribute('data-level'))

            const newBlock = produce(block, draft => {
                const line = draft[draft.type].children[ind]


                draft[draft.type].children[ind] = {
                    ...line,
                    level: line.level + 1
                }
                if (this.lastEditTime) {
                    draft[draft.type].children[ind].children = parseContent(op.validChildNodes(this.currentContainer()))
                }
            })
            this.setState({
                data: newBlock
            })
            this.forceUpdate()
            // delete block['blockquote']
            // op.deleteTextBefore(this.currentContainer())
            // let children = this.serializeContentData()
            // block.type = 'paragraph'
            // block.paragraph = {
            //     'children': children.children
            // }

            // this.props.onSplit({
            //     'focus': block
            // })
            e.preventDefault()
        }
    }
    renderBlock(block: DefaultBlockData): React.ReactNode {
        return block.list.children.map((item, ind) => {
            return <li
                style={{ marginLeft: (item.level - 1) * 40 }}
                data-index={ind}
                data-level={item.level}
                key={ind}>{this.renderContentItem(item.children)}</li>
        })
    }

}