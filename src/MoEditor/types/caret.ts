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
  block_id: number;
  start?: number;
  end?: number;
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
