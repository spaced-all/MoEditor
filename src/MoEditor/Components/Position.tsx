import React, { useEffect, useLayoutEffect } from "react";
import { useFloating } from '@floating-ui/react-dom';

interface PositionProps {
    block: boolean
    children: React.ReactNode
    related: React.RefObject<HTMLElement>
    style?: React.CSSProperties
}

export default function Position(props: PositionProps) {
    const { block, children } = props
    const { x, y, reference, floating, strategy, update } = useFloating();

    const style = {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        'zIndex': 1000,
        paddingBottom: '0.2em',
        paddingRight: '0.2em',
        paddingLeft: '0.2em',
        boxShadow: "0px 2.7px 0.4px rgba(0, 0, 0, 0.066),0px 4.6px 1.3px rgba(0, 0, 0, 0.085),0px 6px 6px rgba(0, 0, 0, 0.1)",
        ...props.style
    }

    useLayoutEffect(() => {
        reference(props.related.current)
    }, [props.related])

    if (props.block) {
        return <div ref={floating} style={style}>{children}</div>
    } else {

        return <span ref={floating} style={style}>{children}</span>
    }
}
