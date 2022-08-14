import React from "react";

/**
 * 给 Table 提示增删加减列的
 */
export class TableTool extends React.Component {

    render(): React.ReactNode {
        return <div>
            <button>{"->|"}</button>
            <button>{"|-<"}</button>
            <button>{"↑"}</button>
            <button>{"↓"}</button>
        </div>
    }

}