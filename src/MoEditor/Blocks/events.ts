import React from "react";
import { DefaultBlockData } from "../types";

type UpdateType = "archive" | "create" | "update";

export class UpdateData {
  data: DefaultBlockData;
  type: UpdateType;
  constructor(data: DefaultBlockData, type: UpdateType) {
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

export class MergeEvent {
  direction: "left" | "right";
  block?: DefaultBlockData;
  offset?: number;
}
export interface MergeResult {
  notImplement?: boolean;
  self?: DefaultBlockData; // block on the top
  block?: DefaultBlockData; // block on the bottom
  selfSelection?: boolean; // whether to select 'self' block
  blockSelection?: boolean; // whether to select 'block' block
}

/**
 * list
 *
 */
export class SplitEvent {
  left?: DefaultBlockData;
  right?: DefaultBlockData;
  focus: DefaultBlockData;

  constructor(focus, left, right) {
    this.left = left;
    this.focus = focus; // offset is always 0
    this.right = right;
  }
}
export type MergeEventHandler = (event: MergeEvent) => void;
export type SplitEventHandler = (event: SplitEvent) => void;

export interface DataUpdateEvent {
  block: DefaultBlockData;
}
export type DataUpdateEventHandler = (event: DataUpdateEvent) => void;

export class JumpEvent {
  // focusEvent?: React.FocusEvent;
  type?: "neighbor" | "jump" | "mouse" | "merge";
  from?: "above" | "below";
  offset?: number;
  // is true, will return false if has no neighbor container
  noPropagation?: boolean;
}
export type JumpEventHandler = (event: JumpEvent) => void;

export class CaretChangeEvent {}
export type CaretChangeEventHandler = (event: CaretChangeEvent) => void;
