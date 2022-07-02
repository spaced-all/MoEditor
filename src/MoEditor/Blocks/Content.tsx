import { ContentItem } from "../types";
import React from "react";
import InlineMathLabel from "../Inline/InlineMatchLabel";


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
        {item.map((val, ind) => {
            var element;
            let textContent = val.textContent
            if (textContent) {
                textContent = textContent.replace(/\s/g, '\u00a0')
            }

            switch (val.tagName) {
                case '#text':
                    element = textContent
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
                        element = React.createElement(val.tagName, { ...val.attributes, key: ind }, [textContent, ContentItemRender(val.children, depth + 1)])
                    } else {
                        element = React.createElement(val.tagName, { ...val.attributes, key: ind }, textContent)
                    }
                    break
            }
            return element
        })}
    </>
}