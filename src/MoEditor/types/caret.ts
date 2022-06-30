export interface Caret {
  block_id: number;
  startContainer?: Node;
  startOffset?: Node;
  endContainer?: Node;
  endOffset?: Node;
}

export interface OffsetCaret {
  block_id: number;
  start?: number;
  end?: number;
}
