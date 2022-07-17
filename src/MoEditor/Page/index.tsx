import React from "react";
import { DefaultBlockData, BlockId } from "../types"
import produce from "immer"
import { BlockUpdateEventHandler, DataUpdateEvent, JumpEvent, MergeEvent, SplitEvent } from "../Blocks/events";

import { blockRegistor } from "../plugable"
import { ABCBlock, ABCBlockType } from "../Blocks/ABCBlock";
import { MonoRequestFn } from "../types/api";
import "./page.css"
import { midString } from "../utils";
import { JumpRef } from "../../BlockEditor/Blocks/Common";

interface PageProps {
    ids?: BlockId[]
    blocks?: DefaultBlockData[]
    lazy_ids?: () => MonoRequestFn<{ ids: BlockId[] }>
    lazy_blocks?: (ids: BlockId[]) => MonoRequestFn<{ blocks: DefaultBlockData[] }>
    onUpdate?: BlockUpdateEventHandler
}

interface PageStates {
    orderedBlock?: { [key: string]: DefaultBlockData }
    order?: string[]
    focused: string
    jumpHistory?: JumpEvent
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
        let jumpHistory: JumpEvent;
        if (evt.direction === 'left') {
            neighbor = orderedBlock[order[ind - 1]]
            if (neighbor) {
                const blockType = blockRegistor.Create(neighbor.type)
                const { self, block, notImplement } = blockType.merge(neighbor, evt.block)

                if (!notImplement) {
                    newOrderedBlock = produce(orderedBlock, draft => {
                        if (self) {
                            draft[self.order] = self
                        }

                        if (block) {
                            draft[block.order] = block
                        } else {
                            delete draft[evt.block.order]
                        }
                    })
                    newFocused = neighbor.order
                    newOrder = produce(order, draft => {
                        return draft.filter(item => {
                            return item !== evt.block.order
                        })
                    })
                    jumpHistory = {
                        from: 'below',
                        offset: evt.offset,
                        type: 'jump',
                    }
                }
            }
        } else {
            neighbor = orderedBlock[order[ind + 1]]
            if (neighbor) {
                const blockType = blockRegistor.Create(evt.block.type)
                const { self, block, notImplement } = blockType.merge(evt.block, neighbor)

                if (!notImplement) {
                    newOrderedBlock = produce(orderedBlock, draft => {
                        if (self) {
                            draft[self.order] = self
                        }
                        if (block) {
                            draft[block.order] = block
                        } else {
                            delete draft[neighbor.order]
                        }
                    })
                    newFocused = evt.block.order
                    newOrder = produce(order, draft => {
                        return draft.filter(item => {
                            return item !== neighbor.order
                        })
                    })
                    jumpHistory = {
                        from: 'above',
                        offset: evt.offset,
                        type: 'jump',
                    }
                }
            }
        }
        console.log(newOrder)
        this.setState({
            orderedBlock: newOrderedBlock,
            focused: newFocused,
            order: newOrder,
            jumpHistory: jumpHistory,

        })
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
            draft.jumpHistory = {
                'from': 'above',
                'type': 'neighbor',
            }
        })
        this.setState(newState)

    }
    handleActiveShouldChange(e: JumpEvent, ind: number) {
        const newState = produce(this.state, draft => {
            if (e.type === 'mouse') {
                draft.jumpHistory = e
                draft.focused = draft.order[ind]
            } else if (e.from === 'below' && ind > 0) {
                draft.focused = draft.order[ind - 1]
                draft.jumpHistory = e
            } else if (e.from === 'above' && ind < draft.order.length - 1) {
                draft.focused = draft.order[ind + 1]
                draft.jumpHistory = e
            }
        })
        // console.log([this.state.focused, newState.focused])
        this.setState(newState)
    }
    render(): React.ReactNode {
        const { order, orderedBlock } = this.state

        return <article className="moe-page">
            {order.map((oid, ind) => {
                const block = orderedBlock[oid]
                if (!block) {
                    return <></>
                }
                var blockType: ABCBlockType<any>;

                blockType = blockRegistor.Create(block.type)
                // console.log([block.type, block])
                if (!blockType) {
                    return <></>
                }
                const active = this.state.focused === block.order
                const blockEl = React.createElement(blockType, {
                    key: block.order + block.lastEditTime,
                    uid: block.order,
                    data: block,
                    meta: {},
                    jumpHistory: active ? this.state.jumpHistory : undefined,
                    active: active,
                    // onBlur: e => this.handleBlur(e, ind),
                    onDataUpdate: e => this.handleDataUpdate(e, ind),
                    onSplit: e => this.handleSplit(e, ind),
                    onMerge: e => this.handleMerge(e, ind),
                    onActiveShouldChange: e => this.handleActiveShouldChange(e, ind),
                })
                return blockEl
            })}
        </article>
    }

}