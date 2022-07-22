/**
 * make Block / inlineElement plugable.
 *
 * All Block and inlineElement should be registed here.
 */

import { DefaultBlockData, BlockTypeName } from "./types";
import { ABCBlock, ABCBlockType } from "./Blocks/ABCBlock";

class BlockRegistor {
  types: { [key: string | BlockTypeName]: typeof ABCBlock };
  static _instance = null;
  constructor() {
    if (BlockRegistor._instance) {
      return BlockRegistor._instance;
    }
    BlockRegistor._instance = this;
    this.types = {};
  }
  regist<T extends typeof ABCBlock>(block: T) {
    this.types[block.blockName] = block;
  }
  createType(blockType: string | BlockTypeName) {
    let res = this.types[blockType];
    if (!res) {
      res = this.types["default"];
    }
    return res;
  }
}

export const blockRegistor = new BlockRegistor();
