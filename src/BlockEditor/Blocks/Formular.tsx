import React from "react";
import { Block, BlockProps, BlockStates } from "./Common"
import { DefaultBlock } from "./Common"
import * as op from "../operation"
import * as BE from "../event/eventtype"
import { Serialize } from "./render";
import { BlockMath } from "../MathComponent";
import 'katex/dist/katex.min.css';
import "./Formular.css"

export interface FormularProps extends BlockProps {
}

export interface FormularStats extends BlockStates {
}



export class Formular extends DefaultBlock<FormularProps, FormularStats, any, any> {
    static defaultProps = DefaultBlock.defaultProps;
    public get placeholder(): string {
        return "Type '/' for commands"
    }
    protected get contentEditableName(): string {
        return 'div'
    }
    handleBackspace = (e: React.KeyboardEvent<HTMLElement>) => {
        if (op.isCursorLeft(this.editableRoot())) {
            const caretPos = op.lastCaretPosition(this.editableRoot())
            const offset = op.getCaretReletivePosition(this.editableRoot(), caretPos.container, caretPos.offset)
            this.props.onMerge({
                'block': this.serialize(),
                'direction': 'left',
                'offset': -offset
            })
            e.preventDefault()
        }
    }

    handleDelete(e: React.KeyboardEvent<HTMLElement>) {
        if (op.isCursorRight(this.editableRoot())) {
            const caretPos = op.lastCaretPosition(this.editableRoot())
            const offset = op.getCaretReletivePosition(this.editableRoot(), caretPos.container, caretPos.offset)
            this.props.onMerge({
                'block': this.serialize(),
                'direction': 'right',
                'offset': offset
            })
            e.preventDefault()
        }
    }

    componentDidMount(): void {
        super.componentDidMount()


    }
    componentDidUpdate(prevProps: Readonly<FormularProps>, prevState: Readonly<FormularStats>, snapshot?: any): void {
        super.componentDidUpdate(prevProps, prevState, snapshot)

    }

    renderBlock(block: Block): React.ReactNode {
        return <BlockMath math={block.data.dom[0].textContent} />
    }

    // handleSpace = (e: React.KeyboardEvent<HTMLFormularElement>) => {
    //     const key = op.textContentBefore(this.editableRoot()).trim()
    //     if (key.length > 5) {
    //         return
    //     }
    //     const block = this.serialize()
    //     switch (key) {
    //         case '#':
    //         case '##':
    //         case '###':
    //         case '####':
    //         case '#####':
    //             block.type = 'heading'
    //             block.level = key.length
    //             this.props.onSplit({
    //                 'focus': block
    //             })
    //             e.preventDefault()
    //             break
    //         case '>':
    //             block.type = 'blockquote'
    //             this.props.onSplit({
    //                 'focus': block
    //             })
    //             e.preventDefault()
    //             break
    //         case '-':
    //             block.type = 'blockquote'
    //             block.data.dom = [
    //                 {
    //                     'tagName': 'li',
    //                     'children': block.data.dom,
    //                     'attributes': {
    //                         level: 1
    //                     }
    //                 }
    //             ]
    //             this.props.onSplit({
    //                 'focus': block
    //             })
    //             e.preventDefault()
    //             break
    //         case '[]':
    //         case '[ ]':
    //             break
    //         case '$$':
    //             break
    //         case '!!': // for block img
    //             break
    //         default:
    //             if (key.match(/1-9\./g)) {

    //             } else if (key.match(/```[a-z0-9]*/g)) {

    //             }
    //     }
    // };

}