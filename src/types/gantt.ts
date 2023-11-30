// 甘特图行数据类型
export type GantRowProps = {
    dataList: NodeDataType[];
    threadHeight?: number; // 线程高度
    nodeRender?: (nodeData: NodeDataType) => React.ReactNode; // 自定义节点渲染函数
    threadRowRender?: (threadRowData: ThreadType) => React.ReactNode; // 自定义线程行渲染函数
};

// 节点数据类型
export type NodeDataType = {
    key: string;
    x: number;
    y: number;
}

// 线程数据类型
export type ThreadType = {
    thread: number; // 所在的线程
    maxThreadX: number; // 线程最大x坐标
    nodeList: ShowNodeDataType[]; // 节点列表
};

// 要选染的节点数据类型
export type ShowNodeDataType = NodeDataType & {
    thread: number; // 所在的线程
    hideNextLine?: boolean; // 是否隐藏和下一个节点的连线
    nextLineLength?: number; // 和下一个节点的连线长度
};
