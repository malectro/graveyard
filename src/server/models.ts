import {
  DataTypes,
  Model,
} from "denodb";

export class Entity extends Model {
  static table = "entities";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    assetId: {
      type: DataTypes.INTEGER,
    },
    speciesId: {
      type: DataTypes.INTEGER,
    },
    triggerId: {
      type: DataTypes.INTEGER,
    },
    box: {
      type: DataTypes.JSON,
    },
    instanceData: {
      type: DataTypes.JSON,
    },
  };
}
