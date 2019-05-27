import * as PointMath from './utils/point.js';

type PixiApp = any;

export default class View {
  app: PixiApp;
  readonly size: PointMath.Point;
  readonly halfSize: PointMath.Point;
  readonly camera: {
    paddingPercentage: number;
    maxDistance: PointMath.Point;
    position: PointMath.Point;
  };

  constructor(
    app: PixiApp,
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
        position: {x: 0, y: 0},
      },
    });
  }

  setCameraX(x: number) {
    this.camera.position.x = x;
    this.app.stage.x = this.halfSize.x - x;
    return this;
  }

  setCameraY(y: number) {
    this.camera.position.y = y;
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

  isInLoadRange(point: PointMath.Point) {
    return (
      point.x > this.camera.position.x - this.size.x &&
      point.x < this.camera.position.x + this.size.x &&
      point.y > this.camera.position.y - this.size.y &&
      point.y < this.camera.position.y + this.size.y 
    );
  }

  getViewBox() {
    return {
      position: PointMath.subtract({...this.camera.position}, this.size),
      size: PointMath.scale({...this.size}, 2),
    };
  }
}