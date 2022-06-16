import React from "react";
import { BlockProps, BlockStates, ContentEditable } from "./Common"
import { DefaultBlock } from "./Common"

import { NestRender } from "./render";
import * as op from "../operation"
import * as BE from "../event/eventtype";
import { VList } from "./VituralList"

interface OrderedListProps extends BlockProps {
}

interface OrderedListStats extends BlockStates {
}


export class OrderedList extends VList<OrderedListProps, OrderedListStats, HTMLOListElement> {
    static defaultProps = DefaultBlock.defaultProps;
    protected get contentEditableName(): string {
        return "ol"
    }
    protected get className(): string {
        return 'ordered-list'
    }
}