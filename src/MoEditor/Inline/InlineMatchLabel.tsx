import React from 'react';
import { InlineMath } from "./MathComponent"

function InlineMathLabel(props: { math: string }) {
    const [val, setVal] = React.useState(props.math)
    const ipt = <input
        className="data-source"
        onFocus={(e) => {
            e.target.setSelectionRange(0, 0)

        }}
        value={val}
        onKeyDown={(e) => {
            const target = e.target as HTMLInputElement
            if (e.key !== 'Enter') {
                e.stopPropagation()
                if (e.key === 'End') {
                    target.setSelectionRange(target.value.length, target.value.length)
                    e.preventDefault()
                } else if (e.key === 'Home') {
                    target.setSelectionRange(0, 0)
                    e.preventDefault()
                } else if (e.key === 'Backspace') {
                    const tgt = e.target as HTMLInputElement
                    tgt.parentElement.remove()
                    tgt.blur()
                    e.preventDefault()
                }
            } else {
                e.preventDefault()
            }

            // (e.target as HTMLInputElement).blur()
        }}
        onKeyUp={e => { e.stopPropagation() }}
        onChange={(e) => setVal(e.target.value)}></input>
    return (
        <>
            {ipt}
            <data
                data-type={'math'}
                data-content={val}
            ></data>
            <InlineMath math={val} />
        </>
    );
}

export default InlineMathLabel;
