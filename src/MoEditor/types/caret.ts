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

export interface Relative {
  offset: number;
  direction?: "left" | "right";
  softwrap?: boolean;
  index?: number;
}

export class RelativePosition implements Relative {
  offset: number;
  direction?: "left" | "right";
  softwrap?: boolean;
  index?: number;
  constructor(
    offset: number,
    direction?: hdirection,
    softwrap?: boolean,
    index?: number
  ) {
    this.offset = offset;
    this.direction = direction;
    this.softwrap = softwrap;
    this.index = index;
  }

  static create(props: Relative) {
    const { offset, direction, softwrap, index } = props;
    return new RelativePosition(offset, direction, softwrap, index);
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
