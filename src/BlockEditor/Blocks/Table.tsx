import React from "react";
import { Block, BlockProps, BlockStates, ContentEditable } from "./Common"
import { DefaultBlock } from "./Common"
import { NestRender } from "./render";
import * as op from "../operation"
import * as BE from "../event/eventtype";
import { BlockCaretEvent } from "../event/events";

interface TableProps extends BlockProps {
}

interface TableStats extends BlockStates {
}


export class Table extends DefaultBlock<TableProps, TableStats, HTMLTableElement, HTMLTableColElement> {
    static defaultProps = DefaultBlock.defaultProps;

    protected get multiContainer(): boolean {
        return true
    }
    protected get contentEditableName(): string {
        return 'table'
    }
    handleBackspace(e: React.KeyboardEvent<HTMLTableColElement>) {
        if (op.isCursorLeft(this.currentContainer())) {
            const innerRoot = this.currentContainer()
            const tbody = op.findParentMatchTagName(innerRoot, 'tbody', this.editableRoot()) as HTMLTableSectionElement
            if (tbody.classList.contains('selected')) {
            } else {
                tbody.classList.add('selected')
            }
            e.preventDefault()
        }
    };

    currentContainer = () => {
        const sel = document.getSelection()
        const innerRoot = op.findParentMatchTagName(sel.focusNode, 'td', this.editableRoot()) as HTMLTableColElement
        return innerRoot
    };
    handleKeyUp(e: React.KeyboardEvent<HTMLTableColElement>): void {
        if (e.key === 'Tab') {
            const caretPos = op.currentCaretPosition(this.currentContainer());
            const event = new BlockCaretEvent(
                this.state.html,
                this.currentContainer(),
                caretPos,
                'left'
            );
            this.props.onCaretMove(event);
            e.preventDefault()
        }
    }
    handleTab = (e: React.KeyboardEvent<HTMLTableColElement>) => {
        if (e.shiftKey) {
            const newRoot = this.previousTableDataCell()
            if (newRoot) {
                op.setCaretPosition(op.lastCaretPosition(newRoot))
            } else {
                const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLTableElement>>(e);
                this.props.onJumpToAboveEnd(newE);
            }
        } else {
            const newRoot = this.nextTableDataCell()
            if (newRoot) {
                op.setCaretPosition(op.firstCaretPosition(newRoot))
            } else {
                const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLTableElement>>(e);
                this.props.onJumpToBelowStart(newE);
            }
        }
        e.preventDefault()
    };
    handleShiftEnter(e: React.KeyboardEvent<HTMLTableColElement>) {

    };
    handleEnter(e: any): void {
        const innerRoot = this.currentContainer()
        const rid = parseFloat(innerRoot.getAttribute('data-row'))
        const cid = parseFloat(innerRoot.getAttribute('data-col'))
        const maxrow = parseFloat(innerRoot.getAttribute('data-max-row'))
        if (rid < maxrow - 1) {
            const newRoot = this.getTableDataCellByPosition(rid + 1, cid)
            op.setCaretPosition(op.firstCaretPosition(newRoot))
        } else {
            e['ref'] = this.currentContainer()
            this.props.onJumpBelow(e)
        }
        e.preventDefault()
    }
    private getTableDataCellByPosition(row: number, col: number): HTMLTableColElement {
        const outer = this.editableRoot()
        return outer.querySelector(`td[data-row="${row}"][data-col="${col}"]`) as HTMLTableColElement
    }
    private previousTableDataCell(): HTMLTableColElement {
        const innerRoot = this.currentContainer()
        const rid = parseFloat(innerRoot.getAttribute('data-row'))
        const cid = parseFloat(innerRoot.getAttribute('data-col'))
        if (cid > 0) {
            const newRoot = op.previousValidNode(innerRoot) as HTMLTableColElement
            return newRoot
        } else if (rid > 0) {
            const tbody = op.previousValidNode(op.findParentMatchTagName(innerRoot, 'tbody', this.editableRoot())) as HTMLTableSectionElement
            const newRoot = op.firstValidChild(op.lastValidChild(tbody)) as HTMLTableColElement
            return newRoot
        }
        return null
    }

    private nextTableDataCell(): HTMLTableColElement {
        const innerRoot = this.currentContainer()
        const rid = parseFloat(innerRoot.getAttribute('data-row'))
        const cid = parseFloat(innerRoot.getAttribute('data-col'))
        const maxrow = parseFloat(innerRoot.getAttribute('data-max-row'))
        const maxcol = parseFloat(innerRoot.getAttribute('data-max-col'))
        if (cid < maxcol - 1) {
            // find rid, cid + 1
            const newRoot = op.nextValidNode(innerRoot) as HTMLTableColElement
            return newRoot
        } else if (rid < maxrow - 1) {
            // find rid + 1, 0
            // const newRoot = op.nextValidNode(innerRoot) as HTMLTableColElement
            // op.setCaretPosition(op.firstCaretPosition(newRoot))
            const tbody = op.nextValidNode(op.findParentMatchTagName(innerRoot, 'tbody', this.editableRoot())) as HTMLTableSectionElement
            const newRoot = op.firstValidChild(op.firstValidChild(tbody)) as HTMLTableColElement
            // const newRoot = op.nextValidNode(innerRoot) as HTMLTableColElement
            return newRoot
        }
        return null
    }

    handleJumpToLeft(e) {
        const newRoot = this.previousTableDataCell()
        if (newRoot) {
            op.setCaretPosition(op.lastCaretPosition(newRoot))
        } else {
            const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLTableElement>>(e);
            this.props.onJumpToAboveEnd(newE);
        }
        e.preventDefault()
    }
    handleJumpToRight(e: any): void {
        const newRoot = this.nextTableDataCell()
        if (newRoot) {
            op.setCaretPosition(op.firstCaretPosition(newRoot))
        } else {
            const newE = this.wrapBlockEvent<BE.KeyboardEvent<HTMLTableElement>>(e);
            this.props.onJumpToBelowStart(newE);
        }
        e.preventDefault()
    }
    handleJumpToAbove(e: any): void {
        const innerRoot = this.currentContainer()
        const rid = parseFloat(innerRoot.getAttribute('data-row'))
        const cid = parseFloat(innerRoot.getAttribute('data-col'))
        // innerRoot.querySelector()
        if (rid > 0) {
            const newRoot = this.getTableDataCellByPosition(rid - 1, cid)
            op.setCaretPosition(op.firstCaretPosition(newRoot))
        } else {
            e['ref'] = this.currentContainer()
            this.props.onJumpAbove(e)
        }
        e.preventDefault()
    }
    handleJumpToBelow(e: any): void {
        const innerRoot = this.currentContainer()
        const rid = parseFloat(innerRoot.getAttribute('data-row'))
        const cid = parseFloat(innerRoot.getAttribute('data-col'))
        const maxrow = parseFloat(innerRoot.getAttribute('data-max-row'))
        if (rid < maxrow - 1) {
            const newRoot = this.getTableDataCellByPosition(rid + 1, cid)
            op.setCaretPosition(op.firstCaretPosition(newRoot))
        } else {
            e['ref'] = this.currentContainer()
            this.props.onJumpBelow(e)
        }
        e.preventDefault()
    }
    currentRoot = () => {
        const sel = document.getSelection()
        const innerRoot = op.findParentMatchTagName(sel.focusNode, 'td', this.ref.current) as HTMLTableColElement
        return innerRoot
    };

    firstContainer = () => {
        const root = this.editableRoot() // table -> tbody -> tr -> td
        return op.firstValidChild(op.firstValidChild(op.firstValidChild(root))) as HTMLTableColElement
    };
    lastContainer = () => {
        const root = this.editableRoot()
        return op.lastValidChild(op.lastValidChild(op.lastValidChild(root))) as HTMLTableColElement
    };
    
    renderBlock(block: Block): React.ReactNode {
        return <>
            {block.data.dom.map((item, ind, rows) => {
                return <tbody data-ignore="true">
                    <tr
                        key={ind}
                        className={[
                            'editbound'
                        ].join(" ")} >
                        {item.children.map((child, cid, cols) => {
                            return <td
                                key={cid}
                                data-row={ind}
                                data-col={cid}
                                data-max-row={rows.length}
                                data-max-col={cols.length}
                            >{child.textContent}{NestRender(child.children)}</td>
                        })}
                    </tr>
                </tbody>

            })}</>
    }
}