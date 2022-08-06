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

export interface TargetRange {
  start?: TargetPosition;
  end?: TargetPosition;
}

/**
 * 当前光标情况下，做出某些操作后下一个时刻的光标位置
 * 包括 Block 之间的光标转移和 Block 内部的光标转移
 * 一般由键盘事件触发
 * 在一些情况下会包含 range（选中范围），如 List 的 indent 改变
 */
export interface TargetPosition {
  offset?: number;
  type?: "mouse" | "keyboard" | "touch" | "merge" | "split";

  // native?: React.KeyboardEvent | React.MouseEvent | KeyboardEvent | MouseEvent;
  direction?: vdirection | hdirection;
  softwrap?: boolean;
  index?: number;
  indexDelta?: number;

  range?: TargetRange;
  isRange?: boolean;
  stopPropagation?: boolean;
}

// export class RelativePosition implements TargetPosition {
//   offset: number;
//   softwrap?: boolean;
//   index?: number;
//   constructor(offset: number, softwrap?: boolean, index?: number) {
//     this.offset = offset;
//     this.softwrap = softwrap;
//     this.index = index;
//   }

//   static create(props: TargetPosition) {
//     const { offset, softwrap, index } = props;
//     return new RelativePosition(offset, softwrap, index);
//   }
// }

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
