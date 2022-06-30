import React from "react";
import { Block } from "../types"
import produce from "immer"
interface PageProps {
    ids?: number[]
    // block: 
    blocks?: Block[]
    requests?: any//CallableFunction<any, Promise<Block[]>>
    // update: 
    // updates: 
}

interface PageStates {

}

class Page extends React.Component<PageProps, PageStates> {
    constructor(props) {
        super(props)
        this.state = produce(props, draft => {
            return {
                ids: draft.ids,
                blocks: draft.blocks
            }
        })
    }

    componentDidMount(): void {
        // 如果提供了 ids，那么就按 ids 来调用 block
        if (this.props.ids) {
            // this.props.requests
        }
    }

    componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<PageStates>, snapshot?: any): void {

    }

    render(): React.ReactNode {
        return <article>

        </article>
    }

}

export default Page