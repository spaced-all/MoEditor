import React from "react";
import { Block, BlockProps, BlockStates, Dom } from "./Common"
import { DefaultBlock } from "./Common"
import { NestRender, Serialize } from "./render";
import * as op from "../operation"
import * as BE from "../event/eventtype";


interface VListProps extends BlockProps { }

interface VListStats extends BlockStates {
}


export abstract class VList<P extends BlockProps, S extends BlockStates, O extends HTMLElement> extends DefaultBlock<P, S, O, HTMLLIElement> {
    static defaultProps = DefaultBlock.defaultProps;

    protected get multiContainer(): boolean {
        return true
    }

    serializeDom(): Dom[] {
        const pure = []
        this.editableRoot().querySelectorAll('li').forEach((item) => {
            pure.push(item)
        })
        return this.serializeLis(pure)
    }

    serializeLis(lis: HTMLLIElement[], minItem: number = 1): Dom[] {
        const dom = lis.map((item): Dom => {
            return {
                tagName: 'li',
                attributes: {
                    level: parseFloat(item.getAttribute('data-indent-level')) || 1
                },
                children: Serialize(item.innerHTML)
            }

        })
        while (dom.length < minItem) {
            dom.push({
                tagName: 'li',
                attributes: {
                    level: 1
                },
                children: []
            })
        }
        return dom
    }

    maxIndent: number = 3;

    get listSize(): number {
        return this.editableRoot().querySelectorAll('li').length
    }
    firstContainer = () => {
        const root = this.editableRoot()
        return op.firstValidChild(root) as HTMLLIElement
    };
    lastContainer = () => {
        const root = this.editableRoot()
        return op.lastValidChild(root) as HTMLLIElement
    };
    getContainer = (index: number) => {
        return this.editableRoot().childNodes[index] as HTMLLIElement
    }

    currentContainer = () => {
        const sel = document.getSelection()
        const container = op.findParentMatchTagName(sel.focusNode, 'li', this.editableRoot()) as HTMLLIElement
        return container
    };

    handleBackspace = (e: React.KeyboardEvent<HTMLLIElement>) => {
        this.props.eventManager.call('boundhint', { name: 'unexpand', data: {} })
        const sel = document.getSelection()
        const inlineRoot = op.findParentMatchTagName(sel.focusNode, 'li', this.editableRoot()) as HTMLLIElement
        console.log([inlineRoot.innerHTML, op.isCursorLeft(inlineRoot)])
        if (op.isCursorLeft(inlineRoot)) {
            const curLevel = parseFloat(inlineRoot.getAttribute('data-indent-level'))
            if (curLevel > 1) {
                const nextLevel = curLevel - 1
                inlineRoot.classList.toggle(`list-indent-${curLevel}`)
                inlineRoot.classList.toggle(`list-indent-${nextLevel}`)
                inlineRoot.setAttribute('data-indent-level', `${nextLevel}`)
                e.preventDefault()
            } else {
                const left = []
                const right = []
                var cur = inlineRoot.previousElementSibling
                while (cur && op.isTag(cur, 'li')) {
                    left.splice(0, 0, cur)
                    cur = cur.previousElementSibling
                }
                cur = inlineRoot.nextElementSibling
                while (cur && op.isTag(cur, 'li')) {
                    right.push(cur)
                    cur = cur.nextElementSibling
                }

                const focus: Block = {
                    'type': 'paragraph',
                    'order': this.props.data.order,
                    'data': { dom: this.serializeLis([inlineRoot])[0].children },
                    'id': this.props.data.id,
                }
                const leftBlock = left.length > 0 ? this.serialize(this.serializeLis(left)) : undefined
                const rightBlock = right.length > 0 ? this.serialize(this.serializeLis(right)) : undefined
                this.props.onSplit({
                    'focus': focus,
                    'left': leftBlock,
                    'right': rightBlock,
                })
                e.preventDefault()
            }
        }
    };
    handleEnter(e: React.KeyboardEvent<HTMLLIElement>): void {
        this.props.eventManager.call('boundhint', { name: 'unexpand', data: {} })
        const sel = document.getSelection()
        const children = op.validChildNodes(this.currentContainer(), { 'br': false })
        const inlineRoot = op.findParentMatchTagName(sel.focusNode, 'li', this.editableRoot()) as HTMLLIElement
        if (children.length === 0) {
            // todo 处理完了 backspace 的情况，开始处理 delete 和 enter 的情况
            const left = []
            const right = []
            var cur = inlineRoot.previousElementSibling
            while (cur && op.isTag(cur, 'li')) {
                left.push(cur)
                cur = cur.previousElementSibling
            }

            cur = inlineRoot.nextElementSibling
            while (cur && op.isTag(cur, 'li')) {
                right.push(cur)
                cur = cur.nextElementSibling
            }

            const focus: Block = {
                'type': 'paragraph',
                'order': this.props.data.order,
                'data': { dom: this.serializeLis([inlineRoot])[0].children },
                'id': this.props.data.id,
            }
            const leftBlock = left.length > 0 ? this.serialize(this.serializeLis(left)) : undefined
            const rightBlock = right.length > 0 ? this.serialize(this.serializeLis(right)) : undefined
            this.props.onSplit({
                'focus': focus,
                'left': leftBlock,
                'right': rightBlock,
            })
            e.preventDefault()
        }

        const container = this.currentContainer()
        const level = container.getAttribute('data-indent-level')
        const className = container.className
        const range = document.getSelection().getRangeAt(0)
        range.deleteContents()
        const rightContent = op.extractContentRight(container)
        const right = op.wrapIn(rightContent, 'li',
            className,
            {
                "data-indent-level": level,
            }
        )

        container.parentElement.insertBefore(right, container.nextElementSibling)
        op.setCaretPosition(op.firstCaretPosition(right))
        e.preventDefault()
    }

    handleJumpToAbove(e: any): void {
        const container = this.currentContainer()
        const first = this.firstContainer()
        if (container === first) {
            // e['html']
            e['ref'] = this.currentContainer()
            this.props.onJumpAbove(e)
            e.preventDefault()
        }
    }

    handleJumpToBelow(e: any): void {
        const container = this.currentContainer()
        const last = this.lastContainer()
        if (container === last) {
            // e['html']
            e['ref'] = this.currentContainer()
            this.props.onJumpBelow(e)
            e.preventDefault()
        }
    }

    handleJumpToLeft(e) {
        const container = this.currentContainer()
        const index = parseFloat(container.getAttribute('data-index'))
        if (index === 0) {
            const newE = this.wrapBlockEvent<BE.KeyboardEvent<O>>(e);
            this.props.onJumpToAboveEnd(newE);
        } else {
            const caretPos = op.lastCaretPosition(op.previousValidNode(container) as HTMLLIElement)
            op.setCaretPosition(caretPos);
        }
        e.preventDefault()
    }
    handleJumpToRight(e: any): void {
        const container = this.currentContainer()
        const index = parseFloat(container.getAttribute('data-index'))
        if (index === this.listSize - 1) {
            const newE = this.wrapBlockEvent<BE.KeyboardEvent<O>>(e);
            this.props.onJumpToBelowStart(newE);
        } else {
            const caretPos = op.firstCaretPosition(op.nextValidNode(container) as HTMLLIElement)
            op.setCaretPosition(caretPos);
        }
        e.preventDefault()
    }

    handleTab = (e: React.KeyboardEvent<HTMLLIElement>) => {
        const sel = document.getSelection().getRangeAt(0)

        const startBlock = op.findParentMatchTagName(sel.startContainer, 'li', this.editableRoot()) as HTMLLIElement
        const endBlock = op.findParentMatchTagName(sel.endContainer, 'li', this.editableRoot()) as HTMLLIElement

        var cur = startBlock
        while (cur && cur !== endBlock.nextElementSibling) {
            const curLevel = parseFloat(cur.getAttribute('data-indent-level'))
            var nextLevel = e.shiftKey ? Math.max(curLevel - 1, 1) : Math.min(curLevel + 1, this.maxIndent)
            // const keep = op.currentCaretPosition(inlineBlock)
            // op.setCaretPosition(keep)
            cur.classList.toggle(`list-indent-${curLevel}`)
            cur.classList.toggle(`list-indent-${nextLevel}`)
            cur.setAttribute('data-indent-level', `${nextLevel}`)
            cur = cur.nextElementSibling as HTMLLIElement
            while (cur && !op.isTag(cur, 'li')) {
                cur = cur.nextElementSibling as HTMLLIElement
            }
        }

        e.preventDefault()
    };

    previousContainer = () => {

    }

    renderBlock(block: Block): React.ReactNode {
        return <>
            {
                block.data.dom.map((item, ind, arr) => {
                    return <li
                        key={ind}
                        data-indent-level={Math.min(this.maxIndent, item.attributes.level)}
                        className={[
                            `list-indent-${Math.min(this.maxIndent, item.attributes.level)}`,
                        ].join(" ")}>{item.textContent}{NestRender(item.children)}</li>
                })
            }
        </>
    }
}