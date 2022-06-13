import React from "react";
import { CaretPosition } from "../operation";

export interface BlockEvent<T> {
  html: string;
  ref: T; // Block Root HTMLElement
  inner: T;
}

export interface CaretEvent<T> extends BlockEvent<T> {
  offset?: number;
  caret?: CaretPosition;
  direction?: "left" | "right";
}

export interface ComponentUpdatedEvent<T> extends BlockEvent<T> {
  uid: string;
  ref: T;
}

export interface BlockChangeEvent<T> extends BlockEvent<T> {
  type: "paragraph" | "header" | "list" | "enumerate" | "blockquote" | "code";
  level?: number;
  lang?: number;
}

export interface BlockAppendEvent<T> extends BlockEvent<T> {
  type: "paragraph";
  innerHTML: string;
}

export interface KeyboardEvent<T>
  extends React.KeyboardEvent<T>,
    CaretEvent<T> {}

export interface MouseEvent<T> extends React.MouseEvent<T> {
  entered: boolean;
}

// export interface MouseEventHandler<T>
//   extends React.MouseEventHandler<T>,
//     CaretEvent<T> {}
export interface FocusEvent<T> extends React.FocusEvent<T>, BlockEvent<T> {}
export interface SyntheticEvent<T>
  extends React.SyntheticEvent<T>,
    BlockEvent<T> {}
