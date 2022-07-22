import React from "react";

export interface Caret {
  block_id: number;
  startContainer?: Node;
  startOffset?: Node;
  endContainer?: Node;
  endOffset?: Node;
}

export interface UserCaret extends Caret {
  user_id: number;
  username: string;
}

export interface OffsetCaret {
  // block_id: number;
  start?: number;
  end?: number;
}

export type hdirection = "left" | "right";
export type vdirection = "up" | "down";

export interface TargetPosition {
  offset?: number;
  type?: "mouse" | "keyboard" | "touch" | "merge" | "split";
  // native?: React.KeyboardEvent | React.MouseEvent | KeyboardEvent | MouseEvent;
  direction?: vdirection | hdirection;
  softwrap?: boolean;
  index?: number;
}

export class RelativePosition implements TargetPosition {
  offset: number;
  softwrap?: boolean;
  index?: number;
  constructor(offset: number, softwrap?: boolean, index?: number) {
    this.offset = offset;
    this.softwrap = softwrap;
    this.index = index;
  }

  static create(props: TargetPosition) {
    const { offset, softwrap, index } = props;
    return new RelativePosition(offset, softwrap, index);
  }
}

export class Position {
  container: Node;
  offset: number;
  root?: Node;
  constructor(container: Node, offset: number, root?: Node) {
    this.container = container;
    this.offset = offset;
    this.root = root;
  }
}
