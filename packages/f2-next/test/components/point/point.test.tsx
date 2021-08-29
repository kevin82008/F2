// @ts-nocheck
import { jsx } from "../../../src";
import { Polar, Rect } from "../../../src/coord";
import { Canvas, Chart } from "../../../src";
import { Point } from "../../../src/components";
import { createContext } from "../util";

const url = "https://gw.alipayobjects.com/os/antfincdn/6HodecuhvM/scatter.json";

describe("Interval Chart", () => {
  it("基础点图", async () => {
    const res = await fetch(url);
    const data = await res.json();

    const context = createContext("基础点图");
    const chartRef = { current: null };
    const { type, props } = (
      <Canvas context={context} pixelRatio={window.devicePixelRatio}>
        <Chart
          ref={chartRef}
          data={data}
          coord={{
            type: Rect,
          }}
          scale={}
        >
          <Point
            x="height"
            y="weight"
            color="gender"
            size={'weight'}
          />
        </Chart>
      </Canvas>
    );

    // @ts-ignore
    const canvas = new type(props);
    canvas.render();
  });

  it("基础点图 - 极坐标", async () => {
    const res = await fetch(url);
    const data = await res.json();

    const context = createContext("基础点图 - 极坐标");
    const chartRef = { current: null };
    const { type, props } = (
      <Canvas context={context} pixelRatio={window.devicePixelRatio}>
        <Chart
          ref={chartRef}
          data={data}
          coord={{
            type: Polar,
          }}
          scale={}
        >
          <Point
            x="height"
            y="weight"
            color="gender"
            // size={['weight', [0, 10, 20, 30]]}
            size={"weight"}
          />
        </Chart>
      </Canvas>
    );

    // @ts-ignore
    const canvas = new type(props);
    canvas.render();
  });
});
