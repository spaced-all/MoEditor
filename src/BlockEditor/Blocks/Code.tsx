import { BlockProps, BlockStates, ContentEditable } from "./Common"
import { ListBlock, DefaultBlock } from "./Common"
import { NestRender } from "./render";
import * as op from "../operation"
import * as BE from "../event/eventtype";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Editor from "./CodeEditor"
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another


interface CodeProps extends BlockProps {
}

interface CodeStats extends BlockStates {
    code: string
}


export class Code extends DefaultBlock<CodeProps, CodeStats, HTMLPreElement, HTMLElement> {
    static defaultProps = DefaultBlock.defaultProps;
    constructor(props) {
        super(props)
        this.state = {
            ...this.state,
            code: this.state.data.data.dom.map((item) => {
                return item.textContent
            }).join('\n')
        }
    }
    /**
     * 
     * @<SyntaxHighlighter language="javascript" style={dark}>
            {data.data.dom.map((item) => {
                return item.textContent
            }).join('\n')}
        </SyntaxHighlighter>
     */

    getCodeString() {
        return this.state.code
    }

    render() {

        return <pre ref={this.ref}>
            <Editor
                className="pre-code"
                value={this.state.code}
                padding={10}
                highlight={code => highlight(code, languages.javascript, 'javascript')}
                style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                }}
                onKeyDown={() => {
                    console.log(document.getSelection().focusNode, document.getSelection().focusOffset)
                    const range = document.getSelection().getRangeAt(0)
                }}
                onValueChange={(code) => this.setState({
                    code: code,
                    dirty: true
                })}
            ></Editor>
        </pre>
    }
}