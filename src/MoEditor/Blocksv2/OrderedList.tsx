import React from "react";
import { DefaultBlock, DefaultBlockData, IndentItem, OrderedIndentItem, OrderedListData } from "../types";
import * as op from "../utils"
import { ABCList, ABCListProps, ABCListStats } from "./ABCList";
import { ContentEditable, parseContent } from "./Common";

export interface OListProps extends ABCListProps {

}

export interface OListStats extends ABCListStats {
}



export class OList extends ABCList<OListProps, OListStats, HTMLOListElement, HTMLLIElement> {

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

    public get listStyleTypes(): string[] {
        return ['decimal', 'lower-alpha', 'lower-roman']
    }

    updateValue() {
        let containers = this.editableRoot().querySelectorAll('li')
        const lvstack = []

        containers.forEach((container, ind, arr) => {
            const level = parseFloat(container.getAttribute('data-level'))
            while (lvstack[level] === undefined) {
                lvstack.push(0)
            }
            while (level < lvstack.length - 1) {
                lvstack.pop()
            }
            lvstack[level]++

            this.updateLi(container, null, null, lvstack[level])
        })

    }
}