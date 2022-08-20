import * as b from "./Blocks";
import { registerManager } from "./register";

export * from "./Page";
export * from "./Blocks";

export { registerManager } from "./register";

// registerManager.create("default_blocks");
// registerManager.create("blocks");
// registerManager.create("bars");

// [
//   b.Paragraph,
//   b.Blockquote,
//   b.Heading,

//   b.List,
//   b.OList,

//   b.Table,

//   b.Code,
// ].forEach((item) => {
//   registerManager.get("default_blocks").put(item.blockName, item);
// });
