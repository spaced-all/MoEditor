import React from "react";
import KaTeX from "katex"
import 'katex/dist/katex.min.css';
import * as op from "../utils"
import { ContentItem } from "../types";

export interface DataAttribute {
    'data-type': string
    [key: string]: string
}

export interface ABCLabelProps {
    data: ContentItem

}
export interface ABCLabelStates {
    focused: boolean
    ref?: HTMLElement
}

export class ABCLabel<P extends ABCLabelProps, S extends ABCLabelStates> extends React.Component<P, S> {

    static inlineName = 'abc'

    dataRef: React.RefObject<HTMLDataElement>
    constructor(props) {
        super(props)
        this.state = {
            focused: false
        } as S
        this.handleFocus = this.handleFocus.bind(this)
        this.handleBlur = this.handleBlur.bind(this)
        this.dataRef = React.createRef()
    }
    componentDidMount(): void {
        // this.dataRef.current.removeEventListener()
        // this.dataRef.current['onhover'] = (e) => {
        //     console.log(['testhit', e])
        // }
    }
    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: any): void {
        // this.dataRef.current.removeEventListener()
        // this.dataRef.current['onhover'] = (e) => {
        //     console.log(['testhit', e])
        // }
    }
    handleFocus(e: React.FocusEvent) {
        console.log(['unhandled label focus', e])
        this.setState({
            focused: true,
            ref: e.relatedTarget as HTMLElement,
        })
        this.forceUpdate()
        e.stopPropagation()
    }
    handleBlur(e: React.FocusEvent) {
        this.setState({ focused: false })
        this.forceUpdate()
    }
    renderEdit(): React.ReactNode {
        return <input
            autoFocus
            onBlur={this.handleBlur}></input>
    }

    renderDisplay(): React.ReactNode {
        return <></>
    }

    dataAttribute(): DataAttribute {
        return { "data-type": 'abc' }
    }

    renderTrigger() {
        return <data
            ref={this.dataRef}
            tabIndex={-1}
            {...this.dataAttribute()}
            onFocus={this.handleFocus}
        ></data>
    }

    render(): React.ReactNode {
        return <>

            {this.state.focused ? this.renderEdit() : this.renderDisplay()}
        </>
    }
}