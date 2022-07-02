import React from "react";
import { Block } from "../types";

type UpdateType = "archive" | "create" | "update";

export class UpdateData {
  data: Block;
  type: UpdateType;
  constructor(data: Block, type: UpdateType) {
    this.data = data;
    this.type = type;
  }
}

export class BlockUpdateEvent {
  data: UpdateData[];
  constructor() {
    this.data = [];
  }
  append(item: UpdateData) {
    this.data.push(item);
  }
}
export type BlockUpdateEventHandler = (event: BlockUpdateEvent) => void;

export class MergeEvent {}
export class SplitEvent {}
export type MergeEventHandler = (event: MergeEvent) => void;
export type SplitEventHandler = (event: SplitEvent) => void;

export class JumpEvent {
  // focusEvent?: React.FocusEvent;
  type?: "neighbor" | "jump" | "mouse";
  from?: "above" | "below";
  offset?: number;
}
export type JumpEventHandler = (event: JumpEvent) => void;

export class CaretChangeEvent {}
export type CaretChangeEventHandler = (event: CaretChangeEvent) => void;
