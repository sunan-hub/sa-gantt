// 数据排序, 按照参数key大小排序
export const sortDataList = (dataList: any[], key: string) => {
    // 过滤掉没有key的数据
    const undefinedDataList = dataList.filter(
        (item) => !item[key] && item[key] !== 0
    );
    return {
        sortList: dataList
            .filter((item) => item[key] || item[key] == 0)
            .sort((a, b) => a[key] - b[key]),
        undefinedDataList,
    };
};

// 判断是否是闰年
export const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// 根据年和月返回月的天数
export const getMonthDays = (year: number, month: number) => {
    const days = [
        31,
        isLeapYear(year) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];
    return days[month - 1];
};

// 获取一个时间戳，和它对应的月的月末距离的天数
export const getMonthEndDay = (time: number) => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthWidth = getMonthDays(year, month);
    return monthWidth - date.getDate();
};

// 获取一个时间戳，和它对应的月的月初距离的天数
export const getMonthStartDay = (time: number) => {
    const date = new Date(time);
    return date.getDate() - 1;
};
