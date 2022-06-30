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
    textContent?: string;
    children?: ContentItem[];
  }
  
  export interface IndentItem {
    level: number;
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
    icon: string;
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
  
  export interface OrderedListData extends ABCListData<IndentItem> {}
  export interface UnorderedListData extends ABCListData<IndentItem> {}
  export interface TodoData extends ABCListData<TodoItem> {}
  
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
  
  export interface Block {
    id?: number | string;
    order: string;
    archived?: boolean;
    type:
      | "heading"
      | "paragraph"
      | "blockquote"
      | "list"
      | "orderedlist"
      | "todo"
      | "table"
      | "image"
      | "code"
      | "link";
  
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
  