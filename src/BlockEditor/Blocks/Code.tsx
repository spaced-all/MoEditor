import { BlockProps, BlockStates } from "./Common"
import { DefaultBlock } from "./Common"
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

        return <pre >
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

                }}
                onValueChange={(code) => this.setState({
                    code: code,
                    dirty: true
                })}
            ></Editor>
        </pre>
    }
}