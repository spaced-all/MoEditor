import React from "react";
import KaTeX from "katex"
import 'katex/dist/katex.min.css';
import { ABCInline, ABCInlineProps, ABCInlineStates } from "./ABCInline"
interface InlineImageProps extends ABCInlineProps {
    src: string;
    children: React.ReactNode
}
interface InlineImageStates extends ABCInlineStates {

}

export class InlineImage extends ABCInline<InlineImageProps, InlineImageStates> {
    // constructor(props) {
    //     super(props)

    // }

    renderDisplay() {
        return <a
            style={{ cursor: 'pointer' }}
            onClick={(e) => { }}
            // onMouseEnter={() => { console.log('label mouse') }}
            // onMouseLeave={() => { console.log('label mouse') }}
            href={this.props.src}>{this.props.children}</a>
    }

}