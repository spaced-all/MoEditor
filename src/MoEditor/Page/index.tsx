import React from "react";
import { Block, BlockId } from "../types"
import produce from "immer"
import { BlockUpdateEventHandler } from "../Blocks/events";

import { blockRegistor } from "../plugable"
import { ABCBlock } from "../Blocks/ABCBlock";
import { MonoRequestFn } from "../types/api";

interface PageProps {
    ids?: BlockId[]
    blocks?: Block[]
    lazy_ids?: () => MonoRequestFn<{ ids: BlockId[] }>
    lazy_blocks?: (ids: BlockId[]) => MonoRequestFn<{ blocks: Block[] }>
    onUpdate?: BlockUpdateEventHandler
}

interface PageStates {
    orderedBlock?: { [key: string]: Block }
    order?: string[]
}

export class Page extends React.Component<PageProps, PageStates> {
    constructor(props: PageProps) {
        super(props)

        const blocks = props.blocks || []

        let orderedBlock = {}
        blocks.forEach((item) => {
            orderedBlock[item.order] = item
        })
        let order = blocks.map(item => item.order).sort()
        this.state = {
            orderedBlock,
            order,
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

    render(): React.ReactNode {
        const { order, orderedBlock } = this.state

        return <article>
            {order.map((oid, ind) => {
                const block = orderedBlock[oid]
                var blockType;

                blockType = blockRegistor.Create(block.type)
                console.log([block.type, blockType])
                if (!blockType) {
                    return <></>
                }

                const blockEl = React.createElement(blockType as typeof ABCBlock, {
                    key: block.order,
                    uid: block.order,
                    data: block,
                })
                return blockEl
            })}
        </article>
    }

}