import * as React from 'react';
import { browserReport } from "pili-rtc-web";
import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { CircularProgress } from 'material-ui/Progress';

import { inject, observer } from 'mobx-react';
import { WechatPage } from '../WechatPage';

import { ErrorStore } from '../../stores';

import * as styles from './style.css';

interface State {
  showWechatTooltip: boolean;
}

interface Props {
  error?: ErrorStore;
}

@inject('error')
@observer
export class Root extends React.Component<Props, State> {
  state = {
    showWechatTooltip: false,
  }

  componentDidMount() {
    if((window as any).WeixinJSBridge) {
      this.setState({
        showWechatTooltip: true,
      });
      return;
    }
    document.addEventListener("WeixinJSBridgeReady", () => {
      this.setState({
        showWechatTooltip: true,
      });
    }, false);

    if (!browserReport.support) {
      this.props.error.showAlert({
        show: true,
        title: '浏览器不兼容',
        content: 'SDK 暂时不支持您的浏览器，或者您的浏览器不支持 WebRTC。请使用最新版 Chrome 访问',
      });
    }
  }

  renderDevTool() {
    if (process.env.NODE_ENV !== 'production') {
      const DevTools = require('mobx-react-devtools').default;
      return <DevTools />;
    }
  }

  render() {
    if (this.state.showWechatTooltip) {
      return (
        <div className="container">
          <WechatPage />
        </div>
      );
    }

    return (
      <div className="container">
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={this.props.error.toastError.show}
          autoHideDuration={3000}
          onClose={this.props.error.closeToast}
          message={<span>{this.props.error.toastError.content}</span>}
          action={[
            <IconButton
              onClick={this.props.error.closeToast}
              key="close"
              style={{"color": "#fff"}}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />

        <Dialog
          open={this.props.error.alertError.show}
          onClose={this.props.error.closeAlert}
          id="dialog"
        >
          <DialogTitle>{this.props.error.alertError.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{this.props.error.alertError.content}</DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={this.props.error.alertError.onCancel || this.props.error.closeAlert}
            >{this.props.error.alertError.cancel || '好的'}</Button>
            { this.props.error.alertError.onEnter && <Button onClick={this.props.error.alertError.onEnter}>
              {this.props.error.alertError.enter || '确定'}
            </Button> }
          </DialogActions>
        </Dialog>

        <Dialog open={this.props.error.loading.show}>
          <DialogContent className={styles.loadingContent}>
            <CircularProgress className={styles.loading} />
            <DialogContentText>{this.props.error.loading.content}</DialogContentText>
          </DialogContent>
        </Dialog>

        {this.props.children}
      </div>
    );
  }
}
