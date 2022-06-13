import React from "react";
import { CaretPosition } from "../operation";
import { CaretEvent } from "./eventtype";

export class BlockCaretEvent<T> implements CaretEvent<T> {
  caret?: CaretPosition;
  html: string;
  ref: T;
  direction?: "left" | "right";
  constructor(
    html: string,
    ref: T,
    caret?: CaretPosition,
    direction?: "left" | "right"
  ) {
    this.html = html;
    this.ref = ref;
    this.caret = caret;
    this.direction = direction;
    // this.offset = null;
  }
  inner: T;
  offset?: number;
}
