import { BlockProps, BlockStates } from "./Common"
import { DefaultBlock } from "./Common"
import { VList } from "./VituralList"

interface OrderedListProps extends BlockProps {
}

interface OrderedListStats extends BlockStates {
}


export class OrderedList extends VList<OrderedListProps, OrderedListStats, HTMLOListElement> {
    static defaultProps = DefaultBlock.defaultProps;
    protected get contentEditableName(): string {
        return "ol"
    }
    protected get className(): string {
        return 'ordered-list'
    }
    maxIndent: number = 1
}