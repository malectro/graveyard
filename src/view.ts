import * as PointMath from './utils/point.js';

export default class View {
  app: PIXI.Application;
  readonly size: PointMath.Point;
  readonly halfSize: PointMath.Point;
  readonly camera: {
    paddingPercentage: number;
    maxDistance: PointMath.Point;
  };

  constructor(
    app: PIXI.Application,
    {
      cameraPaddingPercentage,
    }: {
      cameraPaddingPercentage: number;
    },
  ) {
    const size = PointMath.point(app.screen.width, app.screen.height);
    const halfSize = PointMath.scale({...size}, 0.5);

    const cameraPadding = PointMath.assignMin(
      PointMath.floor(PointMath.scale({...size}, cameraPaddingPercentage)),
    );
    const cameraMaxDistance = PointMath.subtract({...halfSize}, cameraPadding);

    Object.assign(this, {
      app,
      size,
      halfSize,
      camera: {
        paddingPercentage: cameraPaddingPercentage,
        maxDistance: cameraMaxDistance,
      },
    });
  }

  setCameraX(x: number) {
    this.app.stage.x = this.halfSize.x - x;
    return this;
  }
  setCameraY(y: number) {
    this.app.stage.y = this.halfSize.y - y;
    return this;
  }

  setCameraPosition(point: PointMath.Point) {
    this.setCameraX(point.x);
    this.setCameraY(point.y);
    return this;
  }

  focusCamera(point: PointMath.Point) {
    const cameraX = this.halfSize.x - this.app.stage.x;
    const cameraY = this.halfSize.y - this.app.stage.y;

    const cameraDistanceX = point.x - cameraX;
    if (cameraDistanceX > this.camera.maxDistance.x) {
      this.setCameraX(point.x - this.camera.maxDistance.x);
    } else if (cameraDistanceX < -this.camera.maxDistance.x) {
      this.setCameraX(point.x + this.camera.maxDistance.x);
    }

    const cameraDistanceY = point.y - cameraY;
    if (cameraDistanceY > this.camera.maxDistance.y) {
      this.setCameraY(point.y - this.camera.maxDistance.y);
    } else if (cameraDistanceY < -this.camera.maxDistance.y) {
      this.setCameraY(point.y + this.camera.maxDistance.y);
    }
  }
}