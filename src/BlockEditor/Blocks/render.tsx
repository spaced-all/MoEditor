import React from "react"
import produce from "immer"
import { Dom, Block } from "./Common"
import { InlineMathLabel } from "../InlineComponent/InlineMatchLabel"
import * as op from "../operation"

export function SeralizeNode(node: Node): Dom {
    const tagName = node.nodeName.toLowerCase()

    var textContent;
    if (tagName === '#text') {
        textContent = node.textContent
    }
    const children = []
    for (var i = 0; i < node.childNodes.length; i++) {
        children.push(SeralizeNode(node.childNodes[i]))
    }
    var attributes
    // if (node instanceof HTMLElement) {
    //     attributes = node.attributes
    // }
    return { tagName, textContent, children, attributes }
}

export function Serialize(html: string): Dom[] {
    const temp = document.createElement('div')
    temp.innerHTML = html
    const dom: Dom[] = []

    for (var i = 0; i < temp.childNodes.length; i++) {
        const node = temp.childNodes[i]
        if (node instanceof HTMLElement) {
            if (op.isTag(node, 'label')) {
                const dataType = node.getAttribute('data-type')
                switch (dataType) {
                    case 'math':
                        const dataMath = node.getAttribute('data-math')
                        dom.push({
                            'tagName': 'math',
                            'textContent': dataMath
                        })
                        break
                }
                continue
            } else if (node.getAttribute('data-ignore') === 'true') {
                // table -> tbody(data-ignore='true' ) -> tr -> td
                dom.push(SeralizeNode(node.firstChild))
                continue
            } else if (node.classList.contains('bound-hint')) {
                // table -> tbody(data-ignore='true' ) -> tr -> td
                continue
            }
        }
        dom.push(SeralizeNode(node))
    }
    return dom
}

/**
 * 
 * @param dom 
 * @param depth 
 * @param formatType 
 *  html mean keep rich text as it is
 *  markdown mean convert rich text to markdown string, <b>text</b> will be converted as "**text**"
 *  > usually be used in code block
 *  
 *  plain mean convert rich text to plain text, <b>text</b> will be converted as "text"
 *  > usually be used in header block
 * @returns ReactHTML
 */
export function NestRender(dom: Dom[], depth: number = 0, formatType: 'html' | 'code' | 'plaintext' = 'html') {
    if (!dom) {
        return ""
    }

    return <>
        {(dom.length === 0 && depth === 0) && ""}
        {dom.map((val, ind) => {
            var element;

            switch (val.tagName) {
                case '#text':
                    element = val.textContent
                    break;
                case 'math':
                    element = <label
                        contentEditable='false'
                        suppressContentEditableWarning
                    >
                        <InlineMathLabel math={val.textContent} ></InlineMathLabel>
                    </label>
                    break
                default:
                    if (val.children && val.children.length > 0) {
                        element = React.createElement(val.tagName, { ...val.attributes, key: ind }, [val.textContent, NestRender(val.children, depth + 1)])
                    } else {
                        element = React.createElement(val.tagName, { ...val.attributes, key: ind }, val.textContent)
                    }
                    break
            }
            return element
        })}
    </>
}


const containerTagName = {
    'li': true,
    'td': true,
    'tr': true,
}

export function contentDom(a: Dom[]) {
    const dom = []
    a.forEach((val) => {
        if (!containerTagName[val.tagName]) {
            dom.push(val)
        } else {
            dom.push(...contentDom(val.children))
        }
    })
    return dom
}

export function mergeDom(a: Dom[], b: Dom[]): Dom[] {
    if (b.length === 0) {
        return a
    }

    if (b[0].tagName === 'li') {
        b = b[0].children
    }

    if (a.length === 0) {
        return b
    }
    if (a[0].tagName === 'li') {
        return produce(a, draft => {
            draft[draft.length - 1].children = [...draft[draft.length - 1].children, ...b]
        })
    }

    // a.push(...b)
    return [...a, ...b]
}


export function mergeBlockData(a: Block, b: Block): Block {
    var merged = {
        ...a,
        id: a.id || b.id,
        data: {
            dom: mergeDom(a.data.dom, b.data.dom)
        },
    };
    return merged;
}
