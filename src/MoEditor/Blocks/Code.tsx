import React from "react";
import { BoundHint, BoundHintType, CodeBoundHint } from "../boundhint";
import { DefaultBlock, DefaultBlockData } from "../types";
// import { highlight, languages } from 'prismjs/components/prism-core';

import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";
import Highlight, { defaultProps } from "prism-react-renderer";
// import styles from "./Code.module.css"

export interface CodeProps extends ABCBlockProps {

}

export interface CodeStats extends ABCBlockStates {
    code: string
}

export class Code extends ABCBlock<CodeProps, CodeStats, HTMLElement, HTMLPreElement> {
    serialize(): DefaultBlockData {
        return this.props.data
    }
    protected get disableBoundHint(): boolean {
        return true
    }
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'code';

    protected get contentEditableName(): string {
        return 'pre'
    }

    constructor(props) {
        super(props)
        this.state = {
            code: this.props.data.code.code.join('\n')
        }
        this.boundhint = new CodeBoundHint() as any
    }

    renderBlock(block: DefaultBlockData): React.ReactNode {
        // const code = highlight(block.code.code.join('\n'), languages.javascript, 'javascript')
        // return <pre dangerouslySetInnerHTML={{ __html: code }}></pre>

        return <textarea>block.code.code.join('\n')</textarea>

    }

    render(): React.ReactNode {

        const contentStyle = {
            paddingTop: 4,
            paddingRight: 4,
            paddingBottom: 4,
            paddingLeft: 4,
        };

        return <div

            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                ...styles.container
            }}

        >
            <textarea

                style={{
                    ...styles.editor,
                    ...styles.textarea,
                    ...contentStyle
                }}
                value={this.state.code}
                onChange={(e) => {
                    this.setState({ code: e.target.value })
                    this.forceUpdate()
                }}></textarea>
            <Highlight
                {...defaultProps} code={this.state.code} language="jsx">
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={[className].join(' ')} style={{ ...style, ...styles.editor, ...styles.highlight, ...contentStyle }}                    >
                        {tokens.map((line, i) => (
                            <div {...getLineProps({ line, key: i })}>
                                {line.map((token, key) => (
                                    <span {...getTokenProps({ token, key })} />
                                ))}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    }
}



const styles = {
    container: {
        position: 'relative',
        textAlign: 'left',
        boxSizing: 'border-box',
        padding: 0,
        overflow: 'hidden',
    },
    textarea: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        resize: 'none',
        color: 'inherit',
        overflow: 'hidden',
        MozOsxFontSmoothing: 'grayscale',
        WebkitFontSmoothing: 'antialiased',
        WebkitTextFillColor: 'transparent',
    },
    highlight: {
        position: 'relative',
        pointerEvents: 'none',
    },
    editor: {
        margin: 0,
        border: 0,
        background: 'none',
        boxSizing: 'inherit',
        display: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontStyle: 'inherit',
        fontVariantLigatures: 'inherit',
        fontWeight: 'inherit',
        letterSpacing: 'inherit',
        lineHeight: 'inherit',
        tabSize: 'inherit',
        textIndent: 'inherit',
        textRendering: 'inherit',
        textTransform: 'inherit',
        whiteSpace: 'pre-wrap',
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
    },
} as const;