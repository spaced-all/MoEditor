import React from "react";
import { ContentItem, DefaultBlockData, TargetPosition } from "../types";

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
  relative?: TargetPosition;
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

export interface Checkpoint {
  type: "block" | "operation" | "input" | "inputComponent";
  input?: {
    type: "insert" | "delete";
    index: number;
    offset: number;
    data: string;
  };
  inputComponent?: {
    type: "insert" | "delete";
    index: number;
    offset: number;
    data: ContentItem[];
  };
  operation?: {
    type: string;
    name: string;
  };
  block?: DefaultBlockData;
  time: number;
}

export interface CheckpointEvent {
  data: Checkpoint;
}

export type DataUpdateEventHandler = (event: DataUpdateEvent) => void;
export type CheckpointEventHandler = (event: CheckpointEvent) => void;

export class JumpEvent {
  // focusEvent?: React.FocusEvent;
  type?: "neighbor" | "jump" | "mouse" | "merge";
  from?: "above" | "below";
  offset?: number;
  // is true, will return false if has no neighbor container
  noPropagation?: boolean;

  relative?: TargetPosition;
}
export type JumpEventHandler = (event: JumpEvent) => void;

export class CaretChangeEvent {}
export type CaretChangeEventHandler = (event: CaretChangeEvent) => void;

export interface ContextMenuEvent {
  key: string;
  callback: (data: any) => void;
}

export class SlashContextMenuEvent implements ContextMenuEvent {
  key: string;
  callback: (data: any) => void;
  constructor(props: ContextMenuEvent) {
    this.callback = props.callback;
    this.key = props.key;
  }
}
export type ContextMenuEventHandler = (event: ContextMenuEvent) => void;
