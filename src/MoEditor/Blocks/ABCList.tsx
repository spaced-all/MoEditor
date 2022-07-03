import React from "react";
import { DefaultBlockData } from "../types";

import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";
import * as op from "../dom"
import { JumpEvent } from "./events";

export interface ABCListProps extends ABCBlockProps {

}

export interface ABCListStats extends ABCBlockStates {
}



export class ABCList<
    P extends ABCBlockProps,
    S extends ABCBlockStates,
    O extends HTMLElement, // outer block element type
    I extends HTMLElement // inner block element type
    > extends ABCBlock<P, S, O, I> {
    // static defaultProps = ABCBlock.defaultProps;
    // static blockName = 'heading';

    protected get contentEditableName(): string {
        return ``
    }

    currentContainer = (): I => {
        const sel = document.getSelection()
        const container = op.findParentMatchTagName(sel.focusNode, 'li', this.editableRoot()) as I
        return container
    };


    firstContainer = (): I => {
        return op.firstValidChild(this.editableRoot()) as I
        // return this.editableRootRef.current as unknown as I;
    };

    previousContainer(el: I) {
        return el.previousElementSibling
    }
    nextContainer(el: I) {
        return el.nextElementSibling
    }

    lastContainer = (): I => {
        return op.lastValidChild(this.editableRoot()) as I
        // return this.editableRootRef.current as unknown as I;
    };

    renderBlock(block: DefaultBlockData): React.ReactNode {
        return this.renderContentItem(block.heading.children)
    }
    handleJump(e: JumpEvent): void {
        const cur = this.currentContainer()

        if ((e.from === 'below' && !this.previousContainer(cur)) ||
            (e.from === 'above' && !this.nextContainer(cur))) {
            this.props.onActiveShouldChange(e)
            return
        }

        const neighbor = e.from === 'below' ? this.previousContainer(cur) : this.nextContainer(cur)
        if (e.type === 'jump') {
            let offset;
            if (e.from === 'below') {
                offset = op.getCaretReletivePosition(cur)
                op.setCaretReletivePosition(neighbor as HTMLElement, offset)
            } else {
                offset = op.getCaretReletivePositionAtLastLine(cur)
                op.setCaretReletivePositionAtLastLine(neighbor as HTMLElement, offset)
            }
        } else if (e.type === 'neighbor') {
            let pos
            if (e.from === 'above') {
                pos = op.firstValidPosition(neighbor as HTMLElement)
            } else {
                pos = op.lastValidPosition(neighbor as HTMLElement)
            }
            op.setPosition(pos)
        }
        this.boundhint.autoUpdate()
    }
}