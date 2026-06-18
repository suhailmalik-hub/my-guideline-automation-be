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
import { SubVisaTypesModel } from "./sub-visa-types.model";
import { VisaTypesModel } from "./visa-types.model";
import { WorldCountriesModel } from "./world-countries.model";

export class GuidelineConfigModel extends Model<
  InferAttributes<GuidelineConfigModel>,
  InferCreationAttributes<GuidelineConfigModel>
> {
  declare id: CreationOptional<string>;
  declare readable_id: CreationOptional<number>;
  declare source_country_id: ForeignKey<WorldCountriesModel["id"]>;
  declare source_country: string;
  declare destination_country_id: ForeignKey<DestinationCountriesModel["id"]>;
  declare destination_country: string;
  declare visa_type_id: ForeignKey<VisaTypesModel["id"]>;
  declare visa_type: string;
  declare sub_visa_type_id: ForeignKey<SubVisaTypesModel["id"]>;
  declare subvisa_type: CreationOptional<string | null>;
  declare automation_step: CreationOptional<string | null>;
  declare status: CreationOptional<string | null>;
  declare is_running: CreationOptional<boolean>;
  declare active_status: CreationOptional<boolean>;
  declare cron_last_run: CreationOptional<Date | null>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare created_by: CreationOptional<string | null>;
  declare updated_by: CreationOptional<string | null>;
}

GuidelineConfigModel.init(
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
    source_country_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: WorldCountriesModel,
        key: "id",
      },
    },
    source_country: {
      type: DataTypes.STRING(250),
      allowNull: false,
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
    visa_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: VisaTypesModel,
        key: "id",
      },
    },
    visa_type: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    sub_visa_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: SubVisaTypesModel,
        key: "id",
      },
    },
    subvisa_type: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    automation_step: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    // is_running is created for future use
    // to identify if the automation is currently running or not,
    // so that we can prevent multiple runs at the same time for the same guideline
    // also it us useful in cron job to identify if the automation is running or not.
    is_running: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    active_status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    cron_last_run: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "at_guideline_config",
    schema: "public",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: false,
  },
);

export default GuidelineConfigModel;
