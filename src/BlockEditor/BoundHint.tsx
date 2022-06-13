import React from "react"
import { EventManager } from "./event/emitter"
import * as op from "./operation"
import { isTag } from "./operation"


const leftTag = {
    'p': "'",
    'td': "'",
    'li': "'",
    'b': '**',
    'i': '*',
    's': '~',
    'u': '_',
    'ul': '',
    'ol': '',
    'code': '`',
    'span': "'",
    'h1': '# ',
    'h2': '## ',
    'h3': '### ',
    'h4': '#### ',
    'h5': '##### ',
}

const rightTag = {
    'p': "'",
    'li': "'",
    'td': "'",
    'b': '**',
    'i': '*',
    's': '~',
    'u': '_',
    'ul': '',
    'ol': '',
    'code': '`',
    'span': "'",
    'h1': '',
    'h2': '',
    'h3': '',
    'h4': '',
    'h5': '',
}

const getLeftBoundHint = (el: Node) => {
    const name = op.getTagName(el)
    if (leftTag[name] !== undefined) {
        return leftTag[name]
    }
    return `<${name}>`


}
const getRightBoundHint = (el: Node) => {
    const name = op.getTagName(el)
    if (rightTag[name] !== undefined) {
        return rightTag[name]
    }
    return `</${name}>`
}

export function BoundHint(props: { eventManager: EventManager, disable: boolean }) {
    // const [ref, setRef] = useState<HTMLElement>(null)
    const ref = React.useRef<Node>()
    const leftRef = React.useRef<HTMLElement>()
    const rightRef = React.useRef<HTMLElement>()
    const textRef = React.useRef<Node>()
    const disableRef = React.useRef(props.disable)
    disableRef.current = props.disable
    React.useEffect(() => {
        if (props.disable) {
            props.eventManager.call('boundhint', { 'name': 'unexpand', data: {} })
        } else {
            props.eventManager.call('boundhint', { 'name': 'expand', data: {} })
        }
    }, [props.eventManager, props.disable])
    React.useEffect(() => {
        props.eventManager.on('boundhint', (evt) => {
            if (evt.name === 'expand') {
                if (disableRef.current) {
                    return
                }
                const { direction, force } = evt.data
                var el: Node;
                var multiSelect = false;
                var offset = 0;
                const range = document.getSelection().getRangeAt(0)
                if (range.startContainer === range.endContainer && range.startOffset === range.endOffset) {
                    el = range.startContainer
                    offset = range.startOffset
                }
                else {
                    el = range.commonAncestorContainer
                    multiSelect = true
                }
                // TODO <br> caret move problem

                // <p>|</p> -> p, 0
                // <p>text<b>|text</b></p> -> text, 0
                // <p><b></b>|<i><i/></p>  -> p, 1
                // <p><b>|</b><i><i/></p>  -> b, 0
                if (el === ref.current && !force) {
                    return
                }

                if (textRef.current) {
                    // trim 会导致无文本结点，导致光标出问题
                    // textRef.current.textContent = textRef.current.textContent.trim()
                    if (textRef.current.textContent.trim() === '') {
                        // 直接删除会导致光标定位到父级结点， 使得 bound hit 定位错误
                        if (textRef.current.parentElement) {
                            // textRef.current.parentElement.removeChild(textRef.current)
                            textRef.current.textContent = ''
                            textRef.current = document.createTextNode(' ')
                        } else {
                            textRef.current.textContent = ' '
                        }
                    }
                } else {
                    textRef.current = document.createTextNode(' ')
                }

                if (!leftRef.current) {
                    const left = document.createElement('span')
                    const right = document.createElement('span')
                    leftRef.current = left
                    left.contentEditable = 'false'
                    rightRef.current = right
                    right.contentEditable = 'false'
                }
                const rightOffset = direction === 'right' ? 1 : 0

                if (op.isTag(el, 'textarea') || op.isTag(el.childNodes[offset], 'textarea')) {
                    return
                }

                if ((op.isTag(el, 'ul') || op.isTag(el, 'blockquote')) && !multiSelect) {
                    if (el.childNodes[offset]) {
                        el = el.childNodes[offset]
                        offset = 0
                    } else {
                        el = op.lastValidChild(el)
                        offset = 0
                    }
                }

                if (!op.isTag(el, '#text') && !multiSelect) {
                    // 将 el 位置插入文本
                    if (el.childNodes[offset]) {
                        if (isTag(el.childNodes[offset], '#text')) {
                            if (el.childNodes[offset].textContent === '') {
                                el.childNodes[offset].textContent = ' '
                            }
                            el = el.childNodes[offset]
                            offset = rightOffset
                        } else {
                            el.insertBefore(textRef.current, el.childNodes[offset])
                            el = textRef.current
                            offset = rightOffset

                        }
                    } else {
                        el.appendChild(textRef.current)
                        el = textRef.current
                        offset = rightOffset
                    }
                }

                ref.current = el
                if (!multiSelect) {
                    // debugger
                    if (isTag(el, '#text') && (el.textContent === '' || el.textContent === ' ')) {
                        el.textContent = ' '
                        offset = rightOffset
                    }
                    range.setStart(el, offset)
                    range.setEnd(el, offset)

                    leftRef.current.innerText = getLeftBoundHint(el.parentElement)
                    rightRef.current.innerText = getRightBoundHint(el.parentElement)
                    el.parentElement.insertBefore(leftRef.current, op.firstNeighborTextNode(el))
                    el.parentElement.insertBefore(rightRef.current, op.lastNeighborTextNode(el).nextSibling)

                } else {
                    if (isTag(el, "#text")) {
                        leftRef.current.innerText = getLeftBoundHint(el.parentElement)
                        rightRef.current.innerText = getRightBoundHint(el.parentElement)
                        el.parentElement.insertBefore(leftRef.current, op.firstNeighborTextNode(el))
                        el.parentElement.insertBefore(rightRef.current, op.lastNeighborTextNode(el).nextSibling)
                    } else {
                        leftRef.current.innerText = getLeftBoundHint(el)
                        rightRef.current.innerText = getRightBoundHint(el)
                        if (el.firstChild) {

                            el.insertBefore(rightRef.current, el.lastChild.nextSibling)
                            el.insertBefore(leftRef.current, el.firstChild)
                        } else {
                            el.appendChild(rightRef.current,)
                            el.insertBefore(leftRef.current, el.firstChild)

                        }
                    }

                }
            } else if (evt.name === 'unexpand') {
                if (ref.current) {
                    ref.current = null
                    if (leftRef.current) {
                        leftRef.current.innerText = ''
                        rightRef.current.innerText = ''
                        leftRef.current.remove()
                        rightRef.current.remove()
                    }
                    if (textRef.current) {
                        if (textRef.current.textContent.trim() === '' && textRef.current.parentElement) {
                            textRef.current.parentElement.removeChild(textRef.current)
                        } else {
                            textRef.current.textContent = textRef.current.textContent.trim()
                        }
                        textRef.current = null
                    }
                }
            }
        })

    }, [props.eventManager])

    return <></>
}
