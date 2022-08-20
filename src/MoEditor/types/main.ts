export declare type BlockUri = string;
export declare type InlineUri = string;

export interface Position {
  index: number;
  reversed?: boolean;
}

export interface Range {
  start: Position;
  end?: Position;
}

export interface Location {
  range: Range;
}

export interface InlineOperation {
  kind: string;
  url: BlockUri;
}

export interface TextEdit {
  /**
   * The range of the text document to be manipulated. To insert
   * text into a document create a range where start === end.
   */
  range: Range;
  /**
   * The string to be inserted. For delete operations use an
   * empty string.
   */
  newText: string;
}

export interface TextFormat {
  kind: string;
  range: Range;
}

export interface ComponentEdit {
  position: Position;
  // data: Inline;
}

interface BlockOperation {
  kind: string;
  url: BlockUri;
  // data: Block;
}

export interface CreateBlock extends BlockOperation {
  kind: "create";
}

export interface DeleteBlock extends BlockOperation {
  kind: "delete";
}
export interface SplitBlock extends BlockOperation {
  kind: "split";
}
export interface MergeBlock extends BlockOperation {
  kind: "merge";
}
export interface JumpBlock extends BlockOperation {
  kind: "jump";
}
