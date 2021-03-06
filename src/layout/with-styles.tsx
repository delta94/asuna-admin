import { ConfigProvider } from 'antd';
import * as React from 'react';
import NextHead from 'next/head';
import getConfig from 'next/config';
import zhCN from 'antd/lib/locale/zh_CN';

import 'antd/dist/antd.css';
import 'draft-js/dist/Draft.css';
import 'braft-editor/dist/index.css';
import 'video.js/dist/video-js.css';
import 'spinkit/spinkit.css';
import 'react-image-crop/dist/ReactCrop.css';
import '@ant-design/compatible/assets/index.css';

const WithStyles = ({ children, hideCharacteristics }) => (
  <ConfigProvider locale={zhCN}>
    <NextHead>
      <title>
        {hideCharacteristics ? '' : 'Asuna '}Admin : {getConfig().publicRuntimeConfig.env}
      </title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css" />
      {/*<link rel="icon" type="image/png" sizes="32x32" href="/static/icons/favicon-32x32.png" />*/}
      {/*<link rel="icon" type="image/png" sizes="16x16" href="/static/icons/favicon-16x16.png" />*/}
    </NextHead>
    {children}
    {/* language=CSS */}
    <style jsx global>{`
      .ant-legacy-form-item-control pre {
        line-height: 1rem;
      }
      .ant-legacy-form-item-control [name='outer-box'] {
        line-height: 1rem;
      }
      pre {
        /*line-height: 1rem;*/
        /*font-size: 0.65rem;*/
      }
      .row-published {
        /*background-color: lavender;*/
      }
      .row-unpublished {
        color: darkred;
      }
    `}</style>
  </ConfigProvider>
);

export default WithStyles;
