import { Page } from "MoEditor";

function App() {
    const [data, setData] = React.useState([])
    React.useEffect(() => {
        setData([{}, {}])
    }, [])


    return <Page data={data}></Page>
}


function LazyLoad() {
    const [data, setData] = React.useState([])
    const [ids, setIds] = React.useState([])
    React.useEffect(() => {
        setData([{}, {}])
    }, [])


    return <Page
        supportBlock={['paragraph', 'blockquote']}

        ids={async () => {
            // get block id list of this document
        }}
        block={async (id) => {
            // get block data by id
        }}
        blocks={async () => {
            // get blocks of this document
        }}
        update={async (id, block) => {
            // update block by 
        }}
        updates={async (blocks) => {
            // block data 中 archive = True 表示删除
            // 没有 id 那就是新建
            // 其余为更改
            // 后端建议把删除用额外的 archive 标识，便于撤销操作
        }}
    >
    </Page>
}
