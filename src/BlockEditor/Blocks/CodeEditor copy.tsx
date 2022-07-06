/* global */

import * as React from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & {
    // Props for the component
    value: string;
    onValueChange: (value: string) => void;
    highlight: (value: string) => string | React.ReactNode;
    tabSize: number;
    insertSpaces: boolean;
    ignoreTabKey: boolean;
    padding: number | string;
    style?: React.CSSProperties;

    // Props for the textarea
    textareaId?: string;
    textareaClassName?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    form?: string;
    maxLength?: number;
    minLength?: number;
    name?: string;
    placeholder?: string;
    readOnly?: boolean;
    required?: boolean;
    onClick?: React.MouseEventHandler<HTMLTextAreaElement>;
    onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
    onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;

    // Props for the hightlighted code’s pre element
    preClassName?: string;
};

type State = {
    capture: boolean;
};

type Record = {
    value: string;
    selectionStart: number;
    selectionEnd: number;
};

type History = {
    stack: (Record & { timestamp: number })[];
    offset: number;
};

const KEYCODE_ENTER = 13;
const KEYCODE_TAB = 9;
const KEYCODE_BACKSPACE = 8;
const KEYCODE_Y = 89;
const KEYCODE_Z = 90;
const KEYCODE_M = 77;
const KEYCODE_PARENS = 57;
const KEYCODE_BRACKETS = 219;
const KEYCODE_QUOTE = 222;
const KEYCODE_BACK_QUOTE = 192;
const KEYCODE_ESCAPE = 27;

const HISTORY_LIMIT = 100;
const HISTORY_TIME_GAP = 3000;

const isWindows = 'navigator' in global && /Win/i.test(navigator.platform);
const isMacLike =
    'navigator' in global && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

const className = 'npm__react-simple-code-editor__textarea';

const cssText = /* CSS */ `
/**
 * Reset the text fill color so that placeholder is visible
 */
.${className}:empty {
  -webkit-text-fill-color: inherit !important;
}

/**
 * Hack to apply on some CSS on IE10 and IE11
 */
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  /**
    * IE doesn't support '-webkit-text-fill-color'
    * So we use 'color: transparent' to make the text transparent on IE
    * Unlike other browsers, it doesn't affect caret color in IE
    */
  .${className} {
    color: transparent !important;
  }

  .${className}::selection {
    background-color: #accef7 !important;
    color: transparent !important;
  }
}
`;

export default class Editor extends React.Component<Props, State> {
    static defaultProps = {
        tabSize: 2,
        insertSpaces: true,
        ignoreTabKey: false,
        padding: 0,
    };

    state = {
        capture: true,
    };

    componentDidMount() {
        this._recordCurrentState();
    }

    private _recordCurrentState = () => {
        const input = this._input;

        if (!input) return;

        // Save current state of the input
        const { value, selectionStart, selectionEnd } = input;

        this._recordChange({
            value,
            selectionStart,
            selectionEnd,
        });
    };

    private _getLines = (text: string, position: number) =>
        text.substring(0, position).split('\n');

    private _recordChange = (record: Record, overwrite: boolean = false) => {
        const { stack, offset } = this._history;

        if (stack.length && offset > -1) {
            // When something updates, drop the redo operations
            this._history.stack = stack.slice(0, offset + 1);

            // Limit the number of operations to 100
            const count = this._history.stack.length;

            if (count > HISTORY_LIMIT) {
                const extras = count - HISTORY_LIMIT;

                this._history.stack = stack.slice(extras, count);
                this._history.offset = Math.max(this._history.offset - extras, 0);
            }
        }

        const timestamp = Date.now();

        if (overwrite) {
            const last = this._history.stack[this._history.offset];

            if (last && timestamp - last.timestamp < HISTORY_TIME_GAP) {
                // A previous entry exists and was in short interval

                // Match the last word in the line
                const re = /[^a-z0-9]([a-z0-9]+)$/i;

                // Get the previous line
                const previous = this._getLines(last.value, last.selectionStart)
                    .pop()
                    ?.match(re);

                // Get the current line
                const current = this._getLines(record.value, record.selectionStart)
                    .pop()
                    ?.match(re);

                if (previous?.[1] && current?.[1]?.startsWith(previous[1])) {
                    // The last word of the previous line and current line match
                    // Overwrite previous entry so that undo will remove whole word
                    this._history.stack[this._history.offset] = { ...record, timestamp };

                    return;
                }
            }
        }

        // Add the new operation to the stack
        this._history.stack.push({ ...record, timestamp });
        this._history.offset++;
    };

    private _history: History = {
        stack: [],
        offset: -1,
    };

    private _input: HTMLTextAreaElement | null = null;

    get session() {
        return {
            history: this._history,
        };
    }

    set session(session: { history: History }) {
        this._history = session.history;
    }

    render() {
        const {
            value,
            style,
            padding,
            highlight,
            textareaId,
            textareaClassName,
            autoFocus,
            disabled,
            form,
            maxLength,
            minLength,
            name,
            placeholder,
            readOnly,
            required,
            onClick,
            onFocus,
            onBlur,
            onKeyUp,
            /* eslint-disable @typescript-eslint/no-unused-vars */
            onKeyDown,
            onValueChange,
            tabSize,
            insertSpaces,
            ignoreTabKey,
            /* eslint-enable @typescript-eslint/no-unused-vars */
            preClassName,
            ...rest
        } = this.props;

        const contentStyle = {
            paddingTop: padding,
            paddingRight: padding,
            paddingBottom: padding,
            paddingLeft: padding,
        };

        const highlighted = highlight(value);

        return (
            <div {...rest} style={{ ...styles.container, ...style }}>
                <textarea
                    ref={(c) => (this._input = c)}
                    style={{
                        ...styles.editor,
                        ...styles.textarea,
                        ...contentStyle,
                    }}
                    className={
                        className + (textareaClassName ? ` ${textareaClassName}` : '')
                    }
                    id={textareaId}
                    value={value}
                    // onChange={this._handleChange}
                    // onKeyDown={this._handleKeyDown}
                    onClick={onClick}
                    onKeyUp={onKeyUp}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disabled={disabled}
                    form={form}
                    maxLength={maxLength}
                    minLength={minLength}
                    name={name}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    required={required}
                    autoFocus={autoFocus}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    data-gramm={false}
                />
                <pre
                    className={preClassName}
                    aria-hidden="true"
                    style={{ ...styles.editor, ...styles.highlight, ...contentStyle }}
                    {...(typeof highlighted === 'string'
                        ? { dangerouslySetInnerHTML: { __html: highlighted + '<br />' } }
                        : { children: highlighted })}
                />
                {/* eslint-disable-next-line react/no-danger */}
                <style type="text/css" dangerouslySetInnerHTML={{ __html: cssText }} />
            </div>
        );
    }
}

const styles = {
    container: {
        position: 'relative',
        textAlign: 'left',
        boxSizing: 'border-box',
        padding: 0,
        overflow: 'hidden',
    },
    textarea: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        resize: 'none',
        color: 'inherit',
        overflow: 'hidden',
        MozOsxFontSmoothing: 'grayscale',
        WebkitFontSmoothing: 'antialiased',
        WebkitTextFillColor: 'transparent',
    },
    highlight: {
        position: 'relative',
        pointerEvents: 'none',
    },
    editor: {
        margin: 0,
        border: 0,
        background: 'none',
        boxSizing: 'inherit',
        display: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontStyle: 'inherit',
        fontVariantLigatures: 'inherit',
        fontWeight: 'inherit',
        letterSpacing: 'inherit',
        lineHeight: 'inherit',
        tabSize: 'inherit',
        textIndent: 'inherit',
        textRendering: 'inherit',
        textTransform: 'inherit',
        whiteSpace: 'pre-wrap',
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
    },
} as const;