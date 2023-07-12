/**
 * 分页数据封装
 */
export class Page<T> {
  total: number;
  pageNo: number;
  pageSize: number;
  list: T[];
  static build<T>(data: T[], total: number, pageNo: number, pageSize: number): Page<T> {
    const page = new Page<T>();
    page.list = data;
    page.total = total;
    page.pageNo = pageNo;
    page.pageSize = pageSize;
    return page;
  }
}
