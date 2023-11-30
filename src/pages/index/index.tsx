import React, { useState, useEffect } from 'react';
import { NodeDataType } from '@/types/gantt';
import DefaultData from './defaultData'
import GanttRow from '@/components/gantt-row';
import './index.less';

type PropsType = {
    dataList: NodeDataType[];
};

const IndexPage = (props: PropsType) => {
    // 甘特图数据
    const [dataList, setDataList] = useState<NodeDataType[]>(DefaultData);

    useEffect(() => {
        if (props.dataList)
            setDataList(props.dataList);
    }, [props.dataList]);

    return <div className='sa-gantt-wrap'>
        <GanttRow dataList={dataList} />
    </div>;
}

export default IndexPage;

// 导出甘特图组件
export { GanttRow };

// 导出类型
export * from '@/types/gantt';