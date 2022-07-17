import { ContentItem } from "../types";
import React from "react";
import { InlineMath } from "../Inline/InlineMath";
import { InlineLink } from "../Inline/InlineLink";
import { InlineImage } from "../Inline/InlineImage";
import { unmountComponentAtNode } from 'react-dom';

/**
 * 
 * @param item 
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
export function ContentItemRender(item: ContentItem | ContentItem[], depth: number = 0, formatType: 'html' | 'code' | 'plaintext' = 'html') {
    if (!item) {
        return ""
    }

    if (!Array.isArray(item)) {
        item = [item]
    }


    return <>
        {(item.length === 0 && depth === 0) && ""}
        {item.map((val, ind, arr) => {
            var element;
            let textContent = val.textContent
            if (textContent) {
                textContent = textContent.replace(/\s/g, '\u00a0')
            } else {
                textContent = ''
            }
            let elementType: any = val.tagName
            switch (val.tagName) {
                case '#text':
                    // console.log(['render', textContent])
                    element = textContent
                    return element;
                case 'math':
                    // element = <InlineMath math={val.textContent}></InlineMath>
                    element = <InlineMath data={val} />
                    return element;
                case 'img':
                    elementType = InlineImage
                    break
                case 'a':
                    elementType = InlineLink
                    break
                // eslint-disable-next-line no-fallthrough
                default:
                    break
            }

            if (val.children && val.children.length > 0) {
                element = React.createElement(elementType, { ...val.attributes, key: Math.random() }, [textContent, ContentItemRender(val.children, depth + 1)])
            } else {
                element = React.createElement(elementType, { ...val.attributes, key: Math.random() }, textContent)
            }
            if (!elementType) {
                debugger
            }
            
            return element
        })}
    </>
}