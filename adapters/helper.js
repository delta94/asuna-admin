// @flow weak
// export const authHeader = token => ({ headers: { Authorization: `Bearer ${token}` } });
import moment from 'moment/moment';

// TODO make helpers configurable
export const authHeader = token => ({ headers: { Authorization: token } });

export const actionHelper = {};

export const columnHelper = {
  generate        : (key, title, render?) => ({
    key,
    title,
    dataIndex: key,
    render   : text => (render ? render(text) : text),
  }),
  generateCalendar: (key, title, render?) => ({
    key,
    title,
    dataIndex: key,
    render   : text => (render ? render(text) : moment(text).calendar()),
  }),
  /**
   * 生成动作按钮
   * @param actions 最终的渲染函数
   * @param extras 需要接受 auth 参数传入
   * @returns {{key: string, title: string, render: function(*=, *=): *}}
   */
  generateActions : (actions, extras) => ({
    key   : 'action',
    title : 'Action',
    render: (text, record) =>
      actions(text, record, extras ? auth => extras(text, record, auth) : null),
  }),
};
