Low-level

- keyEvent(keydown/keyup/keypress)
- MouseEvent(mousedown/mouseup/click/enter/leave/move)
- FocusEvent(blur/focus)
- InputEvent(copy/paste/insert/delete)
- InlineComponentEvent (HTMLInputElement)

Render

- div -> wrapper -> contenteditable -> (Optional)innerContainer

Block 内部

- Move
- - MoveWithAlt
- - MoveWithShift
- - MoveWithShiftAlt
  * Up
  * Left
  * Right
  * Down
- Edit
- Copy
- Paste

Block 之间

通用

- Merge
- Jump
