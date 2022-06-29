import React from "react";
import { Block, BlockProps, BlockStates, ContentEditable } from "./Common"
import { DefaultBlock } from "./Common"
import produce from "immer"

import "./TaskList.css"
import { NestRender } from "./render";
import * as op from "../operation"
import * as BE from "../event/eventtype";
import { VList } from "./VituralList"
interface TaskListProps extends BlockProps {
}

interface TaskListStats extends BlockStates {
    checked: {}
}

export class TaskList extends VList<TaskListProps, TaskListStats, HTMLUListElement> {
    static defaultProps = DefaultBlock.defaultProps;
    protected get contentEditableName(): string {
        return 'ul'
    }
    protected get className(): string {
        return 'task-list'
    }
    constructor(props) {
        super(props)
        this.state = {
            ...this.state,
            checked: {}
        }
    }

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

    handleJumpToAbove(e: any): void {
        const innerRoot = op.findParentMatchTagName(this.currentContainer(), 'li', this.editableRoot()) as HTMLLIElement
        const index = parseFloat(innerRoot.getAttribute('data-index'))
        if (index === 0) {
            // e['html']
            e['ref'] = this.currentContainer()
            this.props.onJumpAbove(e)
            e.preventDefault()
        }
    }
    handleJumpToBelow(e: any): void {
        const innerRoot = op.findParentMatchTagName(this.currentContainer(), 'li', this.editableRoot()) as HTMLLIElement
        const index = parseFloat(innerRoot.getAttribute('data-index'))
        const maxIndex = parseFloat(innerRoot.getAttribute('data-max-index'))
        if (index === maxIndex - 1) {
            // e['html']
            e['ref'] = this.currentContainer()
            this.props.onJumpBelow(e)
            e.preventDefault()
        }
    }

    handleJumpToLeft(e) {
        const innerRoot = op.findParentMatchTagName(this.currentContainer(), 'li', this.editableRoot()) as HTMLLIElement
        const index = parseFloat(innerRoot.getAttribute('data-index'))
        if (index === 0) {
            const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLUListElement>>(e);
            this.props.onJumpToAboveEnd(newE);
        } else {
            const caretPos = op.lastCaretPosition(op.lastValidChild(op.previousValidNode(innerRoot)) as HTMLLIElement)
            op.setCaretPosition(caretPos);
        }
        e.preventDefault()
    }
    handleJumpToRight(e: any): void {
        const innerRoot = op.findParentMatchTagName(this.currentContainer(), 'li', this.editableRoot()) as HTMLLIElement
        const index = parseFloat(innerRoot.getAttribute('data-index'))
        if (index === this.props.data.data.dom.length - 1) {
            const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLUListElement>>(e);
            this.props.onJumpToBelowStart(newE);
        } else {
            const caretPos = op.firstCaretPosition(op.lastValidChild(op.nextValidNode(innerRoot)) as HTMLLIElement)
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

    firstContainer = () => {
        const root = this.editableRoot()
        return op.lastValidChild(op.firstValidChild(root)) as HTMLLIElement
    };
    lastContainer = () => {
        const root = this.editableRoot()
        return op.lastValidChild(op.lastValidChild(root)) as HTMLLIElement
    };

    currentContainer = () => {
        const sel = document.getSelection()
        const innerRoot = op.findParentMatchTagName(sel.focusNode, 'p', this.editableRoot()) as HTMLLIElement
        return innerRoot
    };
    handleInput(e: any): void {

    }
    renderBlock(block: Block): React.ReactNode {
        return <>
            {block.data.dom.map((item, ind, arr) => {
                return <>
                    <li
                        data-indent-level={Math.min(3, item.attributes.level)}
                        data-index={ind}
                        data-max-index={arr.length}
                        className={[
                            'list-editbound',
                            `list-indent-${Math.min(3, item.attributes.level)}`,
                        ].join(" ")} key={ind}>
                        {/* <label></label> */}
                        <input
                            className="list-task-flag" type={'checkbox'}
                        // checked={this.state.checked[ind] === true}
                        // onChange={(e) => {
                        //     const newChecked = produce(this.state.checked, draft => {
                        //         draft[ind] = e.target.checked
                        //     })
                        //     this.setState({ checked: newChecked })
                        // }}
                        ></input>
                        <p className="list-container">{item.textContent}{NestRender(item.children)}</p>
                    </li>
                </>
            })}
        </>
    }
}