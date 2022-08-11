import React from "react";
import { ContentItem, DefaultBlockData, HeadingData } from "../types";
import * as op from "../utils"
import Position from "../Components/Position";
import { ABCLine, ABCLineStats, ABCLineProps } from "./ABCLine";
import { parseContent } from "./Common";

export interface HeadingProps extends ABCLineProps {

}

export interface HeadingStats extends ABCLineStats {
}



export class Heading extends ABCLine<HeadingProps, HeadingStats, HTMLHeadingElement, HTMLHeadingElement> {
    // static defaultProps = ABCBlock.defaultProps;
    static blockName = 'heading';

    protected get contentEditableName(): string {
        return `h${this.level}`
    }

    public get placeholder(): string {
        return `Heading ${this.level}`
    }
    public get level(): number {
        return this.props.data.heading.level
    }

    serializeContentData(): HeadingData {
        return {
            level: this.level,
            children: parseContent(op.validChildNodes(this.editableRoot()))
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
        let data: HeadingData
        switch (key) {
            case '#':
            case '##':
            case '###':
            case '####':
            case '#####':
                op.deleteTextBefore(this.currentContainer())
                if (this.level === key.length) {
                    data = this.serializeContentData()
                    block.type = 'paragraph'
                    block.paragraph = {
                        'children': data.children
                    }
                } else {
                    data = this.serializeContentData()
                    block.type = 'heading'
                    block.heading = {
                        'level': key.length,
                        'children': data.children
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
            let children = this.serializeContentData()
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


    makeContentEditable(contentEditable: React.ReactNode): React.ReactNode {
        return <div
            className="heading">
            {/* {
                this.props.active &&
                <Position
                    placement="left-start"
                    xOffset={-24}
                    yOffset={4}
                    block={false}
                    related={this.editableRootRef}>
                    <span style={{ color: '#BEC0BF', fontSize: 12 }}>
                        {this.contentEditableName}
                    </span>
                </Position>
            } */}
            {
                contentEditable
            }
        </div>
    }

}