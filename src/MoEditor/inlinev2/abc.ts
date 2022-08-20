export interface ElementData {}
export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface ElementProps {
  message?: SerializeMessage;
  initialData?: ElementData;
}
export interface ElementState<T> {
  activate?: boolean;
  data: T;
}

export interface Noticable {
  componentDidMount(): void;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props?: {
    className?: string;
    textContent?: string;
    attributes?: { [key: string]: any };
  }
): HTMLElementTagNameMap[K] {
  const { className, textContent, attributes } = props || {};

  const el = document.createElement(tagName);
  if (className) {
    el.className = className;
  }
  if (textContent) {
    el.textContent = textContent;
  }
  if (attributes) {
    for (let key in attributes) {
      const value = attributes[key];
      el.setAttribute(key, value);
    }
  }
  return el;
}

export class ABCInline<P extends ElementProps, S extends ElementState<T>, T>
  implements Noticable
{
  props: P;
  state: S;
  root: HTMLLabelElement;

  static elName: string = null;

  insert() {
    const range = document.getSelection().getRangeAt(0);
    range.insertNode(this.root);
    this.componentDidMount();
  }

  static deserialize(el: HTMLLabelElement) {}

  constructor(props: ElementProps) {
    this.root = null;
    this.props = props as P;
    this.state = {
      activate: false,
      data: props.initialData || {},
    } as S;

    this.handleClick = this.handleClick.bind(this);
    this.render();
  }

  componentDidMount(): void {}

  handleClick(e: MouseEvent) {}

  renderInner(): Node[] {
    return [];
  }

  render(): HTMLLabelElement {
    if (!this.root) {
      const root = document.createElement("label");
      this.root = root;
      root.addEventListener("click", this.handleClick);
      const inner = this.renderInner();
      inner.forEach((c) => {
        this.root.appendChild(c);
      });
    }
    return this.root;
  }

  lazyRender(): [HTMLLabelElement, Noticable] {
    return [this.render(), this];
  }
}
