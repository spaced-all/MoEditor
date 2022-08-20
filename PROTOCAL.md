# 设计用于文档编辑的协议

```
client<Edit> -> handler -> operator -> view + message -> server<Update> + history<Push message>

undo/redo -> history<Pop message> -> message -> operator -> view

server<Edit> -> message -> operator -> view
```

需要两个 Operator，能够分别执行来自键盘鼠标的命令和来自 jsonrpc 的命令。
