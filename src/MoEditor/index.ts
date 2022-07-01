import * as b from "./Blocks";
import { blockRegistor } from "./plugable";

[b.Paragraph, b.Heading, b.List, b.OList, b.Table].forEach((item) => {
  blockRegistor.regist<any>(item);
});
export * from "./Page";
export * from "./Blocks";
export { blockRegistor } from "./plugable";
