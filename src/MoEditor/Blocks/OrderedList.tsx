import React from "react";
import { DefaultBlockData, OrderedIndentItem, OrderedListData } from "../types";
import * as op from "../dom"
import { ABCList, ABCListProps, ABCListStats } from "./ABCList";
import { ContentEditable, parseContent } from "./Common";

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
    // renderContentEditable(blockData: any) {
    //     return <ContentEditable
    //         placeholder={this.placeholder}
    //         className="moe-block-editable"
    //         innerRef={this.editableRootRef}
    //         tagName={this.contentEditableName}
    //         contentEditable

    //         onInput={this.handleInput}
    //         onSelect={this.handleSelect}
    //         onCopy={this.handleCopy}
    //         onChange={this.handleDataChange}
    //         onPaste={this.handlePaste}
    //         onKeyDown={this.defaultHandleKeyDown}
    //         onKeyUp={this.defaultHandleKeyup}
    //         style={{
    //             // listStyleType: 'none'
    //         }}
    //     >
    //         {blockData}
    //     </ContentEditable>
    // }

    renderInnerContainer() {
        const lvstack = []
        const block = this.blockData()
        return block.orderedList.children.map((item, ind) => {
            // debugger
            while (lvstack[item.level] === undefined) {
                lvstack.push(0)
            }
            while (item.level < lvstack.length - 1) {
                lvstack.pop()
            }
            lvstack[item.level]++
            console.log([[...lvstack], ind, item.level, lvstack[item.level]])

            return <li
                style={{
                    listStyleType: ['decimal', 'lower-alpha', 'lower-roman'][item.level % 3],
                    marginLeft: item.level * 40
                }}
                value={lvstack[item.level]}
                data-index={ind}
                data-level={item.level}
                key={ind}></li>
        })
    }

}