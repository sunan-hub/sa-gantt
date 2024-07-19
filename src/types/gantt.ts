// 甘特图表格数据类型
export type GanttTableProps = {
    ganttRef?: React.RefObject<HTMLDivElement>;
    fixedColumnWidth?: number; // 固定列宽度
    confine: ConfineType; // 边界值默认0(使得甘特图的有一定的空隙)
    tableCalssName?: string; // 甘特图类名
    needDrawCriticalPath?: boolean; // 是否需要绘制关键路径（需要绘制，则节点ID必须是`gantt-node-${node.id}`）
    rowList: GanttRowType[];
    headerRender?: (parm: GantHeaderProps) => React.ReactNode; // 自定义顶部渲染函数
    onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void; // 滚动事件
};

export type GanttRowType = {
    id: string; // 行id
    name: string; // 行标题
    nodeDataList: NodeDataType[]; // 节点数据
    nodeRender?: (
        parm: NodeRenderProps & {
            nodeRender: (
                nodeData: ShowNodeDataType,
                index: number
            ) => React.ReactNode;
        }
    ) => React.ReactNode; // 自定义节点渲染函数
    headerRender?: (parm: GantHeaderProps) => React.ReactNode; // 自定义顶部渲染函数
};

// 甘特图行数据类型
export type GantRowProps = {
    confine: ConfineType; // 边界值默认0(使得甘特图的有一定的空隙)
    dataList: NodeDataType[];
    rowClassName?: string; // 行类名
    rowList: GanttRowType[];
    headerRender?: (parm: GantHeaderProps) => React.ReactNode; // 自定义顶部渲染函数
    nodeRender?: (
        parm: NodeRenderProps & {
            nodeRender: (
                nodeData: ShowNodeDataType,
                index: number
            ) => React.ReactNode;
        }
    ) => React.ReactNode; // 自定义节点渲染函数
    threadRowRender?: (threadRowData: ThreadType) => React.ReactNode; // 自定义线程行渲染函数
    onRowChange?: (parm: { width: number; height: number }) => void;
};

// 边界值类型
export type ConfineType = {
    leftConfine: number;
    rightConfine: number;
    topConfine: number;
    bottomConfine: number;
};

// 甘特图头部入参
export type GantHeaderProps = {
    minXNode?: NodeDataType; // 最小x坐标的信息
    maxXNode?: NodeDataType; // 最大x坐标的信息
};

// 节点数据类型
export type NodeDataType = {
    id: string;
    x: number;
    y: number;
    prevNodeIds?: React.Key[]; // 前置节点
};

// 线程数据类型
export type ThreadType = {
    thread: number; // 所在的线程
    maxThreadX: number; // 线程最大x坐标
    nodeList: ShowNodeDataType[]; // 节点列表
    name?: string; // 线程名称
};

// 要选染的节点数据类型
export type ShowNodeDataType = NodeDataType & {
    thread: number; // 所在的线程
    hideNextLine?: boolean; // 是否隐藏和下一个节点的连线
    nextLineLength?: number; // 和下一个节点的连线长度
};

// 极限坐标类型
export type LimitCoordinateType = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    tableMinX: number;
    tableMaxX: number;
};

// 节点渲染入参
export type NodeRenderProps = {
    item: ShowNodeDataType;
    index: number;
    limitData: LimitCoordinateType;
    confine: ConfineType;
};
