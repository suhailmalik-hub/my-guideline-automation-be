import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import db from "../lib/connections/db-connection/db.connection";

export class WorldCountriesModel extends Model<
  InferAttributes<WorldCountriesModel>,
  InferCreationAttributes<WorldCountriesModel>
> {
  declare id: CreationOptional<string>;
  declare readable_id: CreationOptional<number>;
  declare name: string;
  declare alpha2: string;
  declare alpha3: string;
}

WorldCountriesModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    readable_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    alpha2: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    alpha3: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "at_world_countries",
    schema: "public",
    timestamps: false,
    underscored: false,
  },
);

export default WorldCountriesModel;
