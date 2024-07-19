import React, { useMemo, useEffect, useState } from "react";
import {
    NodeDataType,
    GantRowProps,
    ThreadType,
    ShowNodeDataType,
    LimitCoordinateType,
    GanttRowType,
} from "../../types/gantt";
import { sortDataList } from "../../utils";
import "./index.less";

// 转换成渲染的节点数据
export const convertToShowNodeList = (dataList: NodeDataType[]) => {
    // 先根据x坐标排序
    const { sortList, undefinedDataList } = sortDataList(dataList, "x");
    // 获取节点与下一节点的距离
    const result: ShowNodeDataType[] = [];
    [...sortList, ...undefinedDataList].forEach((item, index) => {
        const nextItem = sortList[index + 1];
        const nextLineLength = nextItem ? nextItem.x - item.x : 0;
        result.push({ ...item, nextLineLength });
    });
    return result;
};

// 转换后合法
export const limitFn = (
    limit: number | undefined,
    data: number,
    fn: (a: number, b: number) => number
) => {
    if (limit === undefined) return data;
    else if (isNaN(fn(limit, data))) return limit;
    else return fn(limit, data);
};

// 找到数据的边际值
export const findLimitData = (
    dataList: NodeDataType[],
    rowList: GanttRowType[]
) => {
    let minX: number | undefined = undefined;
    let maxX: number | undefined = undefined;
    let minY: number | undefined = undefined;
    let maxY: number | undefined = undefined;
    dataList.forEach((item) => {
        minX = limitFn(minX, item.x, Math.min);
        maxX = limitFn(maxX, item.x, Math.max);
        minY = limitFn(minY, item.y, Math.min);
        maxY = limitFn(maxY, item.y, Math.max);
    });
    const result: NodeDataType[] = [];
    // 整合所有节点数据
    rowList.forEach((row) => {
        result.push(...row.nodeDataList);
    });
    const { sortList: sortResult, undefinedDataList } = sortDataList(
        result,
        "x"
    );
    return {
        minX: minX || 0,
        maxX: maxX || 0,
        minY: minY || 0,
        maxY: maxY || 0,
        tableMinX: sortResult[0]?.x || 0,
        tableMaxX: sortResult[sortResult.length - 1]?.x || 0,
    };
};

// 转换成线程数据
export const convertToThread = (dataList: NodeDataType[]) => {
    // 根据不同的y,先处理成线程数据
    const threadDataList: ThreadType[] = [];
    dataList.forEach((item) => {
        const nodeData: ShowNodeDataType = { ...item, thread: item.y };
        // 根据y值，获取对应的线程
        const thread = threadDataList.find(
            (threadItem) => threadItem.thread === item.y
        );
        if (thread) {
            thread.nodeList.push(nodeData);
        } else {
            // 如果没有找到线程，就新建一个线程
            threadDataList.push({
                thread: item.y,
                nodeList: [nodeData],
                maxThreadX: item.x || 0,
            });
        }
    });
    // 转换成渲染的节点数据
    const result: ThreadType[] = threadDataList.map(
        (threadItem: ThreadType) => {
            threadItem.nodeList = convertToShowNodeList(threadItem.nodeList);
            threadItem.maxThreadX = Math.max(
                ...threadItem.nodeList.map((item) => item.x)
            );
            return threadItem;
        }
    );
    return result;
};

// 甘特图行结构
const GanttRow = (props: GantRowProps) => {
    // 记录x的最小值和最大值，y的最小值和最大值
    const [limitData, setLimitData] = useState<LimitCoordinateType>({
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
        tableMinX: 0,
        tableMaxX: 0,
    });
    // 最大x节点的信息
    const [maxXNode, setMaxXNode] = useState<NodeDataType>();
    // 最小x节点的信息
    const [minXNode, setMinXNode] = useState<NodeDataType>();
    // 渲染的节点数据
    const threadList: ThreadType[] = useMemo(() => {
        // 处理数据
        const result: ThreadType[] = convertToThread(props.dataList);
        return result;
    }, [props.dataList, props.rowList]);
    // 整个GanttRow的长度和高度(不包含溢出的部分)
    const threadArea = useMemo(() => {
        let height: number | undefined = undefined;
        let width: number | undefined =
            limitData.tableMaxX -
            limitData.tableMinX +
            props.confine?.leftConfine +
            props.confine?.rightConfine;
        props.dataList.forEach((item) => {
            height = limitFn(height, item.y, Math.max);
        });
        height = (height || 0) - limitData.minY;
        props.onRowChange?.({
            width,
            height:
                height +
                props.confine?.topConfine +
                props.confine?.bottomConfine,
        });
        return { width, height };
    }, [
        limitData,
        props.confine?.topConfine,
        props.confine?.bottomConfine,
        props.confine?.leftConfine,
        props.confine?.rightConfine,
    ]);

    // 封装节点的渲染
    const nodeRender = (item: ShowNodeDataType, index: number) => {
        return (
            <div
                key={item.id}
                id={`gantt-node-${item.id}`}
                className="node-wrap"
                style={{
                    left: `${
                        item.x -
                        limitData.tableMinX +
                        props.confine?.leftConfine
                    }px`,
                }}
            >
                {/* 节点 */}
                <div className="node" />
                {/* 与下个节点的连线 */}
                <div
                    className="line"
                    style={{
                        width: `${item.nextLineLength}px`,
                        display: item.hideNextLine ? "node" : "inline-block",
                    }}
                />
            </div>
        );
    };

    // 监听最大x节点的变化
    useEffect(() => {
        if (props.dataList.length) {
            const { sortList } = sortDataList(props.dataList, "x");
            setMaxXNode(sortList[sortList.length - 1]);
            setMinXNode(sortList[0]);
        }
    }, [props.dataList]);

    // 找到数据的边际值
    useEffect(() => {
        const limit = findLimitData(props.dataList, props.rowList);
        setLimitData(limit);
    }, [props.dataList, props.rowList]);

    return (
        <>
            {/* 顶部 */}
            {props.headerRender && props.headerRender({ minXNode, maxXNode })}
            <div
                className="gantt-row-content"
                style={{
                    width: threadArea.width || 0,
                    height: threadArea.height || 0,
                    marginTop: `${props.confine?.topConfine}px`,
                    marginBottom: `${props.confine?.bottomConfine}px`,
                }}
            >
                {/* 线程 */}
                {threadList.map((threadRow) => {
                    return props.threadRowRender ? (
                        props.threadRowRender(threadRow)
                    ) : (
                        <div
                            className="thread-row"
                            key={threadRow.thread}
                            style={{
                                top: `${threadRow.thread - limitData.minY}px`,
                                width: threadArea.width || 0,
                            }}
                        >
                            {(threadRow["nodeList"] || []).map(
                                (item, index) => {
                                    return props.nodeRender
                                        ? props.nodeRender({
                                              item,
                                              index,
                                              limitData,
                                              confine: props.confine,
                                              nodeRender,
                                          })
                                        : nodeRender(item, index);
                                }
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default GanttRow;
