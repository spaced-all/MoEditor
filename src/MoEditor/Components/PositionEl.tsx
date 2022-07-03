import React, { useEffect, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { useFloating } from '@floating-ui/react-dom';

interface PositionProps {
    block?: boolean
    children: React.ReactNode
    tagName: string
    related: React.ReactNode
    style?: React.CSSProperties
    placement?: string
    xOffset?: number
    yOffset?: number
}

export default function PositionEl(props: PositionProps) {
    const { block, children, placement, xOffset, yOffset } = props
    const { x, y, reference, floating, strategy, update } = useFloating({
        'placement': placement as any
    });

    const style = {
        position: strategy,
        top: y + (yOffset || 0) ?? 0,
        left: x + (xOffset || 0) ?? 0,
        'zIndex': 1000,
        paddingBottom: '0.2em',
        paddingRight: '0.2em',
        paddingLeft: '0.2em',

        ...props.style
    }

    let floatingEl;
    if (props.block) {
        floatingEl = <div ref={floating} style={style}>{children}</div>
    } else {
        floatingEl = <span ref={floating} style={style}>{children}</span>
    }

    return <>
        {React.createElement(props.tagName, { ref: reference }, props.related)}

        {ReactDOM.createPortal(floatingEl, document.body)}

    </>
}
