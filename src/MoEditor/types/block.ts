export type BlockId = number | string;
export interface ContentItem {
  tagName:
    | "b"
    | "i"
    | "code"
    | "#text"
    | "em"
    | "s"
    | "del"
    | "math"
    | "relation"
    | string;
  attributes?: { [key: string]: string };
  textContent?: string;
  children?: ContentItem[];
}

export interface IndentItem {
  level: number;
  children?: ContentItem[];
}

export interface OrderedIndentItem {
  level: number;
  marker?: number; // 1.2.3. for first level, a.b.c. for second level, etc.
  children?: ContentItem[];
}

export interface TodoItem extends IndentItem {
  progress: boolean;
}

export interface ParagraphData {
  children?: ContentItem[];
}

export interface HeadingData {
  level: number;
  children?: ContentItem[];
}

export interface BlockQuoteData {
  color?: string;
  icon?: string;
  children?: ContentItem[];
}

export interface ABCListData<C> {
  children?: C[];
}

export interface TableRowItem {
  children: ContentItem[];
}

export interface TableColItem {
  children: TableRowItem[];
}

export interface TableData {
  children: TableColItem[];
}
export type TableDataFrame = ContentItem[][][];

export interface OrderedListData extends ABCListData<OrderedIndentItem> {}
export interface UnorderedListData extends ABCListData<IndentItem> {}
export interface TodoData {
  // 可以和待办事项结合，直接从另一个表取数据
  // 也就是，更新这一个表的时候，要同时考虑更新 todo tabel
  caption?: string;
  children?: TodoItem[];
}

export interface LinkCardData {
  href: string;
  title: string;
  summary: string;
  caption?: ContentItem[];
}

export interface CodeData {
  language: string;
  highlight: number | number[]; // 高亮
  code: string[]; // 用换行符分隔，用于高亮
  caption?: ContentItem[];
}

export interface ImageData {
  href: string;
  align: "left" | "center" | "right";
  size: number; // 放缩比例，而不是原始大小
  caption?: ContentItem[];
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
  orderedlist?: OrderedListData;
  todo?: TodoData;

  table?: TableData;

  image?: ImageData;
  code?: CodeData;
  link?: LinkCardData;
}

export type BlockData<T> = T;

export type DefaultBlockData = BlockData<DefaultBlock>;

export interface MetaInfo {}
