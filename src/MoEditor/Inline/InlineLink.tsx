import React from "react";
import KaTeX from "katex"
import 'katex/dist/katex.min.css';
import { ABCInline, ABCInlineProps, ABCInlineStates } from "./ABCInline"
interface InlineLinkProps extends ABCInlineProps {
    href: string;
    children: React.ReactNode
}
interface InlineLinkStates extends ABCInlineStates {

}

export class InlineLink extends ABCInline<InlineLinkProps, InlineLinkStates> {
    // constructor(props) {
    //     super(props)

    // }

    renderDisplay() {
        return <a
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
                if (e.metaKey) {
                    window.open(this.props.href)
                }
            }}
            
            // onMouseEnter={() => { console.log('label mouse') }}
            // onMouseLeave={() => { console.log('label mouse') }}
            href={this.props.href}>{this.props.children}</a>
    }

}