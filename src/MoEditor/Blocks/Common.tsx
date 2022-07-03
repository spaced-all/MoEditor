import React from "react";

export function serialize() {

}


export function renderContent() {

}

export function ContentEditable<T>(props: {
    tagName: string;
    className?: string;
    children: React.ReactNode;
    innerRef?: React.RefObject<T>;
    contentEditable: boolean;
    placeholder?: string;
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
            tabIndex: -1,
            onCopy: props.onCopy,
            onPaste: props.onPaste,
            onMouseMove: props.onMouseMove,
            onMouseEnter: props.onMouseEnter,
            onMouseLeave: props.onMouseLeave,
            onMouseDown: props.onMouseDown,
            onMouseUp: props.onMouseUp,
            onContextMenu: props.onContextMenu,
            suppressContentEditableWarning: true,
        },
        props.children
    );
}




