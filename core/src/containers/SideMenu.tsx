import { TenantInfo } from '@asuna-admin/adapters';
import { ISideMenuProps, SideMenu } from '@asuna-admin/components';
import { AppContext } from '@asuna-admin/core';
import { TenantHelper } from '@asuna-admin/helpers';
import { panesActions, RootState } from '@asuna-admin/store';
import { Asuna } from '@asuna-admin/types';
import { Divider } from 'antd';
import * as React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';
import { CubeGrid } from 'styled-spinkit';
import * as util from 'util';

export const SideMenuRender: React.FC = props => {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>();
  const states = useSelector<RootState, Pick<ISideMenuProps, 'menus'>>(state => state.menu);
  const dispatch = useDispatch();
  const actions: {
    [action in keyof Pick<ISideMenuProps, 'onOpen'>]: any;
  } = { onOpen: (pane: Asuna.Schema.Pane) => dispatch(panesActions.open(pane)) };

  useEffectOnce(() => {
    TenantHelper.reloadInfo().then(info => setTenantInfo(info));
    const subscription = TenantHelper.subject.subscribe((info: TenantInfo) => setTenantInfo(info));
    return () => subscription.unsubscribe();
  });

  if (tenantInfo?.config?.enabled && !tenantInfo?.tenant)
    return (
      <>
        <CubeGrid />{' '}
        {AppContext.isDebugMode && (
          <>
            <Divider />
            <pre>{util.inspect(tenantInfo, { depth: 10 })}</pre>
          </>
        )}
      </>
    );

  return <SideMenu {...props} {...states} {...actions} />;
};
