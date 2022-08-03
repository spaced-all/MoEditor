import React, { useEffect, useLayoutEffect } from "react";
import { useFloating } from '@floating-ui/react-dom';

interface PositionProps {
    block?: boolean
    children: React.ReactNode
    related: React.RefObject<HTMLElement>
    style?: React.CSSProperties
    placement?: string
    xOffset?: number
    yOffset?: number
    offset?: any
}

export default function Position(props: PositionProps) {
    const { block, children, placement, xOffset, yOffset, offset } = props
    const { x, y, reference, floating, strategy, update } = useFloating({
        'placement': placement as any
    });

    React.useEffect(() => {
        update()
    }, [offset])

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

    useLayoutEffect(() => {
        reference(props.related.current)
    }, [props.related])

    if (props.block) {
        return <div ref={floating} style={style}>{children}</div>
    } else {

        return <span ref={floating} style={style}>{children}</span>
    }
}
