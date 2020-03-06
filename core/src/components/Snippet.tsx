/** @jsx jsx */
import { FilePdfOutlined } from '@ant-design/icons';
import { joinUrl } from '@asuna-admin/core/url-rewriter';
import { TooltipContent, WithDebugInfo } from '@asuna-admin/helpers';
import { jsx } from '@emotion/core';
import { Button, Tooltip } from 'antd';
import * as _ from 'lodash';
import dynamic from 'next/dynamic';
import React from 'react';
import { Document, Page } from 'react-pdf';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import styled from 'styled-components';
import { FlexCenterBox } from './Styled';
// import { Document, Page } from "react-pdf/dist/entry.webpack";

const Viewer = dynamic(import('react-viewer'), { ssr: false });

interface IAssetsPreviewProps {
  host?: string;
  urls: string[];
  showPdf?: boolean;
}

export function ReactViewer({
  images,
  index,
  children,
}: { images: ImageDecorator[]; index: number } & { children?: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <a onClick={() => setVisible(true)}>{children}</a>
      <Viewer
        activeIndex={index}
        visible={visible}
        onClose={() => setVisible(false)}
        onMaskClick={() => setVisible(false)}
        images={images}
        downloadable
        downloadInNewWindow
      />
    </>
  );
}

export const PdfButton: React.FC<{ pdf?: string }> = ({ pdf }) =>
  pdf ? (
    <Tooltip title="按住 option/ctrl 下载">
      <Button type="dashed" size="small" href={pdf} target="_blank">
        查看 pdf
      </Button>
    </Tooltip>
  ) : (
    <React.Fragment>无 pdf</React.Fragment>
  );

export function AssetsPreview({ host, urls, showPdf }: IAssetsPreviewProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '400px' }}>
      {_.map(urls, (url, index) => (
        <div key={`viewer-${index}`}>
          <ReactViewer index={index} images={urls.map(url => ({ src: url, downloadUrl: url }))}>
            <AssetPreview key={url} host={host} url={url} showPdf={showPdf} />
          </ReactViewer>
          <TooltipContent value={url} link />
        </div>
      ))}
    </div>
  );
}

interface IAssetPreviewProps {
  host?: string;
  url: string;
  width?: string;
  height?: string;
  showPdf?: boolean;
  fullWidth?: boolean;
}

interface IAssetPreviewState {
  numPages: number | null;
  pageNumber: number;
  loading: boolean;
}

export function AssetPreview({ host, url, width, height, showPdf, fullWidth }: IAssetPreviewProps) {
  const [state, setState] = React.useState<IAssetPreviewState>({ numPages: null, pageNumber: 1, loading: true });
  const href = joinUrl(host, url);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setState({ numPages, pageNumber: 1, loading: false });
  };

  /*
  const renderLeftPages = () =>
    state.pageNumber > 1 ? (
      _.times(state.pageNumber - 1, page => (
        <Page pageNumber={page + 1} weight={fullWidth ? null : 200} />
      ))
    ) : (
      <React.Fragment />
    );
*/

  if (/pdf$/.test(url)) {
    return showPdf ? (
      <WithDebugInfo info={state}>
        {!state.loading && (
          <div>
            <a href={href} target="_blank">
              <FilePdfOutlined style={{ fontSize: '2rem', padding: '1rem' }} />
            </a>
            {state.numPages} pages in total.
          </div>
        )}
        <FlexCenterBox key={url}>
          <a href={href} target="_blank">
            <Document file={href} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={state.pageNumber} width={fullWidth ? (null as any) : width ?? 200} />
            </Document>
          </a>
        </FlexCenterBox>
      </WithDebugInfo>
    ) : (
      <FlexCenterBox>
        <a href={href} target="_blank">
          <FilePdfOutlined style={{ fontSize: '2rem', padding: '1rem' }} />
        </a>
      </FlexCenterBox>
    );
  }
  return (
    <FlexCenterBox key={url}>
      <Image
        width={fullWidth ? '100%' : ''}
        height={height}
        // src={valueToUrl(url, { type: 'image', thumbnail: { height: height ?? 200, width: width ?? 200 } })}
        src={url}
      />
    </FlexCenterBox>
  );
}

export const Image: React.FC<{ src: string; height?: string; width?: string }> = ({ src, height, width }) => {
  const textPlaceHolder = 'https://fakeimg.pl/80x30/282828/eae0d0/?retina=1&text=loading...&font=noto';
  const placeHolder =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAFsCAYAAAAE3JteAAAME2lDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU8kWnltSCCSUAAJSQu9Ir1JD79LBRkgChBIwIajYlUUF1y4iYENXQRRcCyCLDbGzKNjrAxUVZV10xYbKmxTQ9bXvne87uX/OnHPmP+fOnW8GAEVbVn5+DqoEQC6/QBAT5MdISk5hkB4BBKBACUwEeiy2MN83OjocQBl7/l3e3YTeUK5Zi3P96/h/FWUOV8gGAImGOI0jZOdCfAQAXIOdLygAgNAJ7YazC/LFeAhiVQEkCAARF+MMKdYQ4zQptpL4xMUwIfYBgKzAYgkyAKCJeTMK2RkwD03M0ZbP4fEhrobYi53J4kB8H2Kr3Nw8iBXJEJulfZcn428508ZzslgZ41hai0TI/jxhfg5r7v/Zjv8tuTmisTkMoCpkCoJjxDXDvtVm54WJsQLEbfy0yCiIVSC+wONI/MX4bqYoOF7mP8gWMmHPgDqAL5vD8g+DWBtidVF2vK8M27MEkljoj0byCkLiZDhNkBcjy48W8nMiw2V5VmRyQ8bwNq4wIHbMJ50XGAIxXGnokaLMuEQpT7SjkJcQCTEN4qvC7NgwWezDokxm5JiPQBQj5mwE8dt0QWCM1AfTyBWO1YXZsFmSueBawHwKMuOCpbFYEleYFD7GgcP1D5BywDhcfryMGwZXl1+MLLYkPyda5o9t4+YExUj7jB0UFsaOxfYUwAUm7QP2KIsVGi2b611+QXSclBuOgnDABP6AAURQ00AeyAK8rsHmQfhPOhIIWEAAMgAXWMssYxGJkhE+/I0FReAPiLhAOB7nJxnlgkJo/zJulf5ag3TJaKEkIhs8hTgX18K9cA88HP76QLXHXXG3sTiG4tisxACiPzGYGEg0H+fBhqxzoAoA79/YwuCTC6sTc+GP1fAtH+EpoZvwiHCD0Eu4AxLAE0kWmddM3lLBD8wZIAL0wmyBsurSvq8ON4GsnXA/3BPyh9xxdVwLWOOOsBJf3BvW5gSt3zMUjXP71ssf5xOz/r4emZ1mQXOSsUgbfzPMca8fszC/6xEHPsN+9MRWYIex89hp7CLWhjUDBnYSa8E6seNiPL4SnkhWwthsMRJu2TAPb8zHtt52wPbzD3OzZPOL+yUs4M4pEH8MzLz8uQJeRmYBwxfuxlxGCJ9tY8Wwt7VzBUC8t0u3jqErkj0b0VT+ZltcAsBk29HR0WPfbBEPATjyCgDK3W82M7gj0B4BcGELWyQolNrE2zEgAApQhF+FJtAFhsAM1mMPnIEH8AEBIBREgTiQDGbAjmeCXMh5NpgPloASUAbWgk2gEmwHu0AtOAAOgWbQBk6Dc+AyuApugHtwXfSDl2AIvAMjCIKQECpCRzQRPcQYsUTsEVfECwlAwpEYJBlJRTIQPiJC5iPLkDJkPVKJ7ETqkF+RY8hp5CLSjdxB+pAB5A3yCcVQBVQV1UFN0EmoK+qLhqFx6HQ0A52FFqHF6Gq0Aq1B96NN6Gn0MnoD7UVfosMYwOQxdUwfs8ZcMSYWhaVg6ZgAW4iVYuVYDdaAtcL3fA3rxQaxjzgRp+MM3BquzWA8Hmfjs/CF+Cq8Eq/Fm/AO/Brehw/hXwlUgjbBkuBOCCEkETIIswklhHLCHsJRwln43fQT3hGJRHWiKdEFfpfJxCziPOIq4lZiI/EUsZv4mDhMIpE0SZYkT1IUiUUqIJWQtpD2k06Sekj9pA9kebIe2Z4cSE4h88lLyeXkfeQT5B7yM/KInJKcsZy7XJQcR26u3Bq53XKtclfk+uVGKMoUU4onJY6SRVlCqaA0UM5S7lP+kpeXN5B3k58iz5NfLF8hf1D+gnyf/EcFFQULBabCNAWRwmqFvQqnFO4o/EWlUk2oPtQUagF1NbWOeob6kPqBRqfZ0EJoHNoiWhWtidZDe6Uop2is6Ks4Q7FIsVzxsOIVxUElOSUTJaYSS2mhUpXSMaVbSsPKdGU75SjlXOVVyvuULyo/VyGpmKgEqHBUilV2qZxReUzH6IZ0Jp1NX0bfTT9L71clqpqqhqhmqZapHlDtUh1SU1FzVEtQm6NWpXZcrVcdUzdRD1HPUV+jfkj9pvqnCToTfCdwJ6yc0DChZ8J7jYkaPhpcjVKNRo0bGp80GZoBmtma6zSbNR9o4VoWWlO0Zmtt0zqrNThRdaLHRPbE0omHJt7VRrUttGO052nv0u7UHtbR1QnSydfZonNGZ1BXXddHN0t3o+4J3QE9up6XHk9vo95JvRcMNYYvI4dRwehgDOlr6wfri/R36nfpjxiYGsQbLDVoNHhgSDF0NUw33GjYbjhkpGcUYTTfqN7orrGcsatxpvFm4/PG701MTRJNlps0mzw31TANMS0yrTe9b0Y18zabZVZjdt2caO5qnm2+1fyqBWrhZJFpUWVxxRK1dLbkWW617LYiWLlZ8a1qrG5ZK1j7Whda11v32ajbhNsstWm2eTXJaFLKpHWTzk/6autkm2O72/aenYpdqN1Su1a7N/YW9mz7KvvrDlSHQIdFDi0Orx0tHbmO2xxvO9GdIpyWO7U7fXF2cRY4NzgPuBi5pLpUu9xyVXWNdl3lesGN4Obntsitze2ju7N7gfsh9z89rD2yPfZ5PJ9sOpk7effkx54GnizPnZ69XgyvVK8dXr3e+t4s7xrvRz6GPhyfPT7PfM19s3z3+77ys/UT+B31e890Zy5gnvLH/IP8S/27AlQC4gMqAx4GGgRmBNYHDgU5Bc0LOhVMCA4LXhd8K0QnhB1SFzIU6hK6ILQjTCEsNqwy7FG4RbggvDUCjQiN2BBxP9I4kh/ZHAWiQqI2RD2INo2eFf3bFOKU6ClVU57G2MXMjzkfS4+dGbsv9l2cX9yauHvxZvGi+PYExYRpCXUJ7xP9E9cn9iZNSlqQdDlZK5mX3JJCSklI2ZMyPDVg6qap/dOcppVMuznddPqc6RdnaM3ImXF8puJM1szDqYTUxNR9qZ9ZUawa1nBaSFp12hCbyd7Mfsnx4WzkDHA9ueu5z9I909enP8/wzNiQMZDpnVmeOchj8ip5r7OCs7Znvc+Oyt6bPZqTmNOYS85NzT3GV+Fn8zvydPPm5HXnW+aX5PfOcp+1adaQIEywR4gIpwtbClThMadTZCb6SdRX6FVYVfhhdsLsw3OU5/DndM61mLty7rOiwKJf5uHz2PPa5+vPXzK/b4Hvgp0LkYVpC9sXGS4qXtS/OGhx7RLKkuwlvy+1Xbp+6dtlictai3WKFxc//inop/oSWomg5NZyj+XbV+AreCu6Vjqs3LLyaymn9FKZbVl52edV7FWXfrb7ueLn0dXpq7vWOK/Ztpa4lr/25jrvdbXrldcXrX+8IWJD00bGxtKNbzfN3HSx3LF8+2bKZtHm3orwipYtRlvWbvlcmVl5o8qvqrFau3pl9futnK0923y2NWzX2V62/dMO3o7bO4N2NtWY1JTvIu4q3PV0d8Lu87+4/lK3R2tP2Z4ve/l7e2tjajvqXOrq9mnvW1OP1ovqB/ZP23/1gP+Blgbrhp2N6o1lB8FB0cEXv6b+evNQ2KH2w66HG44YH6k+Sj9a2oQ0zW0aas5s7m1Jbuk+FnqsvdWj9ehvNr/tbdNvqzqudnzNCcqJ4hOjJ4tODp/KPzV4OuP04/aZ7ffOJJ253jGlo+ts2NkL5wLPnTnve/7kBc8LbRfdLx675Hqp+bLz5aZOp86jvzv9frTLuavpisuVlqtuV1u7J3ef6PHuOX3N/9q56yHXL9+IvNF9M/7m7VvTbvXe5tx+fifnzuu7hXdH7i2+T7hf+kDpQflD7Yc1/zD/R2Ovc+/xPv++zkexj+49Zj9++UT45HN/8VPq0/Jnes/qnts/bxsIHLj6YuqL/pf5L0cGS/5Q/qP6ldmrI3/6/Nk5lDTU/1rwevTNqr80/9r71vFt+3D08MN3ue9G3pd+0PxQ+9H14/lPiZ+ejcz+TPpc8cX8S+vXsK/3R3NHR/NZApbkKIBBRdPTAXizFwBqMgD0q/D8QJPevSSCSO+LEgT+E5bezyTiDEADfIiP3MxTAByEagKVCjXKB4A4H4A6OIyrTITpDvbSXLR6AEj6o6Nv8gCQg/o5aHR0JHp09Au8+2HXATjxXHrnEwsRnu932IlRj17LHPCD/BOdmm67WkpivAAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAZ1pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NjgyPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjM2NDwvZXhpZjpQaXhlbFlEaW1lbnNpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgq9WCzjAAAAHGlET1QAAAACAAAAAAAAALYAAAAoAAAAtgAAALYAACEcIyBtfQAAIOhJREFUeAHs3eeTFNd6x/FnNpFzDgKx5IzIOSxJIl0U0LVu2a66dpXKL+xy1f1DXGX73S2Hqlv2dUlIQhcEkhAZCUkgJBAIIQQSApFhWdicfZ5eeugzu+zOzM7sdPj2C6bP2Z7ucz6HF7/qOX06VlVb3ywSk+bmJonF9LNZ8mJ50hQvm7869fr3PBFpNsdondnV7zU1OYWWYsv39ZiWLfbkOFMT/07L/pMDnI+Wcz2t0WOT2RK/l8x3OAYBBBBAAAEEEIiCQLp5KvF7bt5KzHJ2vUmC7gHup5MHNSFqsPN+qn5L2DNJ0ew9DX5adg59ckissqauWYNoyzn00xzsfph6N8BqZct+3tNw6vxdT+5eoCWYNjU1OwG1JeCab5rzOdd7clhiueWvT49zy4mf2jQ2BBBAAAEEEEAAgdQF3Pz1rG8m5iz3eLfeW07cd+KjJ+852VIvFP+Dhjg9wA1zTw42ZSec6rFmexpaWzJlrKq24ckt0pYDYrFmKcoviIfL+IVa/sy/CCCAAAIIIIAAAgh0SkB/wddNP+obG80v+S2n84ZWrTFBtd4cq3dA86SoIM/87K93Nt2U2/Il/kUAAQQQQAABBBBAIBsCmkM1sNY2mOmk8TuuLVcyP/3Xm5/+RboX5hNQs6HPORFAAAEEEEAAAQQ6FNDAWlPfaI57el/VCardTEjN11upbAgggAACCCCAAAII5EhAn3Py3lmNVdfVN3cr4G5qjsaDyyKAAAIIIIAAAgg8EdC7qnUNnjmrDY1NzdxN5f8HAggggAACCCCAgB8Ent5VNZMAmkyJh6f8MCy0AQEEEEAAAQQQQMCZq1pn5qrqA/4EVf5DIIAAAggggAACCPhFIB5UTYNipvBk5Sq/NI92IIAAAggggAACCERZoLquwXTfPP1PUI3yfwP6jgACCCCAAAII+E+gJahyR9V/I0OLEEAAAQQQQACBiAuYN6c6AtxRjfh/BLqPAAIIIIAAAgj4TYCg6rcRoT0IIIAAAggggAACjgBBlf8ICCCAAAIIIIAAAr4UYI6qL4eFRiGAAAIIIIAAAgjoHdWYrqPKU//8Z0AAAQQQQAABBBDwkwA//ftpNGgLAggggAACCCCAQFyAoBqnYAcBBBBAAAEEEEDATwIEVT+NBm1BAAEEEEAAAQQQiAsQVOMU7CCAAAIIIIAAAgj4SYCg6qfRoC0IIIAAAggggAACcYGWoNrMU/9xEXYQQAABBBBAAAEEfCFQVVvvtIPlqXwxHDQCAQQQQAABBBBAwBUgqLoSfCKAAAIIIIAAAgj4SoCg6qvhoDEIIIAAAggggAACrgAPU7kSfCKAAAIIIIAAAgj4SoCg6qvhoDEIIIAAAggggAACrkBlTb3EYsJT/y4InwgggAACCCCAAAL+EGgJqjGCqj+Gg1YggAACCCCAAAIIuAL89O9K8IkAAggggAACCCDgKwG9o6ob66j6alhoDAIIIIAAAggggAB3VPk/gAACCCCAAAIIIOBLAQ2qzc28QtWXg0OjEEAAAQQQQACBKAvw03+UR5++I4AAAggggAACPhbgp38fDw5NQwABBBBAAAEEoizAHdUojz59RwABBBBAAAEEfCxQVatP/bOOqo+HiKYhgAACCCCAAALRFOCOajTHnV4jgAACCCCAAAK+F9A7quahf9ZR9f1I0UAEEEAAAQQQQCBiAi0//RNUIzbsdBcBBBBAAAEEEPC/AD/9+3+MaCECCCCAAAIIIBBJAe6oRnLY6TQCCCCAAAIIIOB/Ab2jGovx07//R4oWIoAAAggggAACERPgp/+IDTjdRQABBBBAAAEEgiLAT/9BGSnaiQACCCCAAAIIREyAoBqxAae7CCCAAAIIIIBAUAT46T8oI0U7EUAAAQQQQACBiAkQVCM24HQXAQQQQAABBBAIigBBNSgjRTsRQAABBBBAAIGICRBUIzbgdBcBBBBAAAEEEAiKgAZV1lENymjRTgQQQAABBBBAIEICBNUIDTZdRQABBBBAAAEEgiRAUA3SaNFWBBBAAAEEEEAgQgIE1QgNNl1FAAEEEEAAAQSCJEBQDdJo0VYEEEAAAQQQQCBCAgTVCA02XUUAAQQQQAABBIIkoEFVt1iz2YLUcNqKAAIIIIAAAgggEG4Bgmq4x5feIYAAAggggAACgRUgqAZ26Gg4AggggAACCCAQbgGCarjHl94hgAACCCCAAAKBFSCoBnboaDgCCCCAAAIIIBBuAYJquMeX3iGAAAIIIIAAAoEVIKgGduhoOAIIIIAAAgggEG4Bgmq4x5feIYAAAggggAACgRUgqAZ26Gg4AggggAACCCAQbgGCarjHl94hgAACCCCAAAKBFSCoBnboaDgCCCCAAAIIIBBuAYJquMeX3iGAAAIIIIAAAoEVIKgGduhoOAIIIIAAAgggEG4Bgmq4x5feIYAAAggggAACgRUgqAZ26Gg4AggggAACCCAQbgGCarjHl94hgAACCCCAAAKBFSCoBnboaDgCCCCAAAIIIBBuAYJquMeX3iGAAAIIIIAAAoEVIKgGduhoOAIIIIAAAgggEG4Bgmq4x5feIYAAAggggAACgRUgqAZ26Gg4AggggAACCCAQbgGCarjHl94hgAACCCCAAAKBFSCoBnboaDgCCCCAAAIIIBBuAYJquMeX3iGAAAIIIIAAAoEVIKgGduhoOAIIIIAAAgggEG4Bgmq4x5feIYAAAggggAACgRUgqAZ26Gg4AggggAACCCAQbgGCarjHl94hgAACCCCAAAKBFSCoBnboaDgCCCCAAAIIIBBuAYJquMeX3iGAAAIIIIAAAoEVIKgGduhoOAIIIIAAAgggEG4Bgmq4x5feIYAAAggggAACgRUgqAZ26Gg4AggggAACCCAQbgGCarjHl94hgAACCCCAAAKBFSCoBnboaDgCCCCAAAIIIBBuAYJquMeX3iGAAAIIIIAAAoEVIKgGduhoOAIIIIAAAgggEG4Bgmq4x5feIYAAAggggAACgRUgqAZ26Gg4AggggAACCCAQbgGCarjHl94hEDiB5uZmuVdaJn169ZQe3bsFrv00GAEEEEAgcwIE1cxZciYEEOikgIbU9z48Ir/8elsKC/LlxTVLZOK45zp5Vr6OAAIIIBBUAYJqUEeOdiMQQoHb90rlz7s+jvcsLy8m2zaslOIxI+N17CCAAAIIREeAoBqdsaanCPheoLKqWv7j/3ZLY2NTvK35+XmyfeMqGTt6eLyOHQQQQACBaAgQVKMxzvQSgcAIXLj0s3x05AurvQVmGsArL62W0SOGWvUUEEAAAQTCLUBQDff40jsEAilw7vvL8snxU1bbCwsL5LXNJTJi6CCrngICCCCAQHgFCKrhHVt6hkCgBb4+/4McOfG11YduRYXy2pYSGTZ4oFVPAQEEEEAgnAIE1XCOK71CIBQCp85ckOMnz1p96d6tSHZsXStDBva36i9evir7Dn1u1VFoX6CosFAGDegrUyc+L7OmTpC8vLz2v8BfEUAAgS4WIKh2MTiXQwCB1AS++Pq8nPjqnPWlnj26yetb18nA/n2t+vM/XJH9R09adRSSExg6eIBsf3GV9O7ZI7kvcBQCCCDQBQIE1S5A5hIIINA5geNfnpFTZ7+3TqKB6vVt66R/395W/dkLl+Tgp6etOgrJCWhY/d32DdxZTY6LoxBAoAsECKpdgMwlEECg8wKHT5yWb85fsk7Ut3dPJ6z27d3Lqj/97UU5+sU3Vh2F5ARKls2TOdMnJXcwRyGAAAJZFiCoZhmY0yOAQOYEPjl+Us59f8U6od5R1WkAvXvxk7UFk0ShorLarK5wUn6+djN+tK6q8Ia5q8qGAAII+EGAoOqHUaANCCCQlIC+YvXjo1/IhUtXreN1rqo+YNWrR3ernkLHAhpW//i/78cP1Aes/vH3r8XL7CCAAAK5FCCo5lKfayOAQMoCTU1NztP9l366Zn138MB+smPLWunRvZtVT6FjgX/54/9ZB/3hzTesMgUEEEAgVwIE1VzJc10EEEhaoLGxUfLz8+PHa1j94MCncvnqjXid7gwzDwPpOqvdioqsegrtCxBU2/fhrwggkDsBgmru7LkyAggkKbB7/zHZsm659TS6hte/7D8uV6/fss6icyxf3bxG9CdstuQECKrJOXEUAgh0vQBBtevNuSICCKQooEFq8vgxsqlkqcRisfi3GxoaZddHR+X6zTvxOt0ZPWKIvPzSaiksKLDqKbQtQFBt24VaBBDIvQBBNfdjQAsQQKADATdITZv0vGxctdgKq3X1DbLrw8Ny4/Z96yxjRw+X32xcKQWeKQPWARTiAq6vW8EcVVeCTwQQyLUAQTXXI8D1EUCgQwFvkJo5dbysX7HQ+k5dXb28s/eQ3L5XatUXjxkpWzeskHxeDWq5JBa8vvo3gmqiEGUEEMiVAEE1V/JcFwEEkhZIJkjV1NbJOx8clLsPyqzzThw3WjavXWbNb7UOoCDJ+MKEAAII5EKAoJoLda6JAAIpCSQbpKpqamXnngPy4OFj6/xTJoyVl9YssaYMWAdEvJCsb8SZ6D4CCORAgKCaA3QuiQACqQmkEqQqq6rl7T0H5eGjcusiMyYXy/qVC62wqi8QOH/xily8ck0elj2WanNXVrce3YpkgHmJwKjhQ2RS8RjRNVrDvKXiG2YH+oYAAv4TIKj6b0xoEQIIJAikGqTKK6pMWD0gj8orrTPNnjZB1i5fYNXV1umUgUNy5/5Dq95b0MC6bMFsZzUBb31Y9lP1DUu/6QcCCPhfgKDq/zGihQhEXiCdIPWovELe3n1QyiurLL95sybLqsVzrbpqnTJg5rfeL31k1ScW5kyfKGuWzrPuyiYeE8RyOr5B7CdtRgCB4AkQVIM3ZrQYgcgJpBuk9Od/vbNaWVVjmS16YZpzh9RbWVldY+a3HpRSMwWgve25kcNkm1lJoFtReF4okK5ve078DQEEEMiEAEE1E4qcAwEEsirQmSB1/+EjJ4DqXVPvtnT+DFk8d6a3SnTOaoN541VFZbXcuHXXmbt67cZt6xgtaFh9zbz9yvvygVYHBaiiM74B6iZNRQCBAAoQVAM4aDQZgagJdDZI3X3w0AmrtWa9Ve+2avEcmTdrqreq1f6vt+7JJ8e+bPVwlk4DKFk2v9XxQazorG8Q+0ybEUAgGAIE1WCME61EINICmQhS+jIAXWdV32Tl3dYunyezp03yVrXa14D7l4+Pya/mLqt3e33rulA8YJUJX68L+wgggECmBAiqmZLkPAggkDWBTAWpG7fvyXv7Dkt9Q6PV1g1m2aoZU8ZbdYkFDat/3vWxdWdVVwP47bZ1iYcGrpwp38B1nAYjgIDvBQiqvh8iGogAAukGKb17WlRYYAFev3lHdn141JmL6v3DppIlMmXC896qVvs6DUAfzvJuf/vapsCvs5qur9eBfQQQQCAbAgTVbKhyTgQQyKhAukHqi6/POw8+6Z1P73b1+i3np/zGpqZ4tT4YtcW8anVi8XPxurZ23tl7WLwPWC2eO0OWzrcfymrre36uS9fXz32ibQggEA4Bgmo4xpFeIBBqgXSD1E5dyP/eA3l1c4mMGDrIMrpy9YbsOXBcmpqa4/V5eTGz9NRKKR4zMl6XuKNvstp/7GS8WlcA2LGlJF4O4k66vkHsK21GAIFgCRBUgzVetBaBSAqkG6T++D/vS4V5paquebpj61oZOmiA5Xfpp2uy9+AJZ1kq9w/5eXmy/cVVMnb0cLfK+tS1Wf/7rQ/idb179pA3/3p7vBzEnXR9g9hX2owAAsESIKgGa7xoLQKRFEg3SP3rf74tjWZdVN16dO8m//A3L7da+/TCpZ/loyNfWK4FBfnyykurzRP9Q616LdQ3NMi//9fOeH1+fr7889+/Hi8HcSdd3yD2lTYjgECwBAiqwRovWotAJAXSDVLeoKpw//R3O6SwwH64SuvPXbxs1ko9pbvxTY971SzqP3LY4Hid7jSZea3/ZoKqfupGUHUY+AcBBBDIigBBNSusnBQBBDIpkG5QdX/6d9vy+99ukQH9+rhF6/Ob8z/I4RNfW3VFOmXAzD8dNnigVX/551/N/NZPnSkD/PRv0VBAAAEEMipAUM0oJydDAIFsCKQbVPVhKl2Oyt06Wi/11NkLcvzLs+7hzmf3bkXO/NYhA/tb9Rcv/yL7Dp1wVhXgYSqLhgICCCCQMQGCasYoORECCGRLIN2geuKrc6JLVLnbmFHD5TXzc35725fm+M/M97xbTzO/dYdZ2H9Q/77eavnuh5/kUXkly1NZKhQQQACBzAkQVDNnyZkQQCBLAukG1fulj+RP7+yzWpXMa08/PXlGTp753vper57dnbdQ9e9rTx2orql1HtSyDg5YIV3fgHWT5iKAQAAFCKoBHDSajEDUBDoTpN7afUD01anupnNUf/fyRmfJKreurc/DJ07LN+cvWX/q07unE1b79u5l1Qe90BnfoPed9iOAgL8FCKr+Hh9ahwACRqAzQaqt157qslO/2biyw7B64PhJ+fb7K9YY9OvbW367dZ307tXDqg9yoTO+Qe43bUcAAf8LEFT9P0a0EIHIC3Q2SB367Cs5892PlqPeWV2/cpFZK9V+var3oObmZvn46Jeia616t4H9+5gHrNZJrx7dvdWB3e+sb2A7TsMRQMD3AgRV3w8RDUQAgc4GKQ2c7+w9bK0A4KrqA1ZTxo+RUeYuq/60r2+misVi7p+dJaj06f4frlyL1+nO4IH9zNJVawM/P1X70llfPQcbAgggkA0Bgmo2VDknAghkVCATQaq2rl527z/eZlj1NlZfnbrdTAvQhfzdTRf3/8Csm3r56g23yvkcOniAs85qt6Iiqz4bBW3/56fPyRXTBn071shhg2TxvFnmtbD2slnpXDsTvulcl+8ggAACHQkQVDsS4u8IIJBzgUwFKb2zqg9JJU4DSOxg8dhRsm39cskzd1fdTV/F+hcTdK9ev+VWOZ8jhg5y3mBVVFho1WeyUFlVIzs/OCilZY+t0xaYMP3imsUyqXiMVZ9qIVO+qV6X4xFAAIGOBAiqHQnxdwQQyLlApoOUPmD12amz1moAiZ2cVPycbCpZaoXVhoZG2fXR0VZ3ZUcNHyKvbFrd5utZE8+bavlZIdU9j05TWLlotsybNdWtSvkz074pN4AvIIAAAs8QIKg+A4ZqBBDwj0C2gtS90jL58afrTmB9aO5WVtfWOZ3uYd5GNcAs7j9n+iSZ8Pwoa86q/uz+3r4jrULumFHDZPuLq0TvcmZq6yikeq/zwoxJsmbpPG9V0vvZ8k26ARyIAAIIPEOAoPoMGKoRQMA/An4LUnVmvui7+w7JrbulFtK4MSNl24YVzgNZ1h/SKDwrpE54frQJz6Plk+OnRKcjeLcJ40bL5pJlZn7t0ykL3r8/a99vvs9qJ/UIIBA9AYJq9MacHiMQOAE/Bqkac/f1HTNv9O6DMstTw+KWtcusKQPWAUkU2gupW9bp3NmYmX5w13k4rLau5S6we1qdhqBrxHY3d4WT3fzom2zbOQ4BBMItQFAN9/jSOwRCIeDXIKWvT92556Dcf/jIcp4yYay8tGaJNWXAOqCdgobUt/cckIePyq2jWgJwS0h1/6DX3fXhESmvqHKrnM+BZtrCyy+tln59knuDll99rU5RQACBSAoQVCM57HQagWAJ+DlIPStYTp88TjaYFwp412TtSP1Z52orpLrnqqiqll1mzqzOt/Vu+jKC7SasDjNLaHW0+dm3o7bzdwQQCLcAQTXc40vvEAiFgN+DVHlllby9+4A8Kq+0vGdPmyBrly+w6p5VSCekuueqq28w0wCOybUbd9wq57OosEA2r10u48aMsOoTC373TWwvZQQQiI4AQTU6Y01PEQisQBCClIZU/ck+8Wf4uTMny+olc9u170xIdU+sLyXQ171+/+NVt8r51LVg1y2fLzOmjLfqvYUg+Hrbyz4CCERHgKAanbGmpwgEVsCPQare3MUsNHcsvZvOK9WwqsHTuy2cM02WL5ztrYrvZyKkxk9mdj49eVZOnrngrXL2F8+dLkvnz2pVrxV+9G2zoVQigEDkBAiqkRtyOoxA8AT8FqT0p359iGqRCX/TJxVboA/MA05vm7/pg1beben8GbJ47kxvlTSZN2W9t+9wq5/s25uTap3gGYVvv78shz47LXqX1btNnzRO1pt5s7pqgHfzm6+3bewjgEC0BQiq0R5/eo9AIAT8FKT0p319nWnZ4wrnQalNJUtk8vixluM9s2SVHqNLWHm3lYvnyPyEN0g9rjBTBnYfFP3UbeK458y8Ul3eyg6T3vMks//TtZuy98Bnoi8o8G5jRw83r4ddYd0N9pOvt63sI4AAAgRV/g8ggIDvBfwSpDRM7txzyDw0VRE306f6/+o362XE0EHxOt25fa9U3tl7SPTlAN6tZNk8541X3joNvTplYMTQwRkJqe65tQ3vm1e+VlXbUxGGDhrgLF/Vq2d351C/+Lrt5hMBBBBwBQiqrgSfCCDgWwE/BCl9WEoX+E98sl/vpupd1baWobp55768u/dwq7ua61cukJlTJljeFZXV0tMsKdXZO6nWSU3hkQnB75m1VhPXZe3bu5e8vGm1DDJrrvrBN7HdlBFAAAEVIKjy/wABBHwvkOsgpeFU56S6P8+7YMks7H/95h2zKP9RaUh43am+EGDqxOfdU2X1s7qmztxZPWJe+frAuo6+vWrbhpXO3VzvH/7w5hveIvsIIIBAzgQIqjmj58IIIJCsQC6Dqt6R3PnBoVYhVUPmi6sXt3knNbFfv/x6ywTFY9LoebhJ78DqXNRJxc8lHp6VsgblvQdPyJWrv1rnL8jPbxWiCaoWEQUEEMihAEE1h/hcGgEEkhPIVVDVuaP6UFTi2qjTzNPzGlJT2a78ckP2fHLcPInfHP+a/syvDzYVjx0Vr8vmTrNZZeDwidNy5rsf270MQbVdHv6IAAJdKEBQ7UJsLoUAAukJ5CKoOiHV/NyvS1F5t3RCqvv9Sz9dN3c1PxMNjO6Wbxbk3/7iShk7uv23R7nHZ+Lz1NkLZr3Vb612eM9LUPVqsI8AArkUIKjmUp9rI4BAUgJdHVT1wSO9k6oPOHm36ZOLZeOqRd6qlPf1zVEfHv7c+p7+/P7yS6vluZFDrfpsFn64/It8ZN5k1Zgwd1avSVDNpjznRgCBVAQIqqlocSwCCOREoCuDamlZufN0f0WVHVJnTCmWDWax/Exs5y5elk+OnbJOVVhQIK9uXiMjhw226rNZuH7zruzef1xq6+z1Xgmq2VTn3AggkIoAQTUVLY5FAIGcCHRVUC0te+w8OFWZEFJnThlv3ui0MKN9P/PdJeftUd6TFhUVymubS2T4kIHe6qzu3zdv0vrTzn3WNQiqFgcFBBDIoQBBNYf4XBoBBJIT6Iqg+sCEVF0ntbLKXhx/1tQJsm7FguQamuJRX5m5ose+PGt9S5eM2rFlrQwZ1N+qz2ahK3yz2X7OjQAC4RUgqIZ3bOkZAqERyHaQ0ruK75olqCoT3uA0e9oEWbs8OyHVHZwvvj4vJ7465xadz57du8mOrWtl0IB+Vn22Ctn2zVa7OS8CCIRfgKAa/jGmhwgEXiCbQep+6SPnVaeJrxmdM32ilCyb3yV2n546Kye/uWBdS19v+vrWdTKgXx+rPhuFbPpmo72cEwEEoiNAUI3OWNNTBAIrkK0g5YRU83N/VU2tZfPCjEmyZuk8qy7bhSOfn5avz12yLtOnd08nrPbr08uqz3QhW76ZbifnQwCB6AkQVKM35vQYgcAJZCNI3XtQ5txJrU4IqXNNSF3dxSHVHZADn56Sby9cdovOp4bU17etkz69elr1mSxkwzeT7eNcCCAQXQGCanTHnp4jEBiBTAepuyakvrv3kLQKqTMny+olc3Pmoi8C2G/WNv3u0s9WG/Tnf50GoNMBsrFl2jcbbeScCCAQTQGCajTHnV4jECiBTAapu/cfOndSa2rttUPnzZoiqxa/kHMXDav6QoCLZkF+7zbYPFilD1j1MA9aZXrLpG+m28b5EEAg2gIE1WiPP71HIBACmQpSd0xI1TupiSF1weypsmLRHN9YNDU1yQcHPpPLV3+12jR08ABnnVVdwiqTW6Z8M9kmzoUAAgioAEGV/wcIIOB7gUwEqdv3SuW9fYdbhdSFc6bJ8oWzfWfQaMLqnv3H5Kdrt6y2jRg6UF7dVCL6coBMbZnwzVRbOA8CCCDgFSCoejXYRwABXwp0NkjdutsSUhNfFbrohWmybIH/Qqo7CA2NjfL+R0fl2o07bpXzOWr4EHll02rR165mYuusbybawDkQQACBtgQIqm2pUIcAAr4S6EyQunX3gXMntbau3urTornTZdn8WVadHwv1DQ2m/Ufkxu17VvPGjBom2zeukoKCfKs+nUJnfNO5Ht9BAAEEkhUgqCYrxXEIIJAzgXSD1M0792XXh0ckMaQunjtDls6fmbP+pHrhuvp6M7f2sGjo9m7FY0bI1vUrJD+/c2E1XV9vW9hHAAEEsiFAUM2GKudEAIGMCqQTpDSkvmdCal3CndQl82bIknnBCakupE5b2Gle86qrFni3Cc+Pli3rlkleXp63OqX9dHxTugAHI4AAAmkKEFTThONrCCDQdQKpBin9mXzXh0dF70R6t2XmLuoiczc1qJuu+7rTvElL36jl3SaPHyObSpZKLBbzVie9n6pv0ifmQAQQQKCTAgTVTgLydQQQyL5AKkGqJaSaO6n1DVbDli+YJQtfmG7VBbFQWV0jO/cckNKycqv50yaNk42rFqUVVlPxtS5KAQEEEMiyAEE1y8CcHgEEOi+QGKQ6f8bgnGH5QhOw59gBu6KyWt4yYfXR4wqrI7Omjpd1KxZadTo/V9eO1eW5kt3+8OYbyR7KcQgggEBWBQiqWeXl5AggkAmBKAdV9Vu95AWZO3OKRfmovFLeNmG1vKLKqp87c5I5fp5Vpy840CkD98yrY5PZCKrJKHEMAgh0hQBBtSuUuQYCCHRKIOpBVfHWLp8vs6dNtBzLHpfLW7sPSGVVjVW/cM5U8xID+01bVTq/1Rz7oOyxdWxbBYJqWyrUIYBALgQIqrlQ55oIIJCSAEG1hUvnoE6fXGzZafDUAKpB1Lu1tbpBZZWZMmCOLUuYMuD9nu4TVBNFKCOAQK4ECKq5kue6CCCQtEBiUG0vSOnbnHQr6OTaokk3zgcH3istMw9YHWz1etiVi2bL/NnTOmxhKr4dnowDEEAAgQwKuEH1/wEAAP//kJBNYgAAI9VJREFU7d2HmxzFmcfxd1c55xxQDiCJKJISSgiEBAhEtn2cbWyfH99z4Q+557ngu/PZgAPBJgmEEEKgnHPOEeWc82pXV2+tutXT2zvduzvTPfR+63m8O9Nd0+HTg/Xb6qrqolumCAUBBBAoQIF/+78PM47qX3/xWsZ73ogcO3lGPvlqrty4UZLBMfrxB+T+Qf0zlvnf4OsX4T0CCBSKwOVr5f+fVkRQLZRLwnEggIBfgCDlFwl+f+T4Kfn0q3lScvNmRoXxI4fK4AF9MpZ53+Dr1eA1AggUkgBBtZCuBseCAAKBAgSpQJbAhQePnJBps+bLzZulGeufHv2YDOzbI2OZ8wZfR4LfCCBQaAIE1UK7IhwPAghUECBIVSDJuuD7Q8fk81kLpLSszK1XVFQkz4x9XPr16u4uc1789o+fyHVPlwG6Vjgy/EYAgaQFCKpJXwH2jwACoQIE1VCiChX2fn9Ypn+7SMrK7gw/KC4uksnjRkjvHl0y6h89cdp0GTD9W0vKuwwQVDN4eIMAAgkKEFQTxGfXCCAQTYCgGs3JX2vX3oMyY84S8Y6VrVNcLM9NGCk9unXKqH742En5bKb2by0VgmoGDW8QQCBBAYJqgvjsGgEEogkQVKM5BdXavnu/zJy7LGNV3Tp1ZMrTo6Rb5w4Zyw8cPm77t/7Tz17JWM4bBBBAICkBgmpS8uwXAQQiCxBUI1MFVty8fY/MXrgyY129unXlhYlPSJeO7TKW7z94tEJra0YF3iCAAAIxChBUY8RmVwggUD0Bgmr13LyfWr9lp8xdssa7SOrXqytTJ42Vju1aZyznDQIIIFAoAgTVQrkSHAcCCFQqQFCtlKZKK9Zs3CYLlq/P+EzDBvVNWB0j7du0yljOGwQQQKAQBAiqhXAVOAYEEMgqQFDNylOllSvWbpYlqzdlfKZRwwby8uSx0qZVi4zlvEEAAQSSFiCoJn0F2D8CCIQKEFRDiapUYcmqDbJi3daMzzRp3NCE1XHSqkWzjOW8QQABBJIUIKgmqc++EUAgksB/vfuJmePzzjPsf/HG89K0SaNIn6VSsMCC5WtlzcYdGSubNWksLz87Vlo0a5qxnDcIIIBAUgIE1aTk2S8CCEQW+PDz2aKT0julZ/fOMn7Ew4RVB6Sav+csXiUbtu7O+HSLZk1MWB0nGlopCCCAQNICBNWkrwD7RwCBUIGgEeuhH6JChkDnDm3tdFT169Vzl+uDAGYvXCFbduxzl+kLvf2v3QC0OwAFAQQQSFKAoJqkPvtGAIFIAmXmmfUfmFbVE6fORqpPpWCBrp3a24n+dQ5Vp2hY/XreMtm++3tnkf3dplVzecmE1cZmoBUFAQQQSEqAoJqUPPtFAIEqCVy6clU+n7WAsFoltYqV7+ra0T5CVZ9O5RT9Q0Aftbp73yFnkf3dvk1LO8+qTmFFQQABBJIQIKgmoc4+EUCgWgIaqDZu2y3bdu2X02cvZAywqtYGa+mHepk+vpOfHCF1iotdgVJjO332Itl34Ii7TF90at9GXjF9Vos9dTMq8AYBBBDIowBBNY+4bBoBBBD4IQncLC21rdYHDh/POOwpT40SHcBGQQABBOIWIKjGLc7+EEAAgQIWKLl5U6Z9PV8OHT3pHuXrUybwmFVXgxcIIBCnAEE1Tm32hQACCPwABHTO2gXL18nxk2fk7n495YFB/X8AR80hIoBAGgUIqmm8qpwTAggggAACCCCQAgGCagouIqeAAAIIIIAAAgikUYCgmsaryjkhgAACCCCAAAIpECCopuAicgoIIIAAAggggEAaBQiqabyqnBMCCCCAAAIIIJACAYJqCi4ip4AAAggggAACCKRRgKCaxqvKOSGAAAIIIIAAAikQIKim4CJyCggggAACCCCAQBoFCKppvKqcEwIIIIAAAgggkAIBgmoKLiKngAACCCCAAAIIpFGAoJrGq8o5IYAAAggggAACKRAgqKbgInIKCCCAAAIIIIBAGgUIqmm8qpwTAggggAACCCCQAgGCagouIqeAAAIIIIAAAgikUYCgmsaryjkhgAACCCCAAAIpECCopuAicgoIIIAAAggggEAaBQiqabyqnBMCCCCAAAIIIJACAYJqCi4ip4AAAggggAACCKRRgKCaxqvKOSGAAAIIIIAAAikQIKim4CJyCggggAACCCCAQBoFCKppvKqcEwIIIIAAAgggkAIBgmoKLiKngAACCCCAAAIIpFGAoJrGq8o5IYAAAggggAACKRAgqKbgInIKCCCAAAIIIIBAGgUIqmm8qpwTAggggAACCCCQAgGCagouIqeAAAIIIIAAAgikUYCgmsaryjkhgAACCCCAAAIpECCopuAicgoIIIAAAggggEAaBQiqabyqnBMCCCCAAAIIIJACAYJqCi4ip4AAAggggAACCKRRgKCaxqvKOSGAAAIRBW7duiUXL1+Rxo0aSt06dSJ+imrrt+yUK1evWYi+PbtLuzYtQUEAgTwIEFTzgMomEfAKnDp7XmbPX+4uGj1sqHRq39p9zwsEkhDYtG23rN+6S86euyg3S0ulqKhIunRsJy9PHpvE4fzg9vnnj2eK/ret5enRj8nAvj3sa34ggEBuBQiqufVkawhUEDh64rR8+Plsd/nUZ8ZI9y4d3Pe8QCBM4NyFSzZItmjWJKxq6PqSmzdl2tcL5NDRExXqdmjbSt544akKy1lQUYCgWtGEJQjkQ4Cgmg9VtomAR4Cg6sHgZZUF1m7aLvOXrRMNqT977dkqf97/gYXL18nqjdvtYm1FvadfT9uS2qRxI2nVopm0aN7U/xHeBwgQVANQWIRAHgQIqnlAZZMIeAUIql4NXldVYPaCFbJ5x96cBNXzpmX23Y++krKyMnsYz44fIX16dq3qIVHfCBBU+RogEI8AQTUeZ/ZSiwUIqrX44ufg1D+eMVcOHjmek6C6fff3MnPuUntUnTu0lVefG5+DI6ydmyCo1s7rzlnHL0BQjd+cPdYyAYJqLbvgOT7dP3wwXS5cupyToLp09UZZvnaLPcJ77+4rY4c/lOOjrT2bI6jWnmvNmSYrQFBN1p+91wIBgmotuMh5OsWyslvy72//TXQKqVz0Uf163jLZtmu/PdrhD98rD993d56OPP2bJaim/xpzhoUhQFAtjOvAUaRYIGpQvXLtupw7f1EaNqgvrVs2zxA5fe6CHDh0TIqLi6Rj+7aio7P9RcPMwSMn5My586Iju9u2ailtzdyOzZo09lfN+v6sOYaTp8/KaTP1TlMzwKZtm9ZmjsgWkefY1OM4cfqcPZez5y9Ivbp1pFnTptK1U3szV2eDrPuubOX1GyVy4tRZ878zUr9eXXNMraRt6xZm23Ur+0jo8qzeZy/I0RMn5fKVa9avnfFu07KF9Q/dsKfCDXPcJ8+cs56GxTi2svNtNqhfz1Or8pc62v+dv35pK+QiqOptf739r2XkI/fJQ/cOtK+j/qjJ+Zw03wn9Xmpp2bxZ6HdBv0M3nfpmkFfjhpnfnXxfP/0enzpz3nwPTslV899me/PfQXvzPWjSuKE9B4KqZeAHAnkXIKjmnZgd1HaBqEF16859MsvMt6ojsZ97coT0uquL6LIlqzbaCdm9jgP69JCJYx5zF+3ae1AWmNHceovYX/QW76hH75e6JjBWVjQIzlu6RnQ7Tpjw1m3apJFMGPWo3NW1o3dxhde79x2Sxas2mLB8ocK6OsXF0rtHlwohXEeb6zEGle9NONfjCtqeOj0wuJ8MG3pv5BDt3UeQ9/mLl2WWaXU8fOykt6p9rSPinxk7zIaVCit9C/TzcxatcufZ9K02obe5jB0x1IZ3/zqdfH/p6k1ywRzLuQsX5eKlK7ZKsfEL+qPj9SlPSiNfiPNuc9WGrbJx6x676Oq1a3KjpDws6h9EDerX91aVzh3b2jlBMxaaNzU5H2db73/2jRw3f2hoGT9yqAwe0MdZFfg7LAjm8/otMd/hdZt3ulbeA9T/9vT4P5w2272+zKPqFeI1ArkVIKjm1pOtIVBBoKpBVTegt2Trm1a3xSs3VNies+DJUQ/LoP69RZ+QM2/pWnt72Fnn/92hbWvRQKPhzl/2Hjgi3y1cKZeuXPWvynivnx0z7MFKQ+XCFetl9YZt7mf0+FuaqY60FU4DoLZQBRWdZP6VZ8dlrCo1o9IXme1pWPB+TkOttrJpsHaKBsjJJti3bdXCWRTptxN0tPLQ+wZK984d5as5S+Ta9RuVfr6OeXLT8xNGVhrY9biXmGu2ZtOOjOMO2qATtIcPvU/q1Cl2q2jL8XufzXLfh7341Y+n2KdKVVZPr4lemyile5eOMvWZ0W7VXJyPs7F8BVXdfq6un35XvzKtzvvMfxPeon8kODMl6HK943HdfE8u334yFUHVq8VrBHIrQFDNrSdbQ6CCQHWCqt4a1jCmt7cHD+gtPbp1tiFz/8EjJsBtsK2e+sjLF55+Qv76xbf2yUI6H+aQu/vZcHj+4iUbYDWMOWW8acEbPDCzFUsnff/oyzlOFbOfTnLvwL7SulVz2wVBb33qABynhVGP66evTq7Qgrdn/2H5YvZCux1t3Rsz7CHp37u7u129Tbtg2Vq3f6SuGNDnLnsLWM+vWdPM7gnevpTa8qe3qfv26m5aAMtvmes0S4tNS/OOPeW3sTu2ay2vPR8cxN2D8L3wBlVtqdSgXmzCuD5hSANbl07tpKSk1EyMf9yaX79RHmD1mvxk6kTf1srfOlNJOSv13Pr06GZbYTWYateFXfsPyqZt5S2cWu+e/r1Ma/UjzkdswN20fY8N5Hr727mG6vDoA/e49ZwXg8310u4VlRUN+tol5LxpndUnUekteC36B0Jf39RU2kXDuywX5+McVz6Daq6un/634H0QwoNDBkg/871r17qlaGg/fvKMbDRP9Nq594BzWvY3QTWDgzcI5FSAoJpTTjaGQEWB6gRV3Uq3zu3luQmjbJ9M71b1H8kZ3y2xi7S/pt7KfezBQeZ/g73V7OtvzBycW8wcnFr0H/O33njOvvb+mD57kb29PMKEwaAnZmnQ+fMnX9s+q/o57deowdFbvP/ATx433ITKbt7V7msN1UeOn7LvNexp6POXw8dOyd+mf2sXazj70YtPS3NfkHU+M9+E37Wm9VKLtvbed08/Z1Xob29Q1cpNTPCfZOYV7WJuf/vLcdPK+cG0b9xW0qBzPHrijPmjYbatoy1wT458WO42fzwEFd33bNOKra10GmA1ZGvY9hftSjH920V2ca77qD4wqJ888fiD/l2673N9PvkMqnrQNb1++w8elc++nm/PX6/fxDGPm5Aa/D32zp6gHyCoWjZ+IJAXAYJqXljZKAJ3BKoTVLWF8aevTM64JXxniyK/f/8Lt9+qDnj6+evPmoE+d24fO3W9g3F02a//7kXbUuqsj/p7s2nh02ClpVvnDvLSpDHuRzXI/vaPn9jArMH5N3//krvO/2KjadH7bvFqu3icmRppSEDfVL3trbe/tUx44hHz5KRe9nXQD71V+7YZbKSDXdTsrdcrBvGgz+kyb1DV1uk3XpgQ2AfU+fznsxaIdpPQoreaRzycGdb1Mbl6rbVoQH3qiUft68p+zJy7zAxs2m9Xd2rfxoZVf90kg2quzyefQTUX1897fFGu358+nun+8UZQ9X9zeY9A7gQIqrmzZEsIBApUJ6hmu72sO3EmgdfXPbt3lilPjdKXgeU/3vnI3EYutetee36CdGpfseUu8IOehdoKqq2hWnRg1S/eeN5dq306//tPn9r32nfvzZefcdf5X2jfv2km8GkJapk9ZWYa0EE0WnRE/6/ffFF0EFa2oi2OGui0/ObNqbZvb7b6zjpvUA3z1s8sMV0gVtyeg7Rvz24yefxwZ1N2UI1z3NpCqq3FbUz3iWxFb8H/5dOv3SpvvjzJ9H1s5r7XF0kFVe91yNX5eINgLgdTqVNNr5+2mL9/u1+wnu+Ppz4d2uc5bLCXHhcFAQRqLkBQrbkhW0Agq0A+gqp3mqH7zS3c0Vlu4b794ZdmMNMle4yTza1tbx/ErAfuWamDod7+cLq75F/eejVjYJbTuqSDjf7RtKjqNFpBRW/T6+16LXprVfupestOM+vAjO8W20U6ndXEsY97Vwe+1vC4wbTUatFb6No6GaVUNah6W4P9LaC7TFD+8vYt+uZNm9gW7ijH8Lv3PjdTYJUPYnvuyZF2VgTv55IKqvk4n6SDarbrt8NM2aWDqLREbZknqHq/qbxGIH8CBNX82bJlBKxAPoKqd7DRA4P7yxOPPVCp9jt/nWGnOdIKk8YNs4NDKq3sWaG39PWW+rXrJXLWTDflDJbSKv/881czwujcJavN4K3ysDjyUTM/55CK83PeLC2Vv5i+rjpPq7Za6aAs7XfpLcvWbJJlazZ7F1XpdVD4rWwDVQ2qm7bvlm8XrrKb01kUtKuAU1as22KnEdP3QbMYOPX8v72310eYCfiH+ibgTyqo5uN8kg6q2a7f8rWb7ZRgen2iPlqWoOr/NvMegfwIEFTz48pWEXAFfihBVft77jMDSnRmgRNmwn8NlE6XAfdkbr/wB1W9VfyxGTGtwVZv1eto6Xvv6Wv7fJaWlsmxk6dloZnnVS20PHL/PWb+0yG3t3bn1zdmHtktt2cq0OmtGtQrH+V/p0blr3SKp2fMQK6ghyEEfSqXQdX7h4O2EmtgjlK09VhbkbX4R//rsqSCaj7Op5CDqvd8+/e+y8yXG379CKr6DaUgkH8Bgmr+jdlDLRco9KCqQVIn6dcpk26UlGRcLW35bKQTw5v/aXB1ij+o6nJ9etanM+ZmzMeq/Uy1JVVbZ52i0/1oENBt+4t3NPWQu/vIuOFD/VVy9j6XQfXbRSvdKaf8/VezHfAX3yyUPd8ftlX0oQdjzQAzb0kqqObjfH44QVW/n8O8lyHwNUE1kIWFCORcgKCac1I2iECmQCEHVZ3aSkezO3NH6hQ/+kSsXt27SAcz6Erfa6D091ENCqr6RKtv5q+wc0xqQPU+4aq+aRnVx0/qFFo67VZlRR/vqf1vtWi9lyaNraxqjZfnMqiu3bTd9L1dZ4/J338124G+96mZ4cC0XmvRfsba39hbkgqq+TifQg6q3oFyUbtuEFS931ReI5A/AYJq/mzZMgJWoJCD6qcz54k+plRL7x5d7ZRKzqT6duHtH2FBtazslpmJYI59MEBvE3QnmRHxZaal9rx5pGujBg3c56N7txn02jv6Wp+p/ssfTQmqlpNluQyq3jk4Ndz/0jwtKkrR2RKcJ2G9OHF0hSdeJRVU83E+3jl0o8x5GxYEc3n9vNOv6dPUtP90WAk7vrDPsx4BBKIJEFSjOVELgWoLFGpQ1f6k//uXafa2vM5/+qufvCB1zaj9oBIWVLfs3GtbU/WzOlWWTplVnVJiWng1vOlTgLQ8b7bVq5rbCtt/LoPOhUtX5A8ffOHuMih0uitvv9h34KiZqmu+u1in/NKpv7wlqaCaj/PxzlQRNDWZ97z1dVgQzOX10z/W9I82LXag3yuTpIUJrNmKM9OF1mEe1WxSrEOgZgIE1Zr58WkEQgUKNah6W830qUivT7kzit1/Uv5z8N/6X2IeZ6ojxbXorW99ylXnDu0yZgbwb7Oy94vMc+lXmefTa2lj5mX9yUsTA/uzVvb5qMtzGXR0n94g5n8oQtAxeZ/mVdkALP+jaf/B/DFRk+I9xrAnU3nr5uJ8vLfXw7pHHDxyXLT/rnZN0RIUBHN5/XTQoP6hoY/61RI2k8aq9Vtl0coNtq7+CDo+dyUvEECgRgIE1Rrx8WEEwgX8IW/qM2MCH1ValX94vaOUw/5RrWx6Ku9Tq7RF9S3Tohd0218n+9fHrF65es09WX9QPXD4uHzy1Vx3vb5wBmI1bNjAPga2gekC0LxZY2ndopnpB9tVWpnfQUX7tr77txly6XL5/KI9unWyXRL06UP+onVXm1C7Yetu+xhZHZAUtVTFW7eZbXojXa/H+8ePZrjhalD/XjJ2xNAKDyzQ1uLvFq1yH22r9m+aFjx9wpi/6BO69EldTnnl2fHuI151gJq2QOvsCFGLN3yGBdVcn8/BIyds9xDnWPXJXUGPmF23eYcsWL7ePl7WqRsUBHN9/bxTctWtW0cmjHxE+vvm+dXjWWwC6koTVL0l6Pi863mNAALVFyCoVt+OTyIQSaBQg6oe/O/em2YmnC8PoN27dLDPfm/bqoUdCKVPTtq8Y48JVPvsyP8yE4yc/pT+oKrb0n+8tWXVO8Jfl1dWdEJ/fQBBo4b1K1TZpRP/z1nibquxCbt9zXPX27VuaW6PN5YLpu+rDkLaueegO1NB2GNn/TvJddDR7WvImre0/IEG+l4tNWh3aFf+EIITp8/IfnPL/+SZc7raFp0DV//YCCoaRP/nz5/ZmRN0vc47qwG4ngm3m7bvFQNkn6IU9PjcoO1VJajq53N9Pp98NU8OHC7vE63bH9i3h3Qz34N6ZrCdDug7ZFpSdfYIvd56PbXPspagIJjr63fdTM/2hw+my/UbN+w+9Yf2t9bWX531QoO2tvRqlxmda1X/QNC7ElqCjs+u4AcCCNRYgKBaY0I2gEB2gUIOqt7b/85ZaOgpu91HVJfpvKSTTKBcsGyN7N5fPpWSP6heuXpddNL/nXsP2NH9Pbt1Ni2MV+SqebxqiZnySv9x10Csv70l26MvtSV31rzl7sMKvJ/zv9YJ+Cc/OVz0qVBRS66DjrNf7Xs6e+EK94lTznL/bx0sNt602oX1wV26epPohPSVlao8bayqQVX3mcvz0RA6beZ8+4dGZedTfi1HiA5wcs47KAjm4/rpH2fTZy+0s1xUdnw6z6q2BmsLbLbjq+zzLEcAgaoJEFSr5kVtBKosUMhBVU9Gw6pOxq+T9nuLtl4OHthb9Ha63sbfseeAfLNguX0IgDeoHj520vYn1NZWrT922EOmb2qxd1Puax2UtWnbblm9cbsbhoOece98oMT0HVxhQpq2ZJ06cz5jyqsG9eubKazamRbG3nZKLeczUX/nI+g4+1YLfcrWURO2T5+94B633lLWVtaOppXusQeHBLYmO9twfusfDcvNY2K1X6QzyEyvh4b8kY/cX2GmAOdzQb+rE1R1O7k8H225nLN4tew9cFj0IRNO0a4d2lqsU5jpwxu0NXWaGeCk/UbjCqp6LPrHlLaKHzYtvBfNH1tOaW36S+v0YU73krDjcz7HbwQQqJkAQbVmfnwagdQIaIvnuQsXTcisY267NgrsMxl0ss7obJ079Zc/ej5Sn8lpZu7WfQeO2M1V5bGu+tABDTqNG5lbw6YLgAa2Qi/aFeLs+UvmMG/ZfrnVPWZ9cILztDANqeqdRMnV+eixn79wyYbBJqZ/rk4LVV2bfDlcunLV9j3W75q2gFMQQCB+AYJq/ObsEYHUCGiL53++85E9n7CR3N6T1turTjeCn5k5K8OmAvJ+ltcIIIAAArVHgKBae641Z4pAXgR+//4XtlWsjrnd/+OpE6V1y+DR/M7Oj508Ix9/OcfeDm/ZvJmZXH2Ss4rfCCCAAAIIZAgQVDM4eIMAAlUVmL9srazdtMN+TJ/K9OiDg2RAnx4VprrS6Y62mgcDrDTTSWnfRL11/fKz4+xgraruk/oIIIAAArVDgKBaO64zZ4lA3gS0z+L0bxfLnv2H3H1oX0PtR9qkUSM7xZT29fOO+Nf5Wp8e83joiHd3g7xAAAEEEKiVAgTVWnnZOWkEcitQVnZLtu/eb+bd3GlGa5+pdOP1zXyZ9w/qKw8OGSgNzdyUFAQQQAABBLIJEFSz6bAOAQSqLKBzZdrR3GZSfp1LVSenb9m8ubQ0T6LSp1HVM1M0URBAAAEEEIgiQFCNokQdBBBAAAEEEEAAgdgFCKqxk7NDBBBAAAEEEEAAgSgCBNUoStRBAAEEEEAAAQQQiF2AoBo7OTtEAAEEEEAAAQQQiCJAUI2iRB0EEEAAAQQQQACB2AUIqrGTs0MEEEAAAQQQQACBKAIE1ShK1EEAAQQQQAABBBCIXYCgGjs5O0QAAQQQQAABBBCIIkBQjaJEHQQQQAABBBBAAIHYBQiqsZOzQwQQQAABBBBAAIEoAgTVKErUQQABBBBAAAEEEIhdgKAaOzk7RAABBBBAAAEEEIgiQFCNokQdBBBAAAEEEEAAgdgFCKqxk7NDBBBAAAEEEEAAgSgCBNUoStRBAAEEEEAAAQQQiF2AoBo7OTtEAAEEEEAAAQQQiCJAUI2iRB0EEEAAAQQQQACB2AUIqrGTs0MEEEAAAQQQQACBKAIE1ShK1EEAAQQQQAABBBCIXYCgGjs5O0QAAQQQQAABBBCIIkBQjaJEHQQQQAABBBBAAIHYBQiqsZOzQwQQQAABBBBAAIEoAgTVKErUQQABBBBAAAEEEIhdgKAaOzk7RAABBBBAAAEEEIgiQFCNokQdBBBAAAEEEEAAgdgFCKqxk7NDBBBAAAEEEEAAgSgCBNUoStRBAAEEEEAAAQQQiF2AoBo7OTtEAAEEEEAAAQQQiCJAUI2iRB0EEEAAAQQQQACB2AUIqrGTs0MEEEAAAQQQQACBKAIE1ShK1EEAAQQQQAABBBCIXYCgGjs5O0QAAQQQQAABBBCIIkBQjaJEHQQQQAABBBBAAIHYBQiqsZOzQwQQQAABBBBAAIEoAuVB9ZYU3TIlygeogwACCCCAAAIIIIBAHAKXr92wuyGoxqHNPhBAAAEEEEAAAQQiCxBUI1NREQEEEEAAAQQQQCBOAYJqnNrsCwEEEEAAAQQQQCCyAEE1MhUVEUAAAQQQQAABBOIUKA+qRQymihOdfSGAAAIIIIAAAgiECxBUw42ogQACCCCAAAIIIJCAAPOoJoDOLhFAAAEEEEAAAQTCBQiq4UbUQAABBBBAAAEEEEhAgKCaADq7RAABBBBAAAEEEAgX4MlU4UbUQAABBBBAAAEEEEhAgOmpEkBnlwgggAACCCCAAALhAgTVcCNqIIAAAggggAACCCQgwPRUCaCzSwQQQAABBBBAAIFwAYJquBE1EEAAAQQQQAABBBIQYNR/AujsEgEEEEAAAQQQQCBcgFH/4UbUQAABBBBAAAEEEEhAgKCaADq7RAABBBBAAAEEEAgXYNR/uBE1EEAAAQQQQAABBBIQYDBVAujsEgEEEEAAAQQQQCBcgKAabkQNBBBAAAEEEEAAgQQEGPWfADq7RAABBBBAAAEEEAgXYDBVuBE1EEAAAQQQQAABBBIQYDBVAujsEgEEEEAAAQQQQCBcgD6q4UbUQAABBBBAAAEEEEhAgD6qCaCzSwQQQAABBBBAAIFwAfqohhtRAwEEEEAAAQQQQCABAYJqAujsEgEEEEAAAQQQQCBcgD6q4UbUQAABBBBAAAEEEEhAgKCaADq7RAABBBBAAAEEEAgX4NZ/uBE1EEAAAQQQQAABBBIQIKgmgM4uEUAAAQQQQAABBMIFuPUfbkQNBBBAAAEEEEAAgQQEyltURYpumZLA/tklAggggAACCCCAAAKBAtz6D2RhIQIIIIAAAggggEDSAtz6T/oKsH8EEEAAAQQQQACBQAGCaiALCxFAAAEEEEAAAQSSFuDWf9JXgP0jgAACCCCAAAIIBAowmCqQhYUIIIAAAggggAACSQtw6z/pK8D+EUAAAQQQQAABBAIFuPUfyMJCBBBAAAEEEEAAgaQFCKpJXwH2jwACCCCAAAIIIBAowK3/QBYWIoAAAggggAACCCQtQItq0leA/SOAAAIIIIAAAggEChBUA1lYiAACCCCAAAIIIJC0ALf+k74C7B8BBBBAAAEEEEAgUKA8qIoU3TIlsAYLEUAAAQQQQAABBBBIQKD81j9BNQF6dokAAggggAACCCCQTYBb/9l0WIcAAggggAACCCCQmAC3/hOjZ8cIIIAAAggggAAC2QQY9Z9Nh3UIIIAAAggggAACiQnQopoYPTtGAAEEEEAAAQQQyCZAUM2mwzoEEEAAAQQQQACBxAQIqonRs2MEEEAAAQQQQACBbAIaVHX+VOZRzabEOgQQQAABBBBAAIHYBQiqsZOzQwQQQAABBBBAAIEoAtz6j6JEHQQQQAABBBBAAIHYBS6ZW/9auPUfOz07RAABBBBAAAEEEMgmwK3/bDqsQwABBBBAAAEEEEhMwL31v/fwZR1URUEAAQQQQAABBBBAoCAEiopE2raqK0UE1YK4HhwEAggggAACCCCAwG0BN6jeMgUVBBBAAAEEEEAAAQQKRcC99U9QLZRLwnEggAACCCCAAAIIqIAz6v//AVF1JuyA5OadAAAAAElFTkSuQmCC';

  const [imageSrc, setImageSrc] = React.useState(textPlaceHolder);
  const [imageRef, setImageRef] = React.useState<any>();

  const func = {
    onLoad: event => {
      event.target.classList.add('loaded');
    },
    onError: event => {
      event.target.classList.add('has-error');
    },
  };

  React.useEffect(() => {
    let observer;
    let didCancel = false;

    if (imageRef && imageSrc !== src) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (!didCancel && (entry.intersectionRatio > 0 || entry.isIntersecting)) {
                setImageSrc(src);
                observer.unobserve(imageRef);
              }
            });
          },
          { threshold: 0.01, rootMargin: '75%' },
        );
        observer.observe(imageRef);
      } else {
        // Old browsers fallback
        setImageSrc(src);
      }
    }
    return () => {
      didCancel = true;
      // on component cleanup, we remove the listner
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageSrc, imageRef]);

  return (
    <StyledImage
      ref={setImageRef}
      height={height}
      width={width}
      placeHolder={placeHolder}
      src={imageSrc}
      onLoad={func.onLoad}
      onError={func.onError}
    />
  );
};

const StyledImage = styled.img<{ width?: string; height?: string; placeHolder: string }>`
  display: block;
  max-width: ${({ width }) => width ?? '200px'};
  max-height: ${({ height }) => height ?? '120px'};
  // Add a smooth animation on loading
  @keyframes loaded {
    0% {
      opacity: 0.1;
    }
    100% {
      opacity: 1;
    }
  }
  // I use utilitary classes instead of props to avoid style regenerating
  &.loaded:not(.has-error) {
    animation: loaded 300ms ease-in-out;
  }
  &.has-error {
    // fallback to placeholder image on error
    content: ${({ placeHolder }) => `url(${placeHolder})`};
  }
`;
