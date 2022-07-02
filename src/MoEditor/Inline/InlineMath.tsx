import React from "react";
import KaTeX from "katex"
import 'katex/dist/katex.min.css';
interface InlineMathProps {
    math: string;
}
interface InlineMathStates {
    html: string
    error: Error
}

export class InlineMath extends React.Component<InlineMathProps, InlineMathStates> {
    constructor(props) {
        super(props)
        this.state = {
            html: null,
            error: null
        }
    }
    shouldComponentUpdate(nextProps: Readonly<InlineMathProps>, nextState: Readonly<InlineMathStates>, nextContext: any): boolean {
        return nextProps.math !== this.props.math || nextState.html !== this.state.html
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

            html = KaTeX.renderToString(this.props.math, {
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

    renderEdit() {

    }

    renderDisplay() {

    }

    render(): React.ReactNode {
        console.log(['render', this.state.html])
        return <span dangerouslySetInnerHTML={{ __html: this.state.html }} />
    }
}