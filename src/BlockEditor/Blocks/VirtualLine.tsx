import React from "react";
import { BlockStates, BlockProps, DefaultBlock, Block } from "./Common"
import { NestRender } from "./render"
import * as op from "../operation"
import * as BE from "../event/eventtype"

interface VLineProps extends BlockProps { }
interface VLineStats extends BlockStates {

}

export abstract class VLine<P extends BlockProps, S extends BlockStates, O extends HTMLElement> extends DefaultBlock<P, S, O, HTMLSpanElement> {
    containerRef: React.RefObject<HTMLSpanElement>
    prefixRef: React.RefObject<O>
    constructor(props) {
        super(props)
        this.prefixRef = React.createRef()
        this.containerRef = React.createRef()
    }
    handleDelete = (e: React.KeyboardEvent<O>) => {
        const newE = this.wrapBlockEvent<BE.KeyboardEvent<O>>(e)
        if (op.isCursorRight(this.ref.current)) {
            this.props.onMergeBelow(newE)
            e.preventDefault()
        }
    }

    handleMouseDown = (e) => {
        if (e.target === this.prefixRef.current) {
            op.setCaretPosition(op.firstCaretPosition(this.currentContainer()))
            e.preventDefault()
        }
    };
}