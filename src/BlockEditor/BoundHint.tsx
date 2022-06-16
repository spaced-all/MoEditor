import React from "react"
import { EventManager } from "./event/emitter"
import * as op from "./operation"
import { isTag } from "./operation"

const whiteSpace = ''

const leftTag = {
    // 'p': "",
    // 'td': "'",
    // 'li': "",
    'b': '**',
    'i': '*',
    's': '\u00a0',
    'u': '\u00a0',
    'code': '`',
    // 'span': " ",
    // 'h1': '\u00a0',
    // 'h2': '\u00a0',
    // 'h3': '\u00a0',
    // 'h4': '\u00a0',
    // 'h5': '\u00a0',
    'default': '\u00a0'
}

const rightTag = {
    // 'p': "\u00a0",
    // 'li': "",
    // 'td': "'",
    'b': '**',
    'i': '*',
    's': '\u00a0',
    'u': '\u00a0',
    // 'ul': '',
    // 'ol': '',
    'code': '`',
    // 'span': " ",
    // 'h1': '\u00a0',
    // 'h2': '\u00a0',
    // 'h3': '\u00a0',
    // 'h4': '\u00a0',
    // 'h5': '\u00a0',
    'default': '\u00a0'
}

const getLeftBoundHint = (el: Node, center: Node) => {
    const name = op.getTagName(el)
    if (leftTag[name] !== undefined) {
        return leftTag[name]
    }
    // https://stackoverflow.com/a/72629663/11185460
    if (op.previousValidNode(op.firstNeighborTextNode(center))) {
        return leftTag['default']
    }
    return ''
}
const getRightBoundHint = (el: Node, center: Node) => {
    const name = op.getTagName(el)
    if (rightTag[name] !== undefined) {
        return rightTag[name]
    }
    if (op.nextValidNode(op.lastNeighborTextNode(center))) {
        return rightTag['default']
    }
    return ''
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
                const sel = document.getSelection()
                if (!sel || sel.rangeCount === 0) {
                    return
                }
                // debugger
                const range = sel.getRangeAt(0)
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

                var rightOffset = direction === 'right' ? whiteSpace.length : 0
                if (op.isParent(el, leftRef.current)) {
                    el = op.nextValidNode(leftRef.current, { emptyText: false })
                    offset = 0
                }
                if (op.isParent(el, rightRef.current)) {
                    el = op.previousValidNode(rightRef.current, { emptyText: false })
                    offset = el.textContent.length
                    rightOffset = 0
                }

                if (textRef.current) {
                    // trim 会导致无文本结点，导致光标出问题
                    // textRef.current.textContent = textRef.current.textContent.trim()
                    if (textRef.current.textContent.trim() === '') {
                        // 直接删除会导致光标定位到父级结点， 使得 bound hit 定位错误
                        if (textRef.current.parentElement) {
                            textRef.current.parentElement.removeChild(textRef.current)
                            textRef.current.textContent = ''
                            textRef.current = document.createTextNode(whiteSpace)
                        } else {
                            textRef.current.textContent = whiteSpace
                        }
                    }
                } else {
                    textRef.current = document.createTextNode(whiteSpace)
                }

                if (!leftRef.current) {
                    const left = document.createElement('span')
                    const right = document.createElement('span')
                    left.classList.add('bound-hint-left')
                    left.classList.add('bound-hint')
                    right.classList.add('bound-hint-right')
                    right.classList.add('bound-hint')
                    leftRef.current = left
                    rightRef.current = right
                    // right.contentEditable = 'false'
                }

                if (op.isTag(el, 'textarea') || op.isTag(el.childNodes[offset], 'textarea')) {
                    return
                }
                // debugger
                if (!op.isTag(el, '#text') && !multiSelect) {
                    // 将 el 位置插入文本
                    if (el.childNodes[offset]) {
                        if (isTag(el.childNodes[offset], '#text')) {
                            if (el.childNodes[offset].textContent === '') {
                                el.childNodes[offset].textContent = whiteSpace
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
                    if (isTag(el, '#text') && (el.textContent === '' || el.textContent === '\u00a0')) {
                        el.textContent = whiteSpace
                        offset = rightOffset
                    }
                    range.setStart(el, offset)
                    range.setEnd(el, offset)

                    leftRef.current.innerText = getLeftBoundHint(el.parentElement, el)
                    rightRef.current.innerText = getRightBoundHint(el.parentElement, el)
                    if (leftRef.current.textContent !== '') {
                        el.parentElement.insertBefore(leftRef.current, op.firstNeighborTextNode(el))
                    }
                    if (rightRef.current.textContent !== '') {
                        el.parentElement.insertBefore(rightRef.current, op.lastNeighborTextNode(el).nextSibling)
                    }

                } else {
                    if (isTag(el, "#text")) {
                        leftRef.current.innerText = getLeftBoundHint(el.parentElement, el)
                        rightRef.current.innerText = getRightBoundHint(el.parentElement, el)
                        if (leftRef.current.textContent !== '') {
                            el.parentElement.insertBefore(leftRef.current, op.firstNeighborTextNode(el))
                        }
                        if (rightRef.current.textContent !== '') {
                            el.parentElement.insertBefore(rightRef.current, op.lastNeighborTextNode(el).nextSibling)
                        }
                    } else {
                        leftRef.current.innerText = getLeftBoundHint(el, el)
                        rightRef.current.innerText = getRightBoundHint(el, el)
                        if (leftRef.current.textContent !== '') {
                            if (el.firstChild) {
                                el.insertBefore(leftRef.current, el.firstChild)
                            } else {
                                el.insertBefore(leftRef.current, el.firstChild)
                            }
                        }
                        if (rightRef.current.textContent !== '') {
                            if (el.firstChild) {
                                el.insertBefore(rightRef.current, el.lastChild.nextSibling)
                            } else {
                                el.appendChild(rightRef.current,)
                            }
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
