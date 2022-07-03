import React from "react";
import { DefaultBlockData, HeadingData } from "../types";
import * as op from "../dom"
import { ABCBlock, ABCBlockProps, ABCBlockStates } from "./ABCBlock";

export interface HeadingProps extends ABCBlockProps {

}

export interface HeadingStats extends ABCBlockStates {
}



export class Heading extends ABCBlock<HeadingProps, HeadingStats, HTMLHeadingElement, HTMLHeadingElement> {
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'heading';

    protected get contentEditableName(): string {
        // return `h${this.level}`
        return `span`
    }

    public get placeholder(): string {
        return `Heading ${this.level}`
    }
    public get level(): number {
        return this.props.data.heading.level
    }
    serializeData(): HeadingData {
        const arr = []
        this.editableRoot().childNodes.forEach(item => arr.push(item))
        return {
            'level': this.level,
            'children': Heading.serializeContentItem(arr)
        }
    }
    handleSpace(e: React.KeyboardEvent<Element>): void {
        const key = op.textContentBefore(this.editableRoot()).trim()
        if (key.length > 5 || key.length === 0) {
            return
        }
        const block: DefaultBlockData = {
            ...this.props.data,
        }
        delete block['heading']
        let children: HeadingData
        switch (key) {
            case '#':
            case '##':
            case '###':
            case '####':
            case '#####':
                op.deleteTextBefore(this.currentContainer())
                if (this.level === key.length) {
                    children = this.serializeData()
                    block.type = 'paragraph'
                    block.paragraph = {
                        'children': children.children
                    }
                } else {
                    children = this.serializeData()
                    block.type = 'heading'
                    block.heading = {
                        'level': key.length,
                        'children': children.children
                    }
                }
                this.props.onSplit({
                    'focus': block
                })
                e.preventDefault()
                break
        }
    }
    handleBackspace(e: React.KeyboardEvent<Element>): void {
        if (this.isCursorLeft()) {
            const block: DefaultBlockData = {
                ...this.props.data,
            }
            delete block['blockquote']
            op.deleteTextBefore(this.currentContainer())
            let children = this.serializeData()
            block.type = 'paragraph'
            block.paragraph = {
                'children': children.children
            }

            this.props.onSplit({
                'focus': block
            })
            e.preventDefault()
        }
    }
    renderBlock(block: DefaultBlockData): React.ReactNode {
        return this.renderContentItem(block.heading.children)
    }
    makeContentEditable(contentEditable: React.ReactNode): React.ReactNode {
        return <div
            className="heading">
            {React.createElement(`h${this.level}`, {},
                [
                    this.props.active ? '#'.repeat(this.level) + ' ' : null,
                    contentEditable
                ]
            )}
            {

            }


            {/* <div style={{}}>
            </div> */}
        </div>
    }

}