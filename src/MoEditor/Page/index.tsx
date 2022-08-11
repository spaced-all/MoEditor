import React from "react";
import { DefaultBlockData, BlockId, TargetPosition } from "../types"
import produce from "immer"
import { BlockUpdateEventHandler, CheckpointEvent, DataUpdateEvent, JumpEvent, MergeEvent, SplitEvent } from "../Blocks/events";
// import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';

import { blockRegistor } from "../plugable"
import { ABCBlock, ABCBlockType } from "../Blocks/ABCBlock";
import { MonoRequestFn } from "../types/api";
import "./page.css"
import { midString } from "../utils/order";
import ContextMenu from "../Components/ContextMenu";

interface PageProps {
    ids?: BlockId[]
    blocks?: DefaultBlockData[]
    lazy_ids?: () => MonoRequestFn<{ ids: BlockId[] }>
    lazy_blocks?: (ids: BlockId[]) => MonoRequestFn<{ blocks: DefaultBlockData[] }>
    onUpdate?: BlockUpdateEventHandler
}

interface PageStates {
    order?: string[]
    orderedBlock?: { [key: string]: DefaultBlockData }

    focused: string
    posHistory?: TargetPosition

    mode: 'edit' | 'selection' | 'preview'
    selectedBlock: { [key: string]: string },
}

export class Page extends React.Component<PageProps, PageStates> {
    constructor(props: PageProps) {
        super(props)

        const blocks = props.blocks || [{ 'type': 'paragraph', 'order': 'a' }]

        let orderedBlock = {}
        blocks.forEach((item) => {
            orderedBlock[item.order] = item
        })
        let order = blocks.map(item => item.order).sort()
        this.state = {
            mode: 'edit',
            selectedBlock: {},
            orderedBlock,
            order,
            focused: order[0]
        }
    }

    componentDidMount(): void {
        // 如果提供了 ids，那么就按 ids 来调用 block
        const { ids, blocks, lazy_ids, lazy_blocks } = this.props
        if (blocks) {
            return
        } else if (ids && lazy_blocks) {
            lazy_blocks(ids).then((resp) => {
                let orderedBlock = {}
                resp.data.blocks.forEach((item) => {
                    orderedBlock[item.order] = item
                })
                let order = resp.data.blocks.map(item => item.order).sort()
                this.setState({ orderedBlock, order })
            })
        } else if (lazy_ids && lazy_blocks) {
            lazy_ids().then(({ data }) => {
                lazy_blocks(data.ids).then((resp) => {
                    let orderedBlock = {}
                    resp.data.blocks.forEach((item) => {
                        orderedBlock[item.order] = item
                    })
                    let order = resp.data.blocks.map(item => item.order).sort()
                    this.setState({ orderedBlock, order })
                })
            })
        }
    }

    componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<PageStates>, snapshot?: any): void {

    }

    handleBlur(evt: React.FocusEvent, ind: number) {

    }

    handleMerge(evt: MergeEvent, ind: number) {
        const { order, orderedBlock } = this.state
        let neighbor: DefaultBlockData
        let newOrderedBlock
        let newFocused;
        let newOrder;
        // let jumpHistory: JumpEvent;  

        const neighborIndex = evt.direction === 'left' ? ind - 1 : ind + 1
        neighbor = orderedBlock[order[neighborIndex]]
        const mergeOrder: DefaultBlockData[] = evt.direction === 'left' ? [neighbor, evt.block] : [evt.block, neighbor]

        if (neighbor) {
            const blockType = blockRegistor.createType(mergeOrder[0].type)
            const { self, block, notImplement } = blockType.merge(mergeOrder[0], mergeOrder[1])
            // debugger
            if (!notImplement) {
                newOrderedBlock = produce(orderedBlock, draft => {
                    if (self) {
                        draft[self.order] = self
                    }
                    if (block) {
                        draft[block.order] = block
                    } else {
                        // draft[mergeOrder[1].order] = undefined
                        delete draft[mergeOrder[1].order]
                    }
                    return draft
                })
                newFocused = self.order

                newOrder = produce(order, draft => {
                    if (!block) {
                        return draft.filter(item => {
                            return item !== mergeOrder[1].order
                        })
                    }
                })


            }
        }
        console.log(newOrder)
        this.setState({
            orderedBlock: newOrderedBlock,
            focused: newFocused,
            order: newOrder,
            posHistory: evt.relative,

        })
    }
    handleCheckpoint(e: CheckpointEvent, ind: number) {

    }

    handleDataUpdate(evt: DataUpdateEvent, ind: number) {
        const { order, orderedBlock } = this.state
        const newOrderedBlock = produce(orderedBlock, draft => {
            draft[order[ind]] = evt.block
        })
        this.setState({
            orderedBlock: newOrderedBlock
        })

    }
    handleSplit(evt: SplitEvent, ind: number) {
        const { order } = this.state
        let upOrder = order[ind - 1]
        let downOrder = order[ind]

        const newState = produce(this.state, draft => {
            var news = [evt.left, evt.focus, evt.right].filter((item) => (item !== undefined))
            var offset = evt.left ? 1 : 0

            news = news.map((prevItem, i) => {
                return produce(prevItem, item => {
                    item.order = midString(upOrder, downOrder)
                    console.log([upOrder, item.order, downOrder])
                    item.lastEditTime = new Date().getTime()
                    // item order should be 'new' or React will not render because we currently use order as the component 'key' property
                    upOrder = item.order
                    return item
                })
            })

            const pops = draft.order.splice(ind, 1, ...news.map(item => item.order))
            pops.forEach(item => {
                delete draft.orderedBlock[item]
            })
            news.forEach(item => draft.orderedBlock[item.order] = item)
            draft.focused = draft.order[ind + offset]
            // draft.posHistory = {
            //     'from': 'above',
            //     'type': 'neighbor',
            // }
            draft.posHistory = {
                'offset': 0,
                'type': 'merge',
                'index': 0
            }
        })
        this.setState(newState)

    }
    handleActiveShouldChange(e: JumpEvent, ind: number) {
        const { type, direction } = e.relative
        // debugger
        const newState = produce(this.state, draft => {
            if (type === 'mouse') {
                draft.focused = draft.order[ind]
            } else if (type === 'keyboard') {
                if ((direction === 'up' || direction === 'left') && ind > 0) {
                    draft.focused = draft.order[ind - 1]
                } else if ((direction === 'down' || direction === 'right') && ind < draft.order.length - 1) {
                    draft.focused = draft.order[ind + 1]
                }
            }
            draft.posHistory = e.relative
        })
        this.setState(newState)
    }
    handleContextMenu(e, ind) {
        console.log(e)
        const s = document.createElement('div')
        const root = createRoot(s, {
            'onRecoverableError': (err) => {
                console.log('finished ?')
            }
        })
        
        root.render(<p>hello world</p>)
    }
    render(): React.ReactNode {
        const { order, orderedBlock } = this.state

        return <article className="moe-page">
            <ContextMenu menuId="slash-menu" />

            {order.map((oid, ind) => {
                const block = orderedBlock[oid]
                if (!block) {
                    return <></>
                }
                var blockType: ABCBlockType<any>;

                blockType = blockRegistor.createType(block.type)
                // console.log([block.type, block])
                if (!blockType) {
                    return <></>
                }
                // debugger
                // if (this.state.posHistory) {
                //     debugger
                // }
                const active = this.state.focused === block.order
                const blockEl = React.createElement(blockType, {
                    key: block.order,
                    uid: block.order,
                    data: block,
                    meta: {
                        mode: this.state.mode,
                    },
                    // jumpHistory: active ? this.state.posHistory : undefined,
                    posHistory: active ? this.state.posHistory : undefined,
                    // posHistory: this.state.posHistory,
                    active: active,
                    // onBlur: e => this.handleBlur(e, ind),
                    onCheckpoint: e => this.handleCheckpoint(e, ind),
                    onDataUpdate: e => this.handleDataUpdate(e, ind),
                    onSplit: e => this.handleSplit(e, ind),
                    onMerge: e => this.handleMerge(e, ind),
                    onActiveShouldChange: e => this.handleActiveShouldChange(e, ind),
                    onContextMenu: e => this.handleContextMenu(e, ind),
                })
                return blockEl
            })}
        </article>
    }

}