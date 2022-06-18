import React, { RefObject } from "react";
import { Block, JumpRef } from "./Blocks/Common"
import { EventManager, TEvent } from "./event/emitter";
import { Page } from "./Page";
import styles from "./Document.module.css"

interface PageProps {
    blocks?: Block[]
    onShiftEnter?: (e: React.KeyboardEvent) => void
    onEnter?: (e: React.KeyboardEvent) => void
    onBlur?: (e: React.FocusEvent) => void
    onChange?: (e: React.SyntheticEvent) => void
}
interface PageStats {

}


const emptyBlock = {
    order: ''
}


class Document extends React.Component<PageProps, PageStats> {
    // static defaultProps 
    portalCaller: EventManager
    focusBlockRef: RefObject<HTMLElement>
    ref: RefObject<HTMLElement>
    constructor(props) {
        super(props);
        this.portalCaller = new EventManager()
        this.state = {
            // blocks: (this.props.blocks || defaultPropsV2.blocks || []),
            cursor: 0,
            jumpRef: null,
            selectionMode: false,
            selection: {},
            focusBlockRef: null,
        }
        this.ref = React.createRef()
        this.focusBlockRef = React.createRef()
    }



    render() {
        const { } = this.state

        return <div className={styles.document}>
            <Page></Page>
            {/* <Page></Page> */}
        </div>
    }
}

export { Document }