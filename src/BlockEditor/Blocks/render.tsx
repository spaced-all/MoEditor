import React from "react"
import { Dom } from "./Common"

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
    if (node instanceof HTMLElement) {
        attributes = node.attributes
    }
    return { tagName, textContent, children, attributes }
}

export function Serialize(html: string): Dom[] {
    const temp = document.createElement('div')
    temp.innerHTML = html
    const dom = []

    for (var i = 0; i < temp.childNodes.length; i++) {
        const node = temp.childNodes[i]
        if (node instanceof HTMLElement) {
            if (node.getAttribute('data-ignore') === 'true') {
                // table -> tbody(data-ignore='true' ) -> tr -> td
                dom.push(SeralizeNode(node.firstChild))
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
        if (depth === 0) {
            return <></>
        } else {
            return <></>
        }
    }

    return <>
        {(dom.length === 0 && depth === 0) && <br />}

        {dom.map((val, ind) => {
            var element;

            switch (val.tagName) {
                case '#text':
                    element = val.textContent
                    break;
                default:
                    if (val.children && val.children.length > 0) {
                        element = React.createElement(val.tagName, { key: ind, ...val.attributes }, [val.textContent, NestRender(val.children, depth + 1)])
                    } else {
                        element = React.createElement(val.tagName, { key: ind, ...val.attributes }, val.textContent)
                    }
                    break
            }
            return element
        })}
    </>
}
