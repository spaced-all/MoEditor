import React from "react";
import { DefaultBlockData } from "../types";
import { MergeResult } from "./events";

export interface IterContainer<E extends HTMLElement> {
  firstContainer(): E;
  lastContainer(): E;

  previousContainer(el?: E): E; // column to row
  nextContainer(el?: E): E;

  previousRowContainer(el?: E): E;
  nextRowContainer(el?: E): E;

  getContainerByIndex(...index: number[]): E;
}

export interface ReactEventHandler {
  //   handleCaretMove(e: Position);
  //   handleOuterEvent(event);
  //   handleContextResponse(e);
  //   tryHandleShortType(e: React.KeyboardEvent);
  //   handleSelect(e);
  //   handleDataChange(e);
  //   handleCopy(e: React.KeyboardEvent);
  //   handlePaste(e: React.KeyboardEvent);

  handleInput(e);
  handleBlur(e);
  handleFocus(e: React.FocusEvent);
  handleCompositionStart(e: React.CompositionEvent);
  handleCompositionEnd(e: React.CompositionEvent);
  handleCompositionUpdate(e: React.CompositionEvent);
  handleContextMenu(e: React.MouseEvent);

  handleKeyUp(e: React.KeyboardEvent);
  defaultHandleKeyup(e: React.KeyboardEvent);

  defaultHandleDelete(e: React.KeyboardEvent);
  defaultHandleBackspace(e: React.KeyboardEvent);
  handleBackspace(e: React.KeyboardEvent);
  handleDelete(e: React.KeyboardEvent);
  handleEnter(e: React.KeyboardEvent);
  handleSpace(e: React.KeyboardEvent);
  handleInputKeyDown(e: React.KeyboardEvent);
  handleTab(e: React.KeyboardEvent);
  handleArrowKeyDown(e: React.KeyboardEvent);
  defaultHandleKeyDown(e: React.KeyboardEvent);

  defaultHandleMouseMove(e: React.MouseEvent);
  defaultHandleMouseLeave(e: React.MouseEvent);
  handleMouseDown(e: React.MouseEvent);
  defaultHandleMouseEnter(e: React.MouseEvent);
  defaultHandleMouseDown(e: React.MouseEvent);
  defaultHandleMouseUp(e: React.MouseEvent);
}

export interface BlockComponentStatic<E extends HTMLElement> {
  new (props: any): BlockComponent<E>;
  blockName: string;
  merge(self: DefaultBlockData, block: DefaultBlockData): MergeResult;
}

export interface BlockComponent<E extends HTMLElement>
  extends IterContainer<E>,
    ReactEventHandler {}
