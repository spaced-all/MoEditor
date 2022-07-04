import React from "react";
import { ContentItem, DefaultBlock, DefaultBlockData, TableData, TableDataFrame } from "../types";
import produce from "immer";
import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";
import * as op from "../dom"
import * as dfd from "danfojs"
import { JumpEvent } from "./events";

import PositionEl from "../Components/PositionEl";


export interface TableProps extends ABCBlockProps {

}

export interface TableStats extends ABCBlockStates {
    df: dfd.DataFrame
    pos: { rid: number, cid: number }
}



export class Table extends ABCBlock<TableProps, TableStats, HTMLTableElement, HTMLTableCellElement> {

    serialize(): DefaultBlockData {
        return this.props.data
    }
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'table';

    protected get contentEditableName(): string {
        return 'tbody'
    }

    public get placeholder(): string {
        return "Type '/' for commands"
    }
    constructor(props: TableProps) {
        super(props)

        this.parseTableDataToArray = this.parseTableDataToArray.bind(this)
        this.parseTableDataToFrame = this.parseTableDataToFrame.bind(this)
        this.activeTableAt = this.activeTableAt.bind(this)
        this.activeContainer = this.activeContainer.bind(this)
        this.state = {
            df: this.parseTableDataToFrame(props.data.table),
            pos: { rid: 0, cid: 0 }
        }

        // let df = new dfd.DataFrame([[1, 2, 3, 4], [3, 4, 5, 6]])
        // df
        // console.log(dfd.toJSON(df, { format: 'row' }))
        // console.log(dfd)

        console.log(this.state.df)
    }


    componentDidUpdate(prevProps: Readonly<TableProps>, prevState: Readonly<TableStats>, snapshot?: any): void {
        if (prevState.pos !== this.state.pos) {
            this.activeTableAt(this.state.pos.rid, this.state.pos.cid)
        } else {
            super.componentDidUpdate(prevProps, prevState, snapshot)
        }
    }

    handleFocus(e: React.FocusEvent<Element, Element>): void {
        const jumpHistory = this.props.jumpHistory
        if (jumpHistory) {
            const df = this.state.df
            if (jumpHistory.type === 'jump') {
                if (jumpHistory.from === 'above') {
                    this.activeTableAt(0, 0)
                } else {
                    this.activeTableAt(df.index.length - 1, 0)
                }
            } else if (jumpHistory.type === 'neighbor') {
                if (jumpHistory.from === 'above') {
                    this.activeTableAt(0, 0)

                } else {
                    this.activeTableAt(df.index.length - 1, df.columns.length - 1)
                }
            }
            this.boundhint.autoUpdate({ root: this.currentContainer() })
            this.clearJumpHistory()
            return
        }
    }

    parseTableDataToFrame(data: TableData): dfd.DataFrame {
        let arr = this.parseTableDataToArray(data)
        let df = new dfd.DataFrame(arr)
        return df
    }
    parseTableDataToArray(data: TableData): TableDataFrame {
        let df: TableDataFrame = [];
        if (!data.children || data.children.length === 0) {
            for (let i = 0; i < 3; i++) {
                df.push(
                    [
                        [{ 'tagName': '#text', 'textContent': '' }],
                        [{ 'tagName': '#text', 'textContent': '' }],
                        [{ 'tagName': '#text', 'textContent': '' }],
                    ]
                )
            }
            return df
        }

        df = data.children.map((row, rid) => {
            const rowEl = row.children.map((col, cid) => {
                return col.children
            })
            return rowEl
        })
        return df
    }
    currentContainer(): HTMLTableCellElement {
        const sel = document.getSelection()
        const container = op.findParentMatchTagName(sel.focusNode, 'td', this.editableRoot()) as HTMLTableCellElement
        return container
    };
    firstContainer(): HTMLTableCellElement {
        // debugger
        const outer = this.editableRoot()
        return op.firstValidChild(op.firstValidChild(outer)) as HTMLTableCellElement
        // return this.editableRootRef.current as unknown as I;
    };
    lastContainer(): HTMLTableCellElement {
        return op.lastValidChild(op.lastValidChild(this.editableRoot())) as HTMLTableCellElement

    };
    previousContainer(el?: HTMLTableCellElement): HTMLTableCellElement {
        if (!el) {
            el = this.currentContainer()
        }
        let res = el.previousElementSibling
        if (!res && el.parentElement.previousElementSibling) {
            res = el.parentElement.previousElementSibling.lastChild as HTMLTableCellElement
        }
        return res as HTMLTableCellElement
    }
    nextContainer(el?: HTMLTableCellElement): HTMLTableCellElement {
        if (!el) {
            el = this.currentContainer()
        }
        let res = el.nextElementSibling
        if (!res && el.parentElement.nextElementSibling) {
            res = el.parentElement.nextElementSibling.firstChild as HTMLTableCellElement
        }
        return res as HTMLTableCellElement
    }

    previousRowContainer(el?: HTMLTableCellElement): HTMLTableCellElement {
        if (!el) {
            el = this.currentContainer()
        }
        const index = op.indexOfNode(el)
        if (el.parentElement.previousElementSibling) {
            return el.parentElement.previousElementSibling.childNodes[index] as HTMLTableCellElement
        }
    }
    nextRowContainer(el?: HTMLTableCellElement): HTMLTableCellElement {
        if (!el) {
            el = this.currentContainer()
        }
        const index = op.indexOfNode(el)
        if (el.parentElement.nextElementSibling) {
            return el.parentElement.nextElementSibling.childNodes[index] as HTMLTableCellElement
        }
    }

    activeTableAt(rid, cid) {
        const outer = this.editableRoot()
        this.activeContainer(outer.childNodes[rid].childNodes[cid], 'left')
        this.setState({
            pos: { rid, cid }
        })
    }

    handleTab(e: React.KeyboardEvent<Element>): void {
        e.preventDefault()
        let hasNeighbor = this.processJumpEvent({
            'from': e.shiftKey ? 'below' : 'above',
            'type': 'neighbor',
            'noPropagation': true
        })
        if (!hasNeighbor && !e.shiftKey) {
            const df = this.state.df
            const empty: ContentItem[] = [{ 'tagName': '#text', 'textContent': '' }]
            const row = []
            for (let i = 0; i < df.columns.length; i++) {
                row.push(empty)
            }
            const newDf = df.append([row], [df.index.length])

            this.setState({ df: newDf, pos: { rid: df.index.length, cid: 0 } })
            this.forceUpdate()
        }

    }
    handleMouseDown(e: React.MouseEvent<Element, MouseEvent>): void {
    }

    handleContextMenu(e: React.MouseEvent<Element, MouseEvent>): void {
        window['dfd'] = dfd
        e.preventDefault()
    }
    renderBlock(block: DefaultBlockData): React.ReactNode {
        const df = this.state.df
        return this.state.df.index.map((item, rid) => {
            const rowEl = this.state.df.columns.map((item, cid) => {
                return <td key={cid}>{this.renderContentItem(df.iat(rid, cid) as any)}</td>
            })
            return <tr key={rid}>{rowEl}</tr>
        })
    }
    makeContentEditable(contentEditable: React.ReactNode): React.ReactNode {
        return <table>
            {contentEditable}
        </table>
    }

}