import React, { useState, useEffect, forwardRef, useRef } from "react";
import { GanttTableProps, NodeDataType } from "../../types/gantt";
import { sortDataList } from "../../utils";
import GanttRow from "../gantt-row";
import "./index.less";

type PathInfoType = {
    id: string;
    width: number;
    height: number;
    clentX: number;
    clentY: number;
    prevNode: {
        id: React.Key;
        width: number;
        height: number;
        clentX: number;
        clentY: number;
    }[];
};

// 关键路径的粗细
const CriticalPathWidth = 3;

// 甘特图表格组件
const GanttTable = forwardRef((props: GanttTableProps, ref: any) => {
    const { fixedColumnWidth = 0 } = props;
    const divRef = useRef(null);
    // 刷新关键路径
    const [refreshCriticalPath, setRefreshCriticalPath] = useState(0);
    // 最小x值的节点数据
    const [minXNode, setMinXNode] = useState<NodeDataType>();
    // 最大x值的节点数据
    const [maxXNode, setMaxXNode] = useState<NodeDataType>();
    // 甘特图高度map
    const [ganttHeightMap, setGanttHeightMap] = useState<
        Record<string, number>
    >({});
    // 关键路径信息
    const [criticalPathInfo, setCriticalPathInfo] = useState<
        Record<string, PathInfoType>
    >({});

    useEffect(() => {
        const result: NodeDataType[] = [];
        // 整合所有节点数据
        props.rowList.forEach((row) => {
            result.push(...row.nodeDataList);
        });
        const { sortList: sortResult, undefinedDataList } = sortDataList(
            result,
            "x"
        );
        // 寻找最小x值和最大x值的节点
        if (sortResult.length) {
            setMinXNode(sortResult[0]);
            setMaxXNode(sortResult[sortResult.length - 1]);
        }
        if (!props.needDrawCriticalPath) return;
        // 如果存在前置节点，则需要计算关键路径
        [...sortResult, ...undefinedDataList].forEach((item: NodeDataType) => {
            if (item.prevNodeIds?.length) {
                const startNode = document.getElementById(
                    `gantt-node-${item.id}`
                );
                const info: PathInfoType = {
                    id: item.id,
                    width: startNode?.getBoundingClientRect().width || 0,
                    height: startNode?.getBoundingClientRect().height || 0,
                    clentX: startNode?.getBoundingClientRect().left || 0,
                    clentY: startNode?.getBoundingClientRect().top || 0,
                    prevNode: [],
                };
                item.prevNodeIds.forEach((id) => {
                    const node = document.getElementById(`gantt-node-${id}`);
                    if (node) {
                        info.prevNode.push({
                            id,
                            width: node.getBoundingClientRect().width,
                            height: node.getBoundingClientRect().height,
                            clentX: node.getBoundingClientRect().left,
                            clentY: node.getBoundingClientRect().top,
                        });
                    }
                });
                setCriticalPathInfo((pre) => ({
                    ...pre,
                    [item.id]: info,
                }));
            }
        });
    }, [props.rowList, refreshCriticalPath]);

    useEffect(() => {
        // 在组件渲染完成后，将父组件的 ref 添加到子组件的 div 元素上
        if (ref) ref.current = divRef.current;
    }, []);

    return (
        <div
            className={`sa-gantt-table-wrap ${props.tableCalssName || ""}`}
            onScroll={props.onScroll}
            ref={divRef}
        >
            {!props.rowList?.length && <div className="no-data" />}
            {/* 绘制表头 */}
            {props.headerRender &&
                props.headerRender({
                    minXNode,
                    maxXNode,
                })}
            {/* 绘制行 */}
            {props.rowList?.map((row, index) => {
                return (
                    <div className="sa-gantt-row-wrap" key={row.id || index}>
                        {!!fixedColumnWidth && (
                            <div
                                className="gantt-row-label"
                                style={{
                                    height: `${
                                        ganttHeightMap[row.id] || 100
                                    }px`,
                                    width: `${props.fixedColumnWidth}px`,
                                }}
                            >
                                {row.name}
                            </div>
                        )}
                        <GanttRow
                            key={row.id}
                            rowList={props.rowList}
                            confine={props.confine}
                            dataList={row.nodeDataList}
                            nodeRender={row.nodeRender}
                            headerRender={row.headerRender}
                            onRowChange={(parm: {
                                width: number;
                                height: number;
                            }) => {
                                setGanttHeightMap((pre) => ({
                                    ...pre,
                                    [row.id]: parm.height,
                                }));
                                setRefreshCriticalPath((pre) => pre + 1);
                            }}
                        />
                    </div>
                );
            })}
            {/* 绘制关键路径 */}
            {Object.values(criticalPathInfo).map((end) => {
                // 记录表格相对屏幕的位置
                const tableClient = (
                    divRef.current as any
                )?.getBoundingClientRect();
                return end.prevNode.map((start) => {
                    const startLeft =
                        start.clentX - tableClient.left + start.width / 2 - 1; // 奇怪的1px偏移
                    const startTop =
                        start.clentY - tableClient.top + start.height / 2;
                    const endLeft =
                        end.clentX - tableClient.left + end.width / 2 - 1; // 奇怪的1px偏移
                    const endTop =
                        end.clentY - tableClient.top + end.height / 2;
                    const verticalHeight = end.clentY - start.clentY; // 可能是负数(终点在上面的时候)
                    const centerWidth = endLeft - startLeft; // 可能是负数(终点在左边的时候)
                    return (
                        <React.Fragment key={`${start.id}-${end.id}`}>
                            <div
                                className="critical-path-start"
                                style={{
                                    left: startLeft,
                                    top:
                                        verticalHeight > 0
                                            ? startTop
                                            : startTop -
                                              Math.abs(verticalHeight / 2),
                                    height: Math.abs(verticalHeight / 2),
                                    width: CriticalPathWidth,
                                }}
                            />
                            <div
                                className="critical-path-center"
                                style={{
                                    left:
                                        centerWidth > 0
                                            ? startLeft
                                            : startLeft - Math.abs(centerWidth),
                                    top:
                                        startTop + Math.abs(verticalHeight / 2),
                                    width: Math.abs(centerWidth),
                                    height: CriticalPathWidth,
                                    transform: `translateY(${
                                        verticalHeight > 0
                                            ? verticalHeight == 0
                                                ? "-100%"
                                                : "-50%"
                                            : `calc(-50% + ${verticalHeight}px)`
                                    })`,
                                }}
                            />
                            <div
                                className="critical-path-end"
                                style={{
                                    left: endLeft,
                                    top:
                                        verticalHeight > 0
                                            ? endTop -
                                              Math.abs(verticalHeight / 2)
                                            : endTop,
                                    height: Math.abs(verticalHeight / 2),
                                    width: CriticalPathWidth,
                                }}
                            />
                        </React.Fragment>
                    );
                });
            })}
        </div>
    );
});

export default GanttTable;
