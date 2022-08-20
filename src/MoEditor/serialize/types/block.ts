import { InlineElement } from "./inline";

export type BlockId = number | string;
export type BlockUri = string;

export interface Attributes {
  className?: string;
  href?: string;
  src?: string;
}

export interface IndentItem {
  level: number;
  children?: InlineElement[];
  lastEditTime?: number;
}

export interface OrderedIndentItem extends IndentItem {
  marker?: number; // 1.2.3. for first level, a.b.c. for second level, etc.
}

export interface TodoItem extends IndentItem {
  progress?: boolean;
}

export interface InnerBlockData {}

export interface ParagraphData extends InnerBlockData {
  children?: InlineElement[];
}

export interface HeadingData extends InnerBlockData {
  level: number;
  children?: InlineElement[];
}

export interface BlockQuoteData extends InnerBlockData {
  color?: string;
  icon?: string;
  children?: InlineElement[];
}

export interface ABCListData<C extends IndentItem> extends InnerBlockData {
  children?: C[];
}

export interface TableRowItem extends InnerBlockData {
  children: InlineElement[];
  lastEditTime?: number;
}

export interface TableColItem extends InnerBlockData {
  children: TableRowItem[];
  lastEditTime?: number;
}

export interface TableData extends InnerBlockData {
  children: TableColItem[];
}

export type TableDataFrame = TableRowItem[][];

export interface OrderedListData extends ABCListData<OrderedIndentItem> {}

export interface UnorderedListData extends ABCListData<IndentItem> {}

export interface TodoData {
  // 可以和待办事项结合，直接从另一个表取数据
  // 也就是，更新这一个表的时候，要同时考虑更新 todo tabel
  caption?: string;
  children?: TodoItem[];
}

export interface LinkCardData extends InnerBlockData {
  href: string;
  title: string;
  summary: string;
  caption?: InlineElement[];
}

export interface CodeData extends InnerBlockData {
  language?: string;
  highlight?: number | number[]; // 高亮
  code: string[]; // 用换行符分隔，用于高亮
  caption?: InlineElement[];
}

export interface ImageData extends InnerBlockData {
  href: string;
  align: "left" | "center" | "right";
  size: number; // 放缩比例，而不是原始大小
  caption?: InlineElement[];
}


export type BlockTypeName =
  | "heading"
  | "paragraph"
  | "blockquote"
  | "list"
  | "orderedList"
  | "todo"
  | "table"
  | "image"
  | "code"
  | "link"
  | "formular";

export interface DefaultBlock {
  id?: BlockId;
  order: string;
  lastEditTime?: number;
  archived?: boolean;
  type: BlockTypeName;

  heading?: HeadingData;
  paragraph?: ParagraphData;
  blockquote?: BlockQuoteData;

  list?: UnorderedListData;
  orderedList?: OrderedListData;
  todo?: TodoData;

  table?: TableData;

  image?: ImageData;
  code?: CodeData;
  link?: LinkCardData;

  layout?;
}

export type DefaultBlockData = DefaultBlock;

export interface MetaInfo {}
