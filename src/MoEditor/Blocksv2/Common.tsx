import React, { CSSProperties } from "react";
import * as op from "../utils"
import { ContentItem } from "../types";




export function parseContent(el: Node[] | Node | HTMLElement[] | HTMLElement): ContentItem[] {
    if (Array.isArray(el)) {
        return el.map(parseContent).flat()
    }
    if (!op.isValidTag(el)) {
        return []
    }
    if (el.textContent === '' && op.getTagName(el) !== 'label') {
        return []
    }

    const elName = op.getTagName(el)
    let res: ContentItem
    switch (elName) {
        // case 'span':
        //     return []
        case "label":
            const data = (el as HTMLElement)
            const tagName = data.getAttribute('data-type')
            const value = data.getAttribute('data-value')
            let dataKeys = data.getAttribute('data-key')
            const attributes = {}
            if (dataKeys) {
                dataKeys.split(' ').forEach(item => {
                    attributes[item] = data.getAttribute(`data-${item}`)
                })
            }
            // const dataKeys = data.getAttribute('data-keys').split(' ')

            res = {
                'tagName': tagName,
                'attributes': attributes,
                'textContent': value
            }
            break
        case "#text":
            res = {
                'tagName': elName,
                'textContent': el.textContent
            }
            break
        default:
            const children = []
            if (op.isFullTextNode(el as HTMLElement)) {
                res = {
                    'tagName': elName,
                    'textContent': op.fullText(el)
                }
            } else {
                op.validChildNodes(el).forEach(item => children.push(...parseContent(item as HTMLElement)))
                res = {
                    'tagName': elName,
                    'children': children,
                    'textContent': ''
                }
            }
            if (elName === 'a') {
                res['attributes'] = {
                    href: (el as HTMLElement).getAttribute('href')
                }
            }
            if (elName === 'em') {
                res['attributes'] = {
                    className: (el as HTMLElement).getAttribute('class')
                }
            }


            break
    }
    return [res]
}

export function renderContent() {

}

export function ContentEditable<T>(props: {
    tagName: string;
    className?: string;
    children: React.ReactNode;
    innerRef?: React.RefObject<T>;
    contentEditable?: boolean;
    placeholder?: string;
    style?: CSSProperties | undefined;
    onInput?: (...any) => any;
    onChange?: (...any) => any;
    onBlur?: (...any) => any;
    onFocus?: (...any) => any;
    onSelect?: (...any) => any;
    onKeyDown?: (...any) => any;
    onKeyUp?: (...any) => any;
    onMouseMove?: (...any) => any;
    onMouseEnter?: (...any) => any;
    onMouseLeave?: (...any) => any;
    onMouseDown?: (...any) => any;
    onMouseUp?: (...any) => any;
    onCopy?: (...any) => any;
    onPaste?: (...any) => any;
    onContextMenu?: (...any) => any;
}) {
    return React.createElement(
        props.tagName,
        {
            ref: props.innerRef,
            contentEditable: props.contentEditable,
            className: props.className,
            'data-placeholder': props.placeholder,
            onInput: props.onInput,
            onChange: props.onChange,
            onBlur: props.onBlur,
            onFocus: props.onFocus,
            onSelect: props.onSelect,
            onKeyDown: props.onKeyDown,
            onKeyUp: props.onKeyUp,
            onCopy: props.onCopy,
            onPaste: props.onPaste,
            onMouseMove: props.onMouseMove,
            onMouseEnter: props.onMouseEnter,
            onMouseLeave: props.onMouseLeave,
            onMouseDown: props.onMouseDown,
            onMouseUp: props.onMouseUp,
            onContextMenu: props.onContextMenu,
            style: props.style,
            tabIndex: -1,
            suppressContentEditableWarning: true,
        },
        props.children
    );
}


