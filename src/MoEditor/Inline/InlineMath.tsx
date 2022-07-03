import React from "react";
import KaTeX from "katex"
import 'katex/dist/katex.min.css';
import { ABCInline, ABCInlineProps, ABCInlineStates, DataAttribute } from "./ABCInline"
import Position from "../Components/Position";
import * as op from "../dom"
import styles from "./Inline.module.css"
interface InlineMathProps extends ABCInlineProps {
    // math: string;
}
interface InlineMathStates extends ABCInlineStates {
    html: string;
    math: string;
    error: Error;
    offset?: number
}

export class InlineMath extends ABCInline<InlineMathProps, InlineMathStates> {
    iptref: React.RefObject<HTMLInputElement>
    lbref: React.RefObject<HTMLLabelElement>
    constructor(props: InlineMathProps) {
        super(props)
        this.state = {
            focused: false,
            math: props.data.textContent,
            html: null,
            error: null
        }
        this.lbref = React.createRef()
        this.iptref = React.createRef()
    }
    shouldComponentUpdate(nextProps: Readonly<InlineMathProps>, nextState: Readonly<InlineMathStates>, nextContext: any): boolean {
        return nextState.math !== this.state.math || nextState.html !== this.state.html
    }
    componentDidMount(): void {
        this.setState(this.generateHTML())
    }
    componentDidUpdate(prevProps: Readonly<InlineMathProps>, prevState: Readonly<InlineMathStates>, snapshot?: any): void {
        this.setState(this.generateHTML())
    }

    generateHTML() {
        const { errorColor, renderError } = {} as any;
        let html, error;
        try {

            html = KaTeX.renderToString(this.state.math, {
                displayMode: false,
                errorColor,
                throwOnError: !!renderError,
            });
        } catch (e) {
            if (error instanceof KaTeX.ParseError || error instanceof TypeError) {
                error = e
            }
            throw e
        }
        return { html, error }
    }

    renderEdit(): React.ReactNode {
        return <>
            <span style={{ backgroundColor: 'white' }}>
                {'$'}
                <input
                    type={'text'}
                    className={[
                        styles['input'],
                        styles['input-math'],
                    ].join(' ')}
                    ref={this.iptref}
                    autoFocus
                    value={this.state.math}
                    onFocus={e => {
                        const tgt = e.target as HTMLInputElement
                        if (this.state.offset) {
                            tgt.setSelectionRange(this.state.offset, this.state.offset)
                        }
                        tgt.style.width = `${(tgt.value.length + 1) / 2}em`
                    }}
                    onChange={(e) => {
                        this.setState({ math: e.target.value })
                        const tgt = e.target as HTMLInputElement
                        tgt.style.width = `${(tgt.value.length + 1) / 2}em`
                        this.forceUpdate()
                    }}
                    onKeyDown={(e) => {
                        switch (e.key) {
                            case 'Enter':
                            case 'Escape':
                                this.setState({
                                    focused: false,
                                    offset: null
                                })
                                this.forceUpdate()
                                return
                        }
                        e.stopPropagation()
                    }}
                    onKeyUp={(e) => {
                        e.stopPropagation()
                    }}
                    onMouseDown={e => {
                        e.stopPropagation()
                    }}
                    onMouseUp={e => e.stopPropagation()}
                    onBlur={(e) => {
                        this.setState({ focused: false, offset: 0 })
                        this.forceUpdate()
                    }}
                >
                </input>
                {"$"}
            </span>
            <Position
                style={{
                    backgroundColor: 'white'
                }}
                block={false} related={this.iptref} >
                {this.renderDisplay()}
            </Position>
        </>
    }

    dataAttribute(): DataAttribute {
        return {
            "data-type": 'math',
            "data-key": "value",
            'data-value': this.state.math
        }
    }
    renderDisplay() {
        return <span dangerouslySetInnerHTML={{ __html: this.state.html }} />
    }

    render(): React.ReactNode {
        return <label
            ref={this.lbref}
            tabIndex={-1}
            onMouseDown={(e) => {

                const root = this.lbref.current.querySelector('.katex-html')
                const range = document.createRange()
                range.setStart(root, 0)
                range.setEnd(e.target as Node, 0)
                const left = range.cloneContents().textContent
                // not precise (Invisible elements like '_' and '^' are not in textContent)
                console.log(left)
                this.setState({
                    focused: true,
                    offset: left.length
                })
                this.forceUpdate()
                e.preventDefault()
                e.stopPropagation()
            }}
            onKeyDown={(e) => {
                console.log(['label keydown', e])
                // if (e.key === 'Enter') {
                //     this.setState({
                //         focused: true,
                //     })
                //     this.forceUpdate()
                //     console.log(['label keydown', e])
                //     e.preventDefault()
                // }
            }}
            style={{ display: 'inline-block' }}
            contentEditable='false'
            suppressContentEditableWarning
        >
            <data
                ref={this.dataRef}
                tabIndex={-1}
                {...this.dataAttribute()}
                onFocus={this.handleFocus}
                onKeyDown={e => {
                    console.log(e)
                }}
            ></data>
            {this.state.focused ? this.renderEdit() : this.renderDisplay()}
        </label>
    }

}