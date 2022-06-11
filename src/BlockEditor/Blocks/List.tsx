import React from "react";
import { BlockProps, BlockStates, ContentEditable } from "./common"
import { ListBlock, DefaultBlock } from "./common"
import { RefObject } from "react";
import { NestRender } from "./render";
import * as op from "../operation"
import * as BE from "../event/eventtype";

interface ListProps extends BlockProps {
    data: ListBlock
}

interface ListStats extends BlockStates {
}


export class List extends DefaultBlock<ListProps, ListStats, HTMLUListElement> {
    static defaultProps = DefaultBlock.defaultProps;
    constructor(props) {
        super(props);
    }

    handleJumpToAboveEnd(e) {
        const sel = document.getSelection()
        const innerRoot = op.findParentMatchTagName(sel.focusNode, 'li', this.ref.current) as HTMLLIElement
        const index = parseFloat(innerRoot.getAttribute('data-index'))
        if (index == 0) {
            const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLUListElement>>(e);
            this.props.onJumpToAboveEnd(newE);
        } else {
            const caretPos = op.lastCaretPosition(op.previousValidNode(innerRoot) as HTMLLIElement)
            op.setCaretPosition(caretPos);
        }
        e.preventDefault()
    }
    handleJumpToBelowStart(e: any): void {
        const sel = document.getSelection()
        const innerRoot = op.findParentMatchTagName(sel.focusNode, 'li', this.ref.current) as HTMLLIElement
        const index = parseFloat(innerRoot.getAttribute('data-index'))
        if (index == this.props.data.data.dom.length - 1) {
            const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLUListElement>>(e);
            this.props.onJumpToBelowStart(newE);
        } else {
            const caretPos = op.firstCaretPosition(op.nextValidNode(innerRoot) as HTMLLIElement)
            op.setCaretPosition(caretPos);
        }
        e.preventDefault()
    }

    firstCaretPosition = () => {
        const sel = document.getSelection()
        const innerRoot = op.findParentMatchTagName(sel.focusNode, 'li', this.ref.current) as HTMLLIElement
        return op.firstCaretPosition(innerRoot)
    };
    lastCaretPosition = () => {
        const sel = document.getSelection()
        const innerRoot = op.findParentMatchTagName(sel.focusNode, 'li', this.ref.current) as HTMLLIElement
        return op.lastCaretPosition(innerRoot)
    };

    isCursorLeft = () => {
        const sel = document.getSelection()
        const innerRoot = op.findParentMatchTagName(sel.focusNode, 'li', this.ref.current)
        return op.isCursorLeft(innerRoot as HTMLElement, sel.focusNode, sel.focusOffset)
    };
    isCursorRight = () => {
        const sel = document.getSelection()
        const innerRoot = op.findParentMatchTagName(sel.focusNode, 'li', this.ref.current)
        return op.isCursorRight(innerRoot as HTMLElement, sel.focusNode, sel.focusOffset)
    };

    render() {
        const { data } = this.props
        return <ContentEditable
            tagName={`ul`}
            contentEditable={this.state.contentEditable}
            innerRef={this.ref}
            onInput={this.handleInput}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            onSelect={this.handleSelect}
            onKeyDown={this.defaultHandleKeyDown}
            onKeyUp={this.defaultHandleKeyup}>
            {data.data.dom.map((item, ind) => {
                return <li
                    data-indent-level={Math.min(3, item.attributes.level)}
                    data-index={ind}
                    className={[
                        'editbound',
                        `list-indent-${Math.min(3, item.attributes.level)}`,
                    ].join(" ")} key={ind}>{item.textContent}{NestRender(item.children)}</li>
            })}
        </ContentEditable>
    }
}