// 数据排序, 按照参数key大小排序
export const sortDataList = (dataList: any[], key: string) => {
    return dataList.sort((a, b) => a[key] - b[key]);
}
