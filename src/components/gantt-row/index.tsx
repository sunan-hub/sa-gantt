import React, { useMemo, useLayoutEffect, useState } from 'react';
import { NodeDataType, GantRowProps, ThreadType, ShowNodeDataType } from '@/types/gantt';
import { sortDataList } from '@/utils';
import './index.less';


// 转换成渲染的节点数据
export const convertToShowNodeList = (dataList: NodeDataType[]) => {
    // 先根据x坐标排序
    const sortList = sortDataList(dataList, 'x');
    // 获取节点与下一节点的距离
    const result: ShowNodeDataType[] = [];
    sortList.forEach((item, index) => {
        const nextItem = sortList[index + 1];
        const nextLineLength = nextItem ? nextItem.x - item.x : 0;
        result.push({ ...item, nextLineLength });
    });
    return result;
};

// 转换成线程数据
export const convertToThread = (dataList: NodeDataType[]) => {
    // 根据不同的y,先处理成线程数据
    const threadDataList: any[] = [];
    dataList.forEach((item) => {
        const nodeData: ShowNodeDataType = { ...item, thread: item.y };
        // 根据y值，获取对应的线程
        const thread = threadDataList.find((threadItem) => threadItem.thread === item.y);
        if (thread) {
            thread.nodeList.push(nodeData);
        } else {
            threadDataList.push({
                thread: item.y,
                nodeList: [nodeData],
            });
        }
    });
    // 转换成渲染的节点数据
    const result: ThreadType[] = threadDataList.map((threadItem: ThreadType) => {
        threadItem.nodeList = convertToShowNodeList(threadItem.nodeList);
        threadItem.maxThreadX = Math.max(...threadItem.nodeList.map((item) => item.x));
        return threadItem;
    });
    return result;
};

// 甘特图行结构
const GanttRow = (props: GantRowProps) => {
    // 整个GanttRow的长度和高度
    const threadArea = useMemo(() => {
        let width = 0;
        let height = 0;
        props.dataList.forEach((item) => {
            width = Math.max(width, item.x);
            height = Math.max(height, item.y);
        });
        return { width, height };
    }, [props.dataList]);
    // 渲染的节点数据
    const threadList: ThreadType[] = useMemo(() => {
        // 处理数据
        const result: ThreadType[] = convertToThread(props.dataList);
        return result;
    }, [props.dataList]);

    return <div className='gantt-row-wrap' style={{ width: threadArea.width, height: threadArea.height }}>
        {threadList.map((threadRow) => {
            return props.threadRowRender
                ? props.threadRowRender(threadRow)
                : <div
                    className='thread-row'
                    key={threadRow.thread}
                    style={{
                        top: `${threadRow.thread}px`,
                        height: props.threadHeight,
                        width: threadArea.width
                    }}
                >
                    {(threadRow["nodeList"] || []).map((item) => {
                        return props.nodeRender
                            ? props.nodeRender(item)
                            : <div
                                key={item.key}
                                className='node-wrap'
                                style={{ left: `${item.x}px` }}
                            >
                                {/* 节点 */}
                                <div className='node' />
                                {/* 与下个节点的连线 */}
                                <div
                                    className='line'
                                    style={{
                                        width: `${item.nextLineLength}px`,
                                        display: item.hideNextLine ? 'node' : 'inline-block'
                                    }}
                                />
                            </div>;
                    })}
                </div>;
        })}
    </div>;
};

export default GanttRow;