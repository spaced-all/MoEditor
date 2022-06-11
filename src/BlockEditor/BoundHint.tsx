import React from "react"
import { EventManager } from "./event/emitter"
import * as op from "./operation"


const leftTag = {
    'p': '"',
    'li': '"',
    'b': '**',
    'i': '*',
    's': '~',
    'u': '_',
    'code': '`',
    'h1': '# ',
    'h2': '## ',
    'h3': '### ',
    'h4': '#### ',
    'h5': '##### ',
}

const rightTag = {
    'p': '"',
    'li': '"',
    'b': '**',
    'i': '*',
    's': '~',
    'u': '_',
    'code': '`',
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

export function BoundHint(props: { eventManager: EventManager }) {
    // const [ref, setRef] = useState<HTMLElement>(null)
    const ref = React.useRef<Node>()
    const leftRef = React.useRef<HTMLElement>()
    const rightRef = React.useRef<HTMLElement>()
    const textRef = React.useRef<Node>()
    
    React.useEffect(() => {
        props.eventManager.on('boundhint', (evt) => {
            if (evt.name == 'expand') {
                const { direction, force } = evt.data
                var el;
                const range = document.getSelection().getRangeAt(0)
                if (range.startContainer == range.endContainer) {
                    el = range.startContainer
                }
                else {
                    el = range.commonAncestorContainer

                }

                // <p>|</p> -> p, 0
                // <p>text<b>|text</b></p> -> text, 0
                // <p><b></b>|<i><i/></p>  -> p, 1
                // <p><b>|</b><i><i/></p>  -> b, 0
                console.log('on Expand')
                if (el == ref.current && !force) {
                    return
                }
                if (ref.current) {
                    // if (ref.current.classList.contains(styles['tag-expand'])) {
                    //     ref.current.classList.remove(styles['tag-expand'])
                    // }
                    if (leftRef.current) {
                        leftRef.current.innerText = ''
                        rightRef.current.innerText = ''
                    }
                    if (textRef.current) {
                        // trim 会导致无文本结点，导致光标出问题
                        textRef.current.textContent = textRef.current.textContent.trim()
                        if (textRef.current.textContent.trim() == '' && textRef.current.parentElement) {
                            // 直接删除会导致光标定位到父级结点， 使得 bound hit 定位错误
                            textRef.current.parentElement.removeChild(textRef.current)
                        } else {
                        }
                        textRef.current = null
                    }
                }

                ref.current = el
                if (!leftRef.current) {
                    const left = document.createElement('span')
                    const right = document.createElement('span')
                    leftRef.current = left
                    left.contentEditable = 'false'
                    rightRef.current = right
                    right.contentEditable = 'false'
                }

                if (!textRef.current) {
                    const text = document.createTextNode(' ')
                    textRef.current = text
                }
                // debugger


                if (range.startContainer == range.endContainer) {
                    el = range.startContainer
                    if (op.isTag(el.childNodes[range.startOffset], '#text') && op.isValidTag(el.childNodes[range.startOffset])) {

                        el = el.childNodes[range.startOffset]
                        range.setStart(el, 0)
                        // if (el.textContent == '') {
                        //     range.insertNode(document.createTextNode(' '))
                        // }
                        // range.setStart(el, 0)
                    }
                    if (el instanceof HTMLElement) {
                        //  p, b, i, code, ...
                        el.insertBefore(rightRef.current, el.childNodes[range.startOffset])
                        leftRef.current.innerText = getLeftBoundHint(el)
                        rightRef.current.innerText = getRightBoundHint(el)

                        el.insertBefore(leftRef.current, rightRef.current)
                        el.insertBefore(textRef.current, rightRef.current)
                        const sel = document.getSelection()
                        const newRange = sel.getRangeAt(0)
                        newRange.setStart(textRef.current, direction || 0)
                        ref.current = textRef.current
                    } else {
                        // text
                        el.parentElement.insertBefore(leftRef.current, op.firstNeighborTextNode(el))
                        el.parentElement.insertBefore(rightRef.current, op.lastNeighborTextNode(el).nextSibling)

                        leftRef.current.innerText = getLeftBoundHint(el.parentElement)
                        rightRef.current.innerText = getRightBoundHint(el.parentElement)
                        range.setStart(range.startContainer, range.startOffset)
                    }
                } else {

                    el = range.commonAncestorContainer
                    leftRef.current.innerText = getLeftBoundHint(el)
                    rightRef.current.innerText = getRightBoundHint(el)
                    el.insertBefore(rightRef.current, el.lastChild.nextSibling)
                    el.insertBefore(leftRef.current, el.firstChild)

                    // el.insertBefore(textRef.current, rightRef.current)
                    // const sel = document.getSelection()
                    // const newRange = sel.getRangeAt(0)
                    // newRange.setStart(textRef.current, direction)
                    // ref.current = textRef.current
                }
            } else if (evt.name == 'unexpand') {
                if (ref.current) {
                    ref.current = null
                    if (leftRef.current) {
                        leftRef.current.innerText = ''
                        rightRef.current.innerText = ''
                    }
                    if (textRef.current) {
                        if (textRef.current.textContent.trim() == '' && textRef.current.parentElement) {
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
