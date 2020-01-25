/** @jsx jsx */
import { NextSocketType, WsAdapter } from '@asuna-admin/adapters';
import { LogoCanvas, Snow, Sun } from '@asuna-admin/components';
import { Config } from '@asuna-admin/config';
import { LoginContainer } from '@asuna-admin/containers';
import { AppContext, IIndexRegister, ILoginRegister, INextConfig } from '@asuna-admin/core';
import { diff } from '@asuna-admin/helpers';
import { WithStyles } from '@asuna-admin/layout';
import { createLogger } from '@asuna-admin/logger';
import { AppState, authActions, RootState } from '@asuna-admin/store';
import { routerActions } from '@asuna-admin/store/router.redux';
import { css, jsx } from '@emotion/core';
import { Divider, Icon } from 'antd';
import ApolloClient, { gql } from 'apollo-boost';
import * as _ from 'lodash';
import { NextPageContext } from 'next';
import fetch from 'node-fetch';
import QRCode from 'qrcode.react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PacmanLoader } from 'react-spinners';
import { Subscription } from 'rxjs';
import * as shortid from 'shortid';
import styled from 'styled-components';

const logger = createLogger('common:login');

// --------------------------------------------------------------
// Main
// --------------------------------------------------------------

const StyledFullFlexContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledLoginWrapper = styled.div`
  width: 20rem;
`;

const StyledLogoWrapper = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
`;

export type LoginInitialProps = Partial<{
  weChatLoginEnable: boolean;
  tempId: string;
  userAgent: string;
  site: { logo?: string; title?: string };
}>;

export type ILoginPageProps = ReduxProps & {
  app: AppState;
  register: ILoginRegister & IIndexRegister;
  hideCharacteristics?: boolean;
  customLogin?: (site, enableWeChat) => React.ReactElement;
} & LoginInitialProps;

export class LoginPage extends React.Component<ILoginPageProps> {
  constructor(props) {
    super(props);

    const { dispatch, register } = this.props;
    AppContext.setup(register);
    AppContext.regDispatch(dispatch);
  }

  componentWillUnmount() {
    // logger.log('[componentWillUnmount]', 'destroy subscriptions');
    // this.state.subscription?.unsubscribe();
  }

  shouldComponentUpdate(
    nextProps: Readonly<ILoginPageProps>,
    nextState: Readonly<{ subscription: Subscription; message?: string }>,
    nextContext: any,
  ): boolean {
    // 通过 userAgent 判断 getInitialProps 有效性。
    return !!nextProps.userAgent || diff(this.state, nextState).isDifferent;
  }

  componentDidCatch(error, info) {
    logger.error('componentDidCatch...', error, { error, info });
  }

  render() {
    const { hideCharacteristics, weChatLoginEnable, dispatch, site, customLogin } = this.props;

    logger.log(`render ...`, this.props, this.state);

    return (
      <WithStyles hideCharacteristics>
        <StyledFullFlexContainer>
          {!hideCharacteristics && (
            <>
              <Snow />
              {/*
              <Sun />
              <StyledLogoWrapper>
                <LogoCanvas />
              </StyledLogoWrapper>
*/}
            </>
          )}

          {customLogin ? (
            customLogin(site, weChatLoginEnable)
          ) : (
            <StyledLoginWrapper>
              <LoginContainer {...this.props} />
            </StyledLoginWrapper>
          )}
        </StyledFullFlexContainer>
      </WithStyles>
    );
  }
}

export const wechatLoginGetInitial = async (ctx: NextPageContext): Promise<LoginInitialProps> => {
  if ((process as any).browser) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return __NEXT_DATA__.props.pageProps;
  }

  try {
    const tempId = shortid.generate();
    const userAgent = ctx.req ? ctx.req.headers['user-agent'] : navigator.userAgent;
    const host = Config.get('GRAPHQL_HOST') || 'localhost';
    const port = process.env.PORT || 3000;
    logger.log(`call http://${host}:${port}/s-graphql`);
    const client = new ApolloClient({
      uri: `http://${host}:${port}/s-graphql`,
      headers: { 'X-ApiKey': 'todo:app-key-001' }, // todo temp auth
      fetch: fetch as any,
    });
    const { data } = await client.query({
      query: gql`
        {
          wechat: kv(collection: "system.wechat", key: "config") {
            key
            name
            type
            value
          }
          site: kv(collection: "app.settings", key: "site") {
            key
            name
            type
            value
          }
        }
      `,
    });

    const weChatLoginEnable = _.get(data, 'wechat.value.values.wechat.login');
    const site = _.get(data, 'site.value');
    console.log({ userAgent, weChatLoginEnable, tempId, site });
    return { userAgent, weChatLoginEnable, tempId, site };
  } catch (e) {
    console.error(e);
  }
  return {};
};

export const LoginPageRender: React.FC<Omit<ILoginPageProps, 'app' | 'dispatch'> & {
  nextConfig: INextConfig;
}> = props => {
  AppContext.init(props.nextConfig);
  const appState = useSelector<RootState, AppState>(state => state.app);
  const dispatch = useDispatch();

  return <LoginPage {...props} app={appState} dispatch={dispatch} />;
};
