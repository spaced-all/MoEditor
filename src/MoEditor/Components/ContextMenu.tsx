import { useEffect } from "react";
import {
    Menu,
    Item,
    Separator,
    Submenu,
    useContextMenu,
    ItemParams
} from "react-contexify";

import "react-contexify/dist/ReactContexify.css";


export default function ContextMenu(props: { menuId: string, showMenu?: boolean }) {
    // 🔥 you can use this hook from everywhere. All you need is the menu id
    const { show, hideAll } = useContextMenu({
        id: props.menuId
    });

    function handleItemClick({ event, props, triggerEvent, data }: ItemParams) {
        console.log(event, props, triggerEvent, data);
    }

    useEffect(() => {
        if (props.showMenu) {
            show(null)
        }
    }, [props.showMenu, show])

    return (
        <Menu id={props.menuId}>
            <Item onClick={handleItemClick}>
                Item 1
            </Item>
            <Item onClick={handleItemClick}>
                Item 2
            </Item>
            <Separator />
            <Item disabled>Disabled</Item>
            <Separator />
            <Submenu label="Submenu">
                <Item onClick={handleItemClick}>
                    Sub Item 1
                </Item>
                <Item onClick={handleItemClick}>Sub Item 2</Item>
            </Submenu>
        </Menu>
    );
}