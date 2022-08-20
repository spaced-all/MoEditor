import { registerManager } from "../register"
import { Paragraph } from "./Paragraph"
import { Heading } from "./Heading"
import { List } from "./List"
import { OList } from "./OrderedList"
import { Table } from "./Table"
import { Blockquote } from "./Blockquote"
import { Code } from "./Code"
import { BlockComponent, BlockComponentStatic as BlockComponentClass } from "./types"

export { Paragraph } from "./Paragraph"
export { Heading } from "./Heading"
export { List } from "./List"
export { OList } from "./OrderedList"
export { Table } from "./Table"
export { Blockquote } from "./Blockquote"
export { Code } from "./Code"





export const blockRegister = registerManager.create<BlockComponentClass<any>>("blocks");

[
    Paragraph,
    Blockquote,
    Heading,

    List,
    OList,

    Table,

    Code,
].forEach((item) => {
    blockRegister.put(item.blockName, item);
});
