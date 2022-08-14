import KaTeX from "katex";
import styles from "./Inline.module.css";
import { Noticable } from "./components";
import * as op from "../utils";

export function generateHTML(math: string, el) {
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

export class InlineMath implements Noticable {
  root: HTMLLabelElement;
  span: HTMLSpanElement;
  space: HTMLSpanElement;
  input: HTMLInputElement;
  math: string;
  from: HTMLElement;
  constructor(math) {
    this.math = math;
    const { root, ipt, space, span } = this.create();
    this.root = root;
    this.input = ipt;
    this.space = space;
    this.span = span;
  }

  create() {
    const root = document.createElement("label");
    root.className = styles["unselectable"];
    root.contentEditable = "false";
    root.setAttribute("data-type", "math");
    root.setAttribute("data-value", this.math);
    root.setAttribute("data-key", "value");
    const ipt = document.createElement("input");
    const span = document.createElement("span");
    const space = document.createElement("span");
    space.className = "space-math";
    space.textContent = "-";
    span.classList.add("display-math");

    // span.addEventListener("mouseenter", (e) => {
    //   span.style.backgroundColor = "lightblue";
    // });
    // span.addEventListener("mouseleave", (e) => {
    //   span.style.backgroundColor = "";
    // });
    root.addEventListener("click", (e) => {
      if (ipt.style.display !== "none") {
        return;
      }
      ipt.style.display = "inline";
      // root.insertBefore(ipt, space);

      const range = document.createRange();
      const mathRoot = root.querySelector(".katex-html");
      range.setStart(mathRoot, 0);
      range.setEnd((e as any).path[0] as Node, 0);
      const left = range.cloneContents().textContent;
      ipt.setSelectionRange(left.length, left.length);
    });

    generateHTML(this.math, span);
    ipt.value = this.math;
    ipt.className = [styles["input"], styles["input-math"]].join(" ");
    root.appendChild(ipt);
    ipt.style.display = "none";

    ipt.addEventListener("input", (e) => {
      const val = (e.target as any).value;
      const { html, error } = generateHTML(val, span);
      if (error) {
        span.innerHTML = error;
      } else {
        span.innerHTML = html;
      }
      expandWidth(span, space);
      e.stopPropagation();
    });
    ipt.addEventListener("focus", (e) => {
      console.log(["label focus", e]);
      this.from = e.relatedTarget as HTMLElement;
    });
    ipt.addEventListener("blur", (e) => {
      if (ipt.value.trim() === "") {
        root.remove();
      } else {
        this.math = ipt.value;
        const { html, error } = generateHTML(this.math, span);
        if (error) {
          span.innerHTML = error;
        } else {
          span.innerHTML = html;
        }
        expandWidth(span, space);
        root.setAttribute("data-value", this.math);
        const pos = op.createPosition(this.from, this.root, 0);
        op.setPosition(pos);
      }
      ipt.style.display = "none";
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
    ipt.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    ipt.addEventListener("mouseup", (e) => {
      e.stopPropagation();
    });
    ipt.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        generateHTML(this.math, span);
        expandWidth(span, space);
        this.from.focus();
        return;
      }
      e.stopPropagation();
    });
    ipt.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.from.focus();
        return;
      }
      e.stopPropagation();
    });
    ipt.addEventListener("keyup", (e) => {
      e.stopPropagation();
    });
    root.appendChild(space);
    root.appendChild(span);

    return { root, ipt, space, span };
  }
  componentDidMount(): void {
    expandWidth(this.span, this.space);
  }
}
