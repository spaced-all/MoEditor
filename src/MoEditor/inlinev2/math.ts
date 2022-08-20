import KaTeX from "katex";
import styles from "./math.module.css";
import { ABCInline, ElementProps, ElementState, createElement } from "./abc";
import * as op from "../utils";

export interface MathData {
  math?: string;
}
export interface MathProps extends ElementProps {}
export interface MathState extends ElementState<MathData> {}

function generateHTML(math: string, el) {
  const { errorColor, renderError } = {} as any;
  let html, error;
  try {
    html = KaTeX.renderToString(math, {
      displayMode: false,
      errorColor,
      throwOnError: !!renderError,
    });
    el.innerHTML = html;
  } catch (e) {
    if (error instanceof KaTeX.ParseError || error instanceof TypeError) {
      error = e;
      el.innerHTML = error;
    }
    throw e;
  }
  return { html, error };
}

function expandWidth(render, space) {
  // const render = this.rRef.current÷;
  // const space = this.sRef.current;
  space.textContent = "\u00a0";
  const sw = space.getBoundingClientRect().width;
  const count = Math.round(parseFloat(getComputedStyle(render).width) / sw);
  space.textContent = "\u00a0".repeat(count);
}

export class IMath extends ABCInline<MathProps, MathState, MathData> {
  from: HTMLElement;
  span: HTMLSpanElement;
  space: HTMLSpanElement;
  input: HTMLInputElement;

  constructor(props: MathProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }
  handleClick(e: MouseEvent): void {
    if (this.input.style.display !== "none") {
      return;
    }
    this.input.style.display = "inline";

    const range = document.createRange();
    const mathRoot = this.root.querySelector(".katex-html");
    range.setStart(mathRoot, 0);
    range.setEnd((e as any).path[0] as Node, 0);
    const left = range.cloneContents().textContent;
    this.input.setSelectionRange(left.length, left.length);
  }

  handleInput(e: Event) {
    const val = (e.target as any).value;
    const { html, error } = generateHTML(val, this.span);
    if (error) {
      this.span.innerHTML = error;
    } else {
      this.span.innerHTML = html;
    }
    expandWidth(this.span, this.space);
    e.stopPropagation();
  }
  handleFocus(e: FocusEvent) {
    this.from = e.relatedTarget as HTMLElement;
  }
  handleBlur(e: FocusEvent) {
    if (this.input.value.trim() === "") {
      this.root.remove();
    } else {
      this.math = this.input.value;
      const { html, error } = generateHTML(this.math, this.span);
      if (error) {
        this.span.innerHTML = error;
      } else {
        this.span.innerHTML = html;
      }
      expandWidth(this.span, this.space);
      this.root.setAttribute("data-value", this.math);
      const pos = op.createPosition(this.from, this.root, 0);
      op.setPosition(pos);
    }
    this.input.style.display = "none";
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  public get math(): string {
    return this.state.data.math || "";
  }
  public set math(math: string) {
    this.state.data.math = math;
  }

  componentDidMount(): void {
    expandWidth(this.span, this.space);
  }

  handleMouseDown(e: MouseEvent) {
    e.stopPropagation();
  }
  handleMouseUp(e: MouseEvent) {
    e.stopPropagation();
  }
  handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      generateHTML(this.math, this.span);
      expandWidth(this.span, this.space);
      this.from.focus();
      return;
    }
    e.stopPropagation();
  }
  handleKeyUp(e: KeyboardEvent) {
    e.stopPropagation();
  }
  handleKeyPress(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.from.focus();
      return;
    }
    e.stopPropagation();
  }

  renderInner(): Node[] {
    const nodes: Node[] = [];

    const ipt = createElement("input", {
      className: [styles["input"], styles["input-math"]].join(" "),
    });
    ipt.value = this.math || "";
    ipt.style.display = "none";

    ipt.addEventListener("input", this.handleInput);
    ipt.addEventListener("focus", this.handleFocus);
    ipt.addEventListener("blur", this.handleBlur);
    ipt.addEventListener("mousedown", this.handleMouseDown);
    ipt.addEventListener("mouseup", this.handleMouseUp);
    ipt.addEventListener("keydown", this.handleKeyDown);
    ipt.addEventListener("keyup", this.handleKeyUp);
    ipt.addEventListener("keypress", this.handleKeyPress);

    const span = createElement("span", {
      className: "display-math",
    });
    const space = createElement("span", {
      className: "space-math",
    });

    nodes.push(ipt);
    this.input = ipt;
    nodes.push(span);
    this.span = span;
    nodes.push(space);
    this.space = space;
    return nodes;
  }
}
