import { createCanvas, Canvas as GCanvas } from '@antv/f2-graphic';
import { deepMix, isFunction } from '@antv/util';
import Component from '../base/component';
import Layout from '../base/layout';
import equal from '../base/equal';
import Animation from './animation';
import { px2hd as defaultPx2hd, batch2hd } from '../util';
import { createUpdater } from '../base/updater';
import defaultTheme from '../theme';
import { renderChildren, renderComponent } from '../base/diff';
import EE from '@antv/event-emitter';

export interface ChartProps {
  context?: CanvasRenderingContext2D;
  pixelRatio?: number;
  width?: number | string;
  height?: number | string;
  padding?: number | string | (number | string)[];
  animate?: boolean;
  children?: any;
  px2hd?: any;
  theme?: any;
  style?: any;
  el? string;
  createImage?: () => HTMLImageElement;
  /**
   * 是否横屏
   */
  landscape?: boolean;
}

function measureText(canvas, px2hd) {
  return (text: string, font?) => {
    const { fontSize, fontFamily, fontStyle, fontWeight, fontVariant } = font || {};
    const shape = canvas.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        fontSize: px2hd(fontSize),
        fontFamily,
        fontStyle,
        fontWeight,
        fontVariant,
        text,
      },
    });
    const { width, height } = shape.getBBox();
    shape.remove(true);
    return {
      width,
      height,
    };
  };
}

// 顶层Canvas标签
class Canvas extends Component<ChartProps> {
  canvas: GCanvas;
  container: GCanvas;
  animation?: Animation;
  layout: Layout;
  theme: any;

  private _ee: EE;

  constructor(props: ChartProps) {
    super(props);
    const {
      context,
      pixelRatio,
      width,
      height,
      animate = true,
      px2hd: customPx2hd,
      theme: customTheme,
      style: customStyle,
      createImage,
      landscape,
      el
    } = props;

    const px2hd = isFunction(customPx2hd) ? batch2hd(customPx2hd) : defaultPx2hd;
    const theme = px2hd(deepMix({}, defaultTheme, customTheme));

    // 创建G的canvas
    const canvas = createCanvas({
      context,
      pixelRatio,
      fontFamily: theme.fontFamily,
      width,
      height,
      createImage,
      landscape,
      el
    });

    // 组件更新器
    const updater = createUpdater(this);

    // 供全局使用的一些变量
    const componentContext = {
      root: this,
      canvas,
      theme,
      px2hd,
      measureText: measureText(canvas, px2hd),
    };

    // 动画模块
    const animation = new Animation(canvas);

    this.canvas = canvas;
    this.container = canvas;
    this.context = componentContext;
    this.updater = updater;
    this.animate = animate;
    this.animation = animation;
    this.theme = theme;
    this._ee = new EE();

    this.updateLayout(props);
  }

  renderComponents(components: Component[]) {
    if (!components || !components.length) {
      return;
    }
    renderComponent(components);
    this.draw();
  }

  update(nextProps: ChartProps) {
    const { props } = this;
    if (equal(nextProps, props)) {
      return;
    }

    this.props = nextProps;

    this.render();
  }

  resize(width?, height?) {
    const { width: canvasWidth, height: canvasHeight } = this.canvas._attrs;
    this.canvas.changeSize(width || canvasWidth, height || canvasHeight);
    // this.canvas.clear();
    // this.children = null;
    this.updateLayout({ ...this.props, width, height });
    this.render();
  }

  updateLayout(props) {
    const { width: canvasWidth, height: canvasHeight } = this.canvas._attrs;
    const style = this.context.px2hd({
      left: 0,
      top: 0,
      width: props?.width || canvasWidth,
      height: props?.height || canvasHeight,
      padding: this.theme.padding,
      ...props.style,
    });
    this.layout = Layout.fromStyle(style);

    this.context = {
      ...this.context,
      left: this.layout.left,
      top: this.layout.top,
      width: this.layout.width,
      height: this.layout.height,
    };
  }

  draw() {
    const { canvas, animate } = this;
    if (animate === false) {
      canvas.draw();
      return;
    }
    this.play();
  }

  play() {
    const { canvas, animation } = this;
    // 执行动画
    animation.abort();
    animation.play(canvas, () => {
      this.emit('animationEnd');
    });
  }

  render() {
    const { children: lastChildren, props } = this;
    const { children: nextChildren } = props;
    renderChildren(this, nextChildren, lastChildren);
    this.draw();
    return null;
  }

  destroy() {
    const { canvas } = this;
    canvas.destroy();
  }

  on(type: string, listener) {
    this._ee.on(type, listener);
  }

  emit(type: string, event?: any) {
    this._ee.emit(type, event);
  }

  off(type: string, listener?) {
    this._ee.off(type, listener);
  }
}

export default Canvas;
