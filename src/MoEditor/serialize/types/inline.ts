export interface Attributes {
  className?: string;
  href?: string;
  src?: string;
}

export interface Inline {
  type: "text" | "formatted" | "component";
  kind: string;
}

export interface PlainText {
  type: "text";
  kind: "#text";
  text: string;
}

interface BasicFormattedText extends Inline {
  type: "formatted";
  kind: string;
  text?: string;
  attributes: Attributes;
  children?: InlineElement[];
}

export interface FormattedText extends BasicFormattedText {
  kind: "b" | "i" | "code" | "s" | "del";
}

export interface EmphasizedText extends BasicFormattedText {
  kind: "em";
}

export interface InlineComponent extends Inline {
  type: "component";
  kind: string;
}

export interface Link extends InlineComponent {
  kind: "link" | "a";
}
export interface Image extends InlineComponent {
  kind: "image";
}
export interface Math extends InlineComponent {
  kind: "math" | "formular";
}
export interface Relation extends InlineComponent {
  kind: "relation" | "@";
}
export interface Todo extends InlineComponent {
  kind: "todo";
}

export declare type InlineElement =
  | FormattedText
  | InlineComponent
  | EmphasizedText
  | Link
  | Image
  | Math
  | Relation
  | Todo;
