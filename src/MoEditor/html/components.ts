import "katex/dist/katex.min.css";

export interface ElementProps {
  name: string;
  className?: string;
  event?: string;
  attributes?: { [key: string]: any };
  textContent?: string;
  children?: ElementProps[];
}

export interface Noticable {
  componentDidMount(): void;
}

export class ABCInline implements Noticable {
  componentDidMount() {}
}
