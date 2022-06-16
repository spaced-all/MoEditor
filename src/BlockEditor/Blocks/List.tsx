import React from "react";
import { Block, BlockProps, BlockStates, ContentEditable } from "./Common"
import { ListBlock, DefaultBlock } from "./Common"
import { RefObject } from "react";
import produce from "immer"
import { NestRender, Serialize } from "./render";
import * as op from "../operation"
import * as BE from "../event/eventtype";
import { classicNameResolver } from "typescript";

import { VList } from "./VituralList"

interface ListProps extends BlockProps {
    data: ListBlock
}

interface ListStats extends BlockStates {
}


export class List extends VList<ListProps, ListStats, HTMLUListElement> {
    static defaultProps = DefaultBlock.defaultProps;
    protected get contentEditableName(): string {
        return "ul"
    }
    protected get className(): string {
        return 'unordered-list'
    }
}