import React, { useEffect, useMemo, useRef, useState } from "react";
import GanttTable from "../../components/gantt-table";
import GanttRow from "../../components/gantt-row";
import {
    ConfineType,
    GantHeaderProps,
    GanttRowType,
    ShowNodeDataType,
    NodeRenderProps,
} from "../../types/gantt";
import { getMonthDays } from "../../utils";
import { useThrottle, useDebounce } from "../../hooks";
import { RowDataList } from "./data";
import moment from "moment";
import "./index.less";

// 固定列宽度
const FixedColumnWidth = 180;
// 一天的宽度
const DayWidth = 3;
// 前后空隙几个月
const MonthSpace = 2;

// 状态映射
const StatusMap = {
    "Not started": {
        text: "未开始",
        color: "rgb(179 184 187)",
        className: "not-started",
    },
    "In Progress": {
        text: "进行中",
        color: "rgb(255 168 16)",
        className: "in-progress",
    },
    Finished: {
        text: "已完成",
        color: "rgb(216, 242, 213)",
        className: "finished",
    },
};

export type WorkflowNodeType = {
    id: string;
    name: string;
};

// 日期格式化成字符串
export const dateFormat = (date: Date | number | string) => {
    return moment(date).format("YYYY.MM.DD");
};

const Home = () => {
    // 表格ref
    const tableRef = useRef<HTMLDivElement>(null);
    // 边界值使得甘特图的边界有一定的空隙
    const [confine, setConfine] = useState<ConfineType>({
        leftConfine: 0,
        rightConfine: 0,
        topConfine: 80,
        bottomConfine: 80,
    });
    // 计划完成时间字段的key
    const [finishTime, setfinishTime] = useState<string>("finish_time");
    // 状态字段的key
    const [statusKey, setStatusKey] = useState<string>("status");
    // 是否为里程碑的key
    const [isMilestoneKey, setIsMilestoneKey] =
        useState<string>("is_milestone");
    // 最小日期的时间戳
    const [minDateTimestamp, setMinDateTimestamp] = useState<number>();
    // 甘特图行数据
    const [ganttRowData, setGanttRowData] = useState<GanttRowType[]>([]);
    // 当前显示的日期时间戳
    const [viewDateTimestamp, setViewDateTimestamp] = useState<number>();
    // 加载中
    const [loading, setLoading] = useState<boolean>(false);

    // 头部展示的渲染
    const headerRender = (data: GantHeaderProps) => {
        const minXNode = data.minXNode as ShowNodeDataType;
        const maxXNode = data.maxXNode as ShowNodeDataType;
        if (!maxXNode || !minXNode) return null;
        // 最小的时间前面加MonthSpace个月
        const minDate = moment(minXNode[finishTime]).subtract(
            MonthSpace,
            "months"
        );
        // 最大的时间后面加MonthSpace个月
        const maxDate = moment(maxXNode[finishTime]).add(MonthSpace, "months");
        // 将日期生成树形结构
        const dateTree = {};
        for (let i = minDate.year(); i <= maxDate.year(); i++) {
            if (i !== minDate.year() && i !== maxDate.year())
                dateTree[i] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            else if (i === minDate.year()) {
                dateTree[i] = [];
                for (let j = minDate.month() + 1; j <= 12; j++) {
                    dateTree[i].push(j);
                }
            } else if (i === maxDate.year()) {
                dateTree[i] = [];
                for (let j = 1; j <= maxDate.month() + 1; j++) {
                    dateTree[i].push(j);
                }
            }
        }
        // 最小时间月初的时间戳
        const minDateStart = moment(minDate).startOf("month").valueOf();
        // 最大时间月末的时间戳
        const maxDateEnd = moment(maxDate).endOf("month").valueOf();
        confine.leftConfine =
            ((minXNode[finishTime] - minDateStart) / 1000 / 60 / 60 / 24) *
            DayWidth;
        confine.rightConfine =
            ((maxDateEnd - maxXNode[finishTime]) / 1000 / 60 / 60 / 24) *
            DayWidth;
        setConfine(confine);
        setMinDateTimestamp(minDateStart);

        return (
            <div className="sa-gantt-table-header">
                {/* 当前视图日期 */}
                <div
                    className="table-header-label"
                    style={{ width: FixedColumnWidth }}
                >
                    <div
                        className="today-btn"
                        onClick={() => {
                            // 今天的0点的时间戳
                            const today = moment().startOf("day").valueOf();
                            // 计算滚动的距离
                            const scrollLeft =
                                ((today.valueOf() - minDateStart) /
                                    1000 /
                                    60 /
                                    60 /
                                    24) *
                                DayWidth;
                            tableRef.current?.scrollTo({
                                left: scrollLeft,
                            });
                        }}
                    >
                        定位到今天
                    </div>
                </div>
                {/* 年刻度 */}
                {Object.keys(dateTree).map((year) => {
                    return (
                        <div className="year-wrap" key={year}>
                            <div className="year-text">{year}</div>
                            <div className="month-wrap">
                                {dateTree[year].map((month) => {
                                    return (
                                        <div
                                            className="month-text"
                                            key={month}
                                            style={{
                                                width:
                                                    getMonthDays(
                                                        Number(year),
                                                        month
                                                    ) * DayWidth,
                                                minWidth:
                                                    getMonthDays(
                                                        Number(year),
                                                        month
                                                    ) * DayWidth,
                                                maxWidth:
                                                    getMonthDays(
                                                        Number(year),
                                                        month
                                                    ) * DayWidth,
                                            }}
                                        >
                                            {month}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // 封装节点悬浮的渲染
    const nodeHoverRender = (item: ShowNodeDataType & WorkflowNodeType) => {
        return (
            <div>
                <div>名称：{item.name}</div>
                <div>计划完成时间：{dateFormat(item[finishTime])}</div>
                <div>
                    状态：
                    {StatusMap[item[statusKey]]
                        ? StatusMap[item[statusKey]].text
                        : item[statusKey]}
                </div>
            </div>
        );
    };

    // 节点展示的渲染
    const nodeTextRender = (item: ShowNodeDataType, index: number) => {
        const data = item as ShowNodeDataType & WorkflowNodeType;
        return (
            <div className={`node-text ${(index % 2 && "down") || "up"}`}>
                <div className="node-name">{data.name}</div>
                <div className="node-time">
                    {(data[finishTime] &&
                        moment(data[finishTime]).format("YYYY.MM.DD")) ||
                        ""}
                </div>
            </div>
        );
    };

    // 封装节点的渲染
    const nodeRender = (parm: NodeRenderProps) => {
        const { item, index, limitData, confine } = parm;
        const itemData = item as ShowNodeDataType &
            WorkflowNodeType & {
                threadData: { name: string };
            };
        return (
            <div
                key={itemData.id}
                id={`gantt-node-${itemData.id}`}
                className="node-wrap"
                style={{
                    left: `${
                        itemData.x - limitData.tableMinX + confine?.leftConfine
                    }px`,
                }}
            >
                {/* 第一个节点显示线程名称 */}
                {!index && (
                    <div className="thread-name">
                        {itemData.threadData?.name}
                    </div>
                )}
                {/* 节点 */}
                {/* <Tooltip
                    className="node-tooltip"
                    content={nodeHoverRender(itemData)}
                    getPopupContainer={() =>
                        document.getElementById("sa-gantt-wrap") as HTMLElement
                    }
                >
                </Tooltip> */}
                <div
                    className={`gantt-node ${
                        StatusMap[itemData[statusKey]]?.className || ""
                    } ${
                        itemData[isMilestoneKey]?.label === "是"
                            ? "milestone"
                            : ""
                    }`}
                    onClick={() => console.log(itemData)}
                />
                {/* 与下个节点的连线 */}
                <div
                    className={`gantt-line ${
                        itemData[isMilestoneKey]?.label === "是"
                            ? "milestone"
                            : ""
                    }`}
                    style={{
                        width: `${itemData.nextLineLength}px`,
                        display: itemData.hideNextLine
                            ? "node"
                            : "inline-block",
                    }}
                />
                {/* 节点展示的内容 */}
                {nodeTextRender(itemData, index)}
            </div>
        );
    };

    // 获取视图数据
    const getViewData = async () => {
        setLoading(true);
        try {
            // 假设请求数据
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(null);
                }, 1000);
            });
            const rowList: GanttRowType[] = RowDataList;
            console.log("rowList", rowList);
            // 处理行数据
            setGanttRowData(
                rowList.map((row) => {
                    row.nodeRender = nodeRender;
                    return row;
                })
            );
        } catch (error) {
            console.log("error", error);
        }
        setLoading(false);
    };

    // 监听滚动
    const onScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const target = e.target as HTMLDivElement;
        const { scrollLeft } = target;
        // 计算当前显示的日期
        const viewDate = moment(minDateTimestamp)
            .add(scrollLeft / DayWidth, "days")
            .valueOf();
        setViewDateTimestamp(viewDate);
    };

    // 防抖滚动（最后一秒执行n次）
    const onScrollDebounce = useDebounce(onScroll, 500);

    // 节流滚动（还在执行中就不会继续执行）
    const onScrollThrottle = useThrottle(onScrollDebounce, 100);

    // 用memo优化甘特图表格
    const GanttTableMemo = useMemo(() => {
        return (
            <>
                {/* 符号说明 */}
                <div className="symbol-description-wrap">
                    符号说明：
                    <div className="symbol-wrap">
                        <div className="symbol not-started" /> 未开始
                    </div>
                    <div className="symbol-wrap">
                        <div className="symbol in-progress" /> 进行中
                    </div>
                    <div className="symbol-wrap">
                        <div className="symbol finished" /> 已完成
                    </div>
                    <div className="symbol-wrap">
                        <div className="symbol milestone" /> 里程碑
                    </div>
                    <div className="symbol-wrap">
                        <div className="symbol critical-path" />
                        关键路径
                    </div>
                </div>
                <GanttTable
                    tableCalssName="sa-gantt-table"
                    ref={tableRef}
                    fixedColumnWidth={FixedColumnWidth}
                    confine={confine}
                    headerRender={headerRender}
                    onScroll={onScrollThrottle}
                    rowList={ganttRowData}
                    needDrawCriticalPath
                />
            </>
        );
    }, [ganttRowData, FixedColumnWidth, confine, headerRender]);

    useEffect(() => {
        getViewData();
    }, []);

    return (
        <div className="sa-gantt-wrap" id="sa-gantt-wrap">
            {loading && <div className="gantt-wrap-lodaing">加载中...</div>}
            {!loading && GanttTableMemo}
        </div>
    );
};

export default Home;

// 导出甘特图组件
export { GanttRow, GanttTable };

// 导出类型
export * from '../../types/gantt';