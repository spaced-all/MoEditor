import { BlockProps, BlockStates } from "./Common"
import { DefaultBlock } from "./Common"

import { VList } from "./VituralList"

interface ListProps extends BlockProps {
}

interface ListStats extends BlockStates {
}


export class List extends VList<ListProps, ListStats, HTMLUListElement> {
    static defaultProps = DefaultBlock.defaultProps;
    protected get contentEditableName(): string {
        return "ul"
    }
    protected get className(): string {
        return 'unordered-list'
    }
}