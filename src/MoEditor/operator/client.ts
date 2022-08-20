export interface OperaionResult {
  success: boolean;
  message: Message;
}

export interface ClientOperator {}

export interface ClientOperator {
  blockName: string;
  handleInput(e);
  handleBlur(e);
  handleFocus(e: FocusEvent);
  handleCompositionStart(e: CompositionEvent);
  handleCompositionEnd(e: CompositionEvent);
  handleCompositionUpdate(e: CompositionEvent);
  handleContextMenu(e: MouseEvent);

  handleKeyUp(e: KeyboardEvent);
  defaultHandleKeyup(e: KeyboardEvent);

  defaultHandleDelete(e: KeyboardEvent);
  defaultHandleBackspace(e: KeyboardEvent);
  handleBackspace(e: KeyboardEvent);
  handleDelete(e: KeyboardEvent);
  handleEnter(e: KeyboardEvent);
  handleSpace(e: KeyboardEvent);
  handleInputKeyDown(e: KeyboardEvent);
  handleTab(e: KeyboardEvent);
  handleArrowKeyDown(e: KeyboardEvent);
  defaultHandleKeyDown(e: KeyboardEvent);

  defaultHandleMouseMove(e: MouseEvent);
  defaultHandleMouseLeave(e: MouseEvent);
  handleMouseDown(e: MouseEvent);
  defaultHandleMouseEnter(e: MouseEvent);
  defaultHandleMouseDown(e: MouseEvent);
  defaultHandleMouseUp(e: MouseEvent);
}
