import { InfoOutlined } from '@ant-design/icons';
import { responseProxy } from '@asuna-admin/adapters';
import { StoreContext } from '@asuna-admin/context';
import { ActionEvent, AppContext, EventBus, EventType } from '@asuna-admin/core';
import {
  castModelKey,
  DebugInfo,
  ModelsHelper,
  parseJSONIfCould,
  resolveModelInPane,
  useAsunaModels,
} from '@asuna-admin/helpers';
import { WithDebugInfo } from '@asuna-admin/helpers/debug';
import { createLogger } from '@asuna-admin/logger';
import { modelsActions } from '@asuna-admin/store';
import { Asuna, Condition } from '@asuna-admin/types';
import { Button, Divider, Dropdown, Menu, Modal, Skeleton, Switch, Table, Tag, Tooltip } from 'antd';
import { SorterResult, TableCurrentDataSource, TablePaginationConfig } from 'antd/es/table/interface';
import { Key } from 'antd/lib/table/interface';
import * as _ from 'lodash';
import * as fp from 'lodash/fp';
import React, { useContext, useEffect, useState } from 'react';
import { useAsync, useLogger } from 'react-use';
import { AsunaDrawerButton } from './AsunaDrawer';

const logger = createLogger('components:data-table');

export interface AsunaDataTableProps {
  creatable?: Asuna.Schema.TableColumnOptCreatable;
  editable?: boolean;
  deletable?: boolean;
  renderHelp?: React.ReactChild;
  renderActions?: (extras: Asuna.Schema.RecordRenderExtras) => React.ReactChild;
  expandedRowRender?: (record: any, index: number, indent: number, expanded: boolean) => React.ReactNode;
  rowClassName?: (record: any, index: number) => string;
  // models: any;
  modelName: string;
  extraName?: string;
  onView?: (text: any, record: any) => void;
}

type QueryConditionType = {
  pagination?: TablePaginationConfig;
  filters?: Record<string, Key[] | null>;
  sorter?: SorterResult<any> | SorterResult<any>[];
};

export const AsunaDataTable: React.FC<AsunaDataTableProps> = (props) => {
  const {
    creatable = false,
    editable = false,
    deletable = false,
    renderActions,
    renderHelp,
    rowClassName,
    // models,
    modelName,
    extraName,
    onView,
    expandedRowRender,
  } = props;
  const [queryCondition, setQueryCondition] = useState<QueryConditionType>({
    sorter: { field: 'updatedAt', order: 'descend' },
  });
  const { store } = useContext(StoreContext);
  // 用于刷新页面的一个标记
  const [flag, updateFlag] = useState(1);
  const [items, setItems] = useState();

  const actions = (text, record, extras) => (
    <WithDebugInfo info={{ text, record, extras }}>
      <span>
        {/*{extras && extras(auth)}*/}
        {editable ? (
          <Button size="small" type="dashed" onClick={() => func.edit(text, record)}>
            编辑
          </Button>
        ) : (
          <AsunaDrawerButton text="View" modelName={modelName} record={record} />
        )}{' '}
        {isDeletableSystemRecord(record) && deletable && (
          <>
            <Divider type="vertical" />
            <Button size="small" type="primary" danger onClick={() => func.remove(text, record)}>
              删除
            </Button>
          </>
        )}
      </span>
    </WithDebugInfo>
  );

  const func = {
    createRefresher: (opts: QueryConditionType) => () => func.refresh(opts),
    refresh: (opts?: QueryConditionType) => {
      logger.log('refresh', { opts, queryCondition, flag });
      func.handleTableChange(queryCondition.pagination, queryCondition.filters, queryCondition.sorter);
      // updateFlag(-flag);
    },
    create: () => ModelsHelper.openCreatePane(modelName),
    transformQueryCondition: function <RecordType>({
      pagination,
      filters,
      sorter,
    }: QueryConditionType): {
      transformedFilters: Record<string, [Condition]>;
      availableSorter?: SorterResult<any> | SorterResult<any>[];
      transformedSorter?: Sorter | null;
    } {
      const transformedFilters = func.transformFilters(filters);
      const availableSorter = sorter && _.isEmpty(sorter) ? queryCondition.sorter : sorter;
      if (_.isArray(availableSorter)) {
        return { transformedFilters };
      } else {
        const transformedSorter =
          availableSorter && !_.isEmpty(availableSorter)
            ? ({ [availableSorter.field as string]: _.slice(availableSorter.order, 0, -3).join('') } as Sorter)
            : null;
        // { 'ref.name': '{ 'ref.id': 'idxxxx' }' } -> { 'ref.id': 'idxxxxx' }
        return { transformedFilters, availableSorter, transformedSorter };
      }
    },
    transformFilters: (filters?: Record<string, Key[] | null>): Record<string, [Condition]> => {
      return _.chain(_.omitBy(filters, _.isNil))
        .mapKeys((filterArr, key) =>
          key.includes('.') && _.isString(_.head(filterArr))
            ? _.get(parseJSONIfCould(_.head(filterArr) as any), 'key')
            : key,
        )
        .mapValues((filterArr, key) =>
          key.includes('.') && _.isString(_.head(filterArr))
            ? _.get(parseJSONIfCould(_.head(filterArr) as any), 'value')
            : filterArr,
        )
        .value();
    },
    handleTableChange: function <RecordType>(
      pagination?: TablePaginationConfig,
      filters?: Record<string, Key[] | null>,
      sorter?: SorterResult<RecordType> | SorterResult<RecordType>[],
      extra?: TableCurrentDataSource<RecordType>,
    ): void {
      logger.log('[handleTableChange]', { pagination, filters, sorter, extra });
      const { availableSorter, transformedFilters, transformedSorter } = func.transformQueryCondition({
        pagination,
        filters,
        sorter,
      });

      logger.log('[handleTableChange]', { availableSorter, transformedSorter, transformedFilters });

      setQueryCondition({
        pagination,
        filters,
        // 在 sorter 为空时使用默认的 id desc 排序
        sorter: _.isEmpty(sorter) ? availableSorter : sorter,
      });
    },
    pinActions: (param) => {
      const column = _.find(columnProps, (column) => column.key === 'action');
      if (column) {
        if (_.has(column, 'fixed')) {
          delete column['fixed'];
          delete column['width'];
        } else {
          column['fixed'] = 'right';
          column['width'] = 250;
        }
      }
      updateFlag(flag + 1);
    },
    edit: (text, record) => {
      logger.log('[edit]', { text, record });
      return ModelsHelper.openEditPane(modelName, record);
    },
    remove: (text, record) => {
      logger.log('[remove]', record);
      const modal = Modal.confirm({
        title: '是否确认',
        content: `删除 ${modelName}？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () =>
          AppContext.dispatch(
            modelsActions.remove(modelName, record, (response) => {
              if (/^20\d$/.test(response.status)) modal.destroy();
            }),
          ),
      });
    },
  };

  useEffect(() => {
    logger.log(`[effect]`, { modelName });
    // 收到更新事件时更新对应的模型
    const subscription = EventBus.observable.subscribe({
      next: (action: ActionEvent) => {
        if (
          _.includes([EventType.MODEL_INSERT, EventType.MODEL_UPDATE, EventType.MODEL_DELETE], action.type) &&
          action.payload.modelName === modelName
        )
          func.refresh();
      },
    });
    return () => {
      logger.log('unsubscribe', subscription);
      subscription.unsubscribe();
    };
  }, [modelName]);

  const { loading: loadingAsunaModels, columnProps, relations } = useAsunaModels(
    modelName,
    { callRefresh: func.createRefresher(queryCondition), extraName, actions },
    [modelName, queryCondition],
  );

  const { primaryKey } = resolveModelInPane(modelName, extraName);

  const isDeletableSystemRecord = (record) => !record[castModelKey('isSystem')];
  const _import = () => {
    // TODO not implemented
    // AppContext.adapters.api.import();
  };
  const _export = () => {
    // TODO not implemented
    // AppContext.adapters.api.export();
  };

  const actionColumn = _.find(columnProps, (column) => column.key === 'action');

  // 直接从 remote 拉取，未来需要将 models 中缓存的数据清除
  const { loading } = useAsync(async () => {
    logger.log(`remote[effect]`, { loadingAsunaModels, flag }, queryCondition);
    const { transformedFilters, transformedSorter } = func.transformQueryCondition(queryCondition);
    const value = await AppContext.adapters.models
      .loadModels(modelName, {
        relations,
        filters: transformedFilters,
        pagination: queryCondition.pagination,
        sorter: transformedSorter,
      })
      .then(fp.get('data'));
    if (value) {
      logger.log(`remote[effect]`, { value });
      setItems(value);
    }
  }, [queryCondition, loadingAsunaModels, flag]);

  if (AppContext.isDebugMode) useLogger('AsunaDataTable', { flag, loadingAsunaModels, loading }, queryCondition);

  if (loadingAsunaModels) {
    return <Skeleton active avatar />;
  }

  const { items: dataSource, pagination } = responseProxy.extract(items);

  return (
    <WithDebugInfo info={props}>
      {creatable && (
        <>
          <Button type={'primary'} onClick={() => (_.isFunction(creatable) ? creatable(modelName) : func.create())}>
            创建
          </Button>
          <Divider type="vertical" />
        </>
      )}
      <Button onClick={() => func.refresh()}>刷新</Button>

      <Divider type="vertical" />

      {/* TODO 导入导出按钮，目前接口已经实现，但是暂未集成 */}
      <Button.Group>
        <Button onClick={_import} disabled={true}>
          导入
        </Button>
        <Button onClick={_export} disabled={true}>
          导出
        </Button>
      </Button.Group>

      <Divider type="vertical" />

      <Dropdown
        overlay={
          <Menu>
            <Menu.Item onClick={func.pinActions}>
              <Switch size={'small'} checked={!!_.get(actionColumn, 'fixed')} />
              <Divider type="vertical" />
              固定 Actions
            </Menu.Item>
          </Menu>
        }
        placement="bottomCenter"
      >
        <Button>布局</Button>
      </Dropdown>

      <Divider type="vertical" />

      {renderActions && (
        <>
          {renderActions({ modelName, callRefresh: func.refresh })}
          <Divider type="vertical" />
        </>
      )}
      {renderHelp && (
        <Tooltip title="info">
          <Button
            type="dashed"
            shape="circle"
            icon={<InfoOutlined />}
            size="small"
            onClick={() => Modal.info({ width: '60%', content: renderHelp })}
          />
        </Tooltip>
      )}
      <Divider type="horizontal" style={{ margin: '0.5rem 0' }} />

      {!_.isEmpty(queryCondition.filters) && (
        <>
          {_.map(func.transformFilters(queryCondition.filters), (filter, key) =>
            !_.isEmpty(filter) ? (
              <Tag
                key={`tag-${key}`}
                closable
                color="geekblue"
                onClose={() => {
                  // 重置 filteredValue 用于刷新 table
                  // const column = _.find(columns, column => column.key === key);
                  // if (column) column.filteredValue = null;

                  const filters = _.omit(queryCondition.filters, key);
                  setQueryCondition({ pagination: queryCondition.pagination, filters, sorter: queryCondition.sorter });
                  func.handleTableChange(queryCondition.pagination, filters);
                  updateFlag(flag + 1);
                }}
              >
                {key}: {JSON.stringify(filter)}
              </Tag>
            ) : null,
          )}
          <Divider type="horizontal" style={{ margin: '0.5rem 0' }} />
        </>
      )}

      {columnProps && (
        <Table
          key={`table-${flag}`}
          size="small"
          className="asuna-content-table"
          scroll={{ x: true }}
          dataSource={dataSource}
          rowKey={primaryKey}
          loading={loading}
          columns={columnProps}
          expandedRowRender={expandedRowRender}
          pagination={{ ...pagination, position: ['topRight', 'bottomRight'] }}
          onChange={func.handleTableChange}
          rowClassName={rowClassName}
        />
      )}
      <DebugInfo data={{ store, relations }} divider type="json" />
      {/* language=CSS */}
      <style jsx global>{`
        .ant-tabs {
          overflow: inherit !important;
        }
      `}</style>
    </WithDebugInfo>
  );
};
