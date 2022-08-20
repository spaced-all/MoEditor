import React from "react";
import { ContentItem, DefaultBlock, DefaultBlockData, TableData, TableDataFrame, TableRowItem } from "../../types";
import produce from "immer";
import { ABCBlock, ABCBlockProps, ABCBlockStates } from "../ABCBlock";
import * as op from "../../utils"
import * as dfd from "danfojs"
import * as html from "../../html"

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


    // componentDidUpdate(prevProps: Readonly<TableProps>, prevState: Readonly<TableStats>, snapshot?: any): void {
    //     if (prevState.pos !== this.state.pos) {
    //         this.activeTableAt(this.state.pos.rid, this.state.pos.cid)
    //     } else {
    //         super.componentDidUpdate(prevProps, prevState, snapshot)
    //     }
    // }

    // handleFocus(e: React.FocusEvent<Element, Element>): void {
    //     const jumpHistory = this.props.jumpHistory
    //     if (jumpHistory) {
    //         const df = this.state.df
    //         if (jumpHistory.type === 'jump') {
    //             if (jumpHistory.from === 'above') {
    //                 this.activeTableAt(0, 0)
    //             } else {
    //                 this.activeTableAt(df.index.length - 1, 0)
    //             }
    //         } else if (jumpHistory.type === 'neighbor') {
    //             if (jumpHistory.from === 'above') {
    //                 this.activeTableAt(0, 0)

    //             } else {
    //                 this.activeTableAt(df.index.length - 1, df.columns.length - 1)
    //             }
    //         }
    //         this.richhint.autoUpdate({ root: this.currentContainer() })
    //         this.clearJumpHistory()
    //         return
    //     }
    // }



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
                        { 'children': [{ 'tagName': '#text', 'textContent': '', children: [] }] },
                        { 'children': [{ 'tagName': '#text', 'textContent': '', children: [] }] },
                        { 'children': [{ 'tagName': '#text', 'textContent': '', children: [] }] },
                    ]
                )
            }
            return df
        }

        df = data.children.map((row, rid) => {
            const rowEl = row.children.map((col, cid) => {
                return col
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

    getContainerByIndex(index: number | number[]): HTMLTableCellElement {
        const el = this.editableRoot()
        if (index === 0) {
            return el.querySelector(`td:nth-child(${1})`)
        }
        else if (index === -1) {
            return el.querySelector(`td:nth-child(${1})`)
        }
        return el.querySelector(`td:nth-child(${1})`)

    }

    handleTab(e: React.KeyboardEvent<Element>): void {
        e.preventDefault()

        let hasNeighbor = this.processJumpEvent({
            'index': this.currentContainerIndex() + (e.shiftKey ? -1 : 1),
            // 'native': e,
            'direction': e.shiftKey ? 'left' : 'right',
            // 'offset': e.shiftKey ? -1 : 0,
            'type': 'keyboard',
            'stopPropagation': true,
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
        } else {
            this.richhint.autoUpdate({ root: this.currentContainer() })
        }
    }


    handleMouseDown(e: React.MouseEvent<Element, MouseEvent>): void {
    }

    handleContextMenu(e: React.MouseEvent<Element, MouseEvent>): void {
        e.preventDefault()
    }

    lazyGetContainers(): HTMLElement | HTMLElement[] {
        const map = []
        this.editableRoot().querySelectorAll('td').forEach(c => map.push(c))
        return map
    }

    lazyRender(containers: HTMLElement[], prevProps: DefaultBlock, nextProps: DefaultBlock): void {
        if (prevProps && prevProps.lastEditTime === nextProps.lastEditTime) {
            return
        }

        const df = this.state.df
        containers.forEach(container => {
            const rid = parseFloat(container.getAttribute('data-row'))
            const cid = parseFloat(container.getAttribute('data-col'))
            const tdItem = (df.iat(rid, cid) as any as TableRowItem)
            html.putContentItem(container, tdItem.children)
        })

    }

    renderInnerContainer(): React.ReactNode {
        const df = this.state.df
        return df.index.map((item, rid) => {
            const rowEl = df.columns.map((item, cid) => {
                return <td key={cid} data-row={rid} data-col={cid}></td>
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