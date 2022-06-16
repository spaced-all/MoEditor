import React from "react"
import { EventManager } from "./event/emitter"
import * as op from "./operation"
import { isTag } from "./operation"
import ReactDOM from "react-dom"

export function FunctionButton(props: {
    // parent: HTMLElement,
    rel: HTMLElement
}) {
    const ref = React.useRef<HTMLDivElement>()
    const btref = React.useRef<HTMLButtonElement>()
    const [top, setTop] = React.useState(0)
    React.useEffect(() => {
        if (ref.current && props.rel) {
            setTop(props.rel.offsetTop + props.rel.offsetHeight / 2
                - ref.current.offsetTop - btref.current.offsetHeight / 2)
        }
    }, [props.rel])
    if (!props.rel) {
        return <div ref={ref}></div>
    }

    return <div
        ref={ref}
        style={{  height: 0 }}
    >
        <button
            ref={btref}
            style={{
                position: 'relative',
                right: '65px',
                top: top
            }}>+</button>
        <button
            ref={btref}
            style={{
                position: 'relative',
                right: '60px',
                top: top
            }}>::</button>
    </div>
}
