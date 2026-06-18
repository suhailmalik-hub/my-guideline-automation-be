import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import db from "../lib/connections/db-connection/db.connection";
import { DestinationCountriesModel } from "./destination-countries.model";

export class VisaTypesModel extends Model<
  InferAttributes<VisaTypesModel>,
  InferCreationAttributes<VisaTypesModel>
> {
  declare id: CreationOptional<string>;
  declare readable_id: CreationOptional<number>;
  declare destination_country_id: ForeignKey<DestinationCountriesModel["id"]>;
  declare destination_country: string;
  declare visa_name: string;
  declare active_status: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare created_by: CreationOptional<string | null>;
  declare updated_by: CreationOptional<string | null>;
}

VisaTypesModel.init(
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
      unique: true,
    },
    destination_country_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: DestinationCountriesModel,
        key: "id",
      },
    },
    destination_country: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    visa_name: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    active_status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "at_visa_types",
    schema: "public",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: false,
  },
);

export default VisaTypesModel;
