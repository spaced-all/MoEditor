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
    iptRef: React.RefObject<HTMLInputElement>
    rRef: React.RefObject<HTMLSpanElement>
    sRef: React.RefObject<HTMLSpanElement>
    lbRef: React.RefObject<HTMLLabelElement>
    constructor(props: InlineMathProps) {
        super(props)
        this.state = {
            focused: false,
            math: props.data.textContent,
            html: null,
            error: null
        }
        this.rRef = React.createRef()
        this.sRef = React.createRef()
        this.lbRef = React.createRef()
        this.iptRef = React.createRef()
        this.setSpace = this.setSpace.bind(this)
    }
    shouldComponentUpdate(nextProps: Readonly<InlineMathProps>, nextState: Readonly<InlineMathStates>, nextContext: any): boolean {
        return nextState.math !== this.state.math || nextState.html !== this.state.html
    }
    componentDidMount(): void {
        const { html, error } = this.generateHTML()
        this.rRef.current.innerHTML = error ? error : html
        // this.setState(this.generateHTML())
        this.setSpace()
    }
    componentDidUpdate(prevProps: Readonly<InlineMathProps>, prevState: Readonly<InlineMathStates>, snapshot?: any): void {
        const { html, error } = this.generateHTML()
        this.rRef.current.innerHTML = error ? error : html
        this.setSpace()
    }

    setSpace() {
        // debugger
        const render = this.rRef.current
        const space = this.sRef.current
        space.textContent = '\u00a0'
        const sw = space.getBoundingClientRect().width
        const count = Math.round(parseFloat(getComputedStyle(render).width) / sw)
        space.textContent = '\u00a0'.repeat(count)
        // render.style.width = getComputedStyle(space).width
        // if (render) {
        //     // console.log(['render ref', getComputedStyle(render).width])
        // }
        // const canvas = document.createElement('canvas')
        // canvas.
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
            <span style={{ backgroundColor: 'white', color: 'gray' }}>
                {'$'}
                <input
                    type={'text'}
                    className={[
                        styles['input'],
                        styles['input-math'],
                    ].join(' ')}
                    ref={this.iptRef}
                    autoFocus
                    value={this.state.math}
                    onFocus={e => {
                        console.log(['input focused', e])
                        const tgt = e.target as HTMLInputElement
                        if (this.state.offset) {
                            tgt.setSelectionRange(this.state.offset, this.state.offset)
                        }

                        tgt.style.width = `${Math.round((tgt.value.length + 1) / 2) - 2}.5em`
                        e.stopPropagation()
                    }}
                    onInput={(e) => {
                        e.stopPropagation()
                    }}
                    onChange={(e) => {
                        this.setState({ math: e.target.value })
                        const tgt = e.target as HTMLInputElement
                        tgt.style.width = `${(tgt.value.length + 1) / 2}em`
                        this.forceUpdate()
                        e.stopPropagation()
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
                    backgroundColor: 'white',
                }}
                offset={{
                    left: this.iptRef.current && this.iptRef.current.offsetLeft,
                    top: this.iptRef.current && this.iptRef.current.offsetTop
                }}
                block={false} related={this.iptRef} >
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
        return <>
            <span
                ref={this.sRef}
                className="space-math">
                {"-"}
            </span>
            <span
                ref={this.rRef}
                className={[
                    "display-math",
                    this.state.focused && styles['display-math-edit']
                ].join(' ')}
                dangerouslySetInnerHTML={{ __html: this.state.html }} />
        </>
    }

    render(): React.ReactNode {
        return <React.Fragment>
            <label
                className={styles['unselectable']}
                ref={this.lbRef}
                tabIndex={-1}
                onClick={(e) => {
                    const root = this.lbRef.current.querySelector('.katex-html')
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
                }}
                style={{
                    display: 'inline-block',
                }}
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
            {/* {'\u00a0'} */}
        </React.Fragment>
    }

}