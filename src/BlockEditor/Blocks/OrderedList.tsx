import React from "react";
import { BlockProps, BlockStates, ContentEditable } from "./Common"
import { ListBlock, DefaultBlock } from "./Common"
import { List } from "./List"
import { RefObject } from "react";
import { NestRender } from "./render";
import * as op from "../operation"
import * as BE from "../event/eventtype";

interface OrderedListProps extends BlockProps {
}

interface OrderedListStats extends BlockStates {
}


export class OrderedList extends DefaultBlock<OrderedListProps, OrderedListStats, HTMLOListElement, HTMLLIElement> {
    static defaultProps = DefaultBlock.defaultProps;

    handleBackspace = (e: React.KeyboardEvent<HTMLLIElement>) => {
        const sel = document.getSelection()
        const inlineRoot = op.findParentMatchTagName(sel.focusNode, 'li', this.ref.current) as HTMLLIElement
        if (op.isCursorLeft(inlineRoot)) {
            const index = parseFloat(inlineRoot.getAttribute('data-index'))
            const curLevel = parseFloat(inlineRoot.getAttribute('data-indent-level'))
            if (curLevel > 1) {
                const nextLevel = curLevel - 1
                inlineRoot.classList.toggle(`list-indent-${curLevel}`)
                inlineRoot.classList.toggle(`list-indent-${nextLevel}`)
                inlineRoot.setAttribute('data-indent-level', `${nextLevel}`)
            } else {
                // this.props.onSplitAbove
            }

            e.preventDefault()
        }

    };
    currentInnerRoot = () => {
        const sel = document.getSelection()
        const innerRoot = op.findParentMatchTagName(sel.focusNode, 'li', this.outerRoot()) as HTMLLIElement
        return innerRoot
    };

    handleJumpToAbove(e: any): void {
        const innerRoot = this.currentInnerRoot()
        const index = parseFloat(innerRoot.getAttribute('data-index'))
        if (index === 0) {
            // e['html']
            e['ref'] = this.currentInnerRoot()
            this.props.onJumpAbove(e)
            e.preventDefault()
        }
    }
    handleJumpToBelow(e: any): void {
        const innerRoot = this.currentInnerRoot()
        const index = parseFloat(innerRoot.getAttribute('data-index'))
        const maxIndex = parseFloat(innerRoot.getAttribute('data-max-index'))
        if (index === maxIndex - 1) {
            // e['html']
            e['ref'] = this.currentInnerRoot()
            this.props.onJumpBelow(e)
            e.preventDefault()
        }
    }

    handleJumpToLeft(e) {
        const innerRoot = this.currentInnerRoot()
        const index = parseFloat(innerRoot.getAttribute('data-index'))
        if (index === 0) {
            const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLOListElement>>(e);
            this.props.onJumpToAboveEnd(newE);
        } else {
            const caretPos = op.lastCaretPosition(op.previousValidNode(innerRoot) as HTMLLIElement)
            op.setCaretPosition(caretPos);
        }
        e.preventDefault()
    }
    handleJumpToRight(e: any): void {
        const innerRoot = this.currentInnerRoot()
        const index = parseFloat(innerRoot.getAttribute('data-index'))
        if (index === this.props.data.data.dom.length - 1) {
            const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLOListElement>>(e);
            this.props.onJumpToBelowStart(newE);
        } else {
            const caretPos = op.firstCaretPosition(op.nextValidNode(innerRoot) as HTMLLIElement)
            op.setCaretPosition(caretPos);
        }
        e.preventDefault()
    }

    handleTab = (e: React.KeyboardEvent<HTMLLIElement>) => {
        const sel = document.getSelection()

        const inlineBlock = op.findParentMatchTagName(sel.focusNode, 'li', this.ref.current) as HTMLLIElement
        const curLevel = parseFloat(inlineBlock.getAttribute('data-indent-level'))
        var nextLevel;
        if (e.shiftKey) {
            nextLevel = Math.max(curLevel - 1, 1)
        } else {
            nextLevel = Math.min(curLevel + 1, 3)
        }
        // const keep = op.currentCaretPosition(inlineBlock)
        // op.setCaretPosition(keep)
        inlineBlock.classList.toggle(`list-indent-${curLevel}`)
        inlineBlock.classList.toggle(`list-indent-${nextLevel}`)
        inlineBlock.setAttribute('data-indent-level', `${nextLevel}`)
        e.preventDefault()
    };

    firstInnerRoot = () => {
        const root = this.outerRoot()
        return op.firstValidChild(root) as HTMLLIElement
    };
    lastInnerRoot = () => {
        const root = this.outerRoot()
        return op.lastValidChild(root) as HTMLLIElement
    };

    render() {
        const data = this.latestData()
        return <ContentEditable
            tagName={`ol`}
            contentEditable={this.state.contentEditable}
            innerRef={this.ref}
            onInput={this.handleInput}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            onSelect={this.handleSelect}
            onKeyDown={this.defaultHandleKeyDown}
            onKeyUp={this.defaultHandleKeyup}
            onMouseMove={this.handleMouseMove}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
            onCopy={this.handleCopy}
                onPaste={this.handlePaste}
        >
            {data.data.dom.map((item, ind, arr) => {
                return <li
                    data-indent-level={Math.min(3, item.attributes.level)}
                    data-index={ind}
                    data-max-index={arr.length}
                    className={[
                        'editbound',
                        `list-indent-${Math.min(3, item.attributes.level)}`,
                    ].join(" ")} key={ind}>{item.textContent}{NestRender(item.children)}</li>
            })}
        </ContentEditable>
    }
}