import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import db from "../lib/connections/db-connection/db.connection";
import GuidelineConfigModel from "./guideline-config.model";

export class GuidelineResultModel extends Model<
  InferAttributes<GuidelineResultModel>,
  InferCreationAttributes<GuidelineResultModel>
> {
  declare id: CreationOptional<string>;
  declare readable_id: CreationOptional<number>;
  declare guideline_config_id: ForeignKey<GuidelineConfigModel["id"]>;
  declare existing_guideline: CreationOptional<string | null>;
  declare scrape: CreationOptional<string | null>;
  declare analysis_result: CreationOptional<string | null>;
  declare generated_guideline: CreationOptional<string | null>;
  declare is_confirmed: CreationOptional<boolean | null>;
  declare active_status: CreationOptional<boolean | null>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare created_by: CreationOptional<string | null>;
  declare updated_by: CreationOptional<string | null>;
}

GuidelineResultModel.init(
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
    guideline_config_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: GuidelineConfigModel,
        key: "id",
      },
    },
    existing_guideline: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scrape: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    analysis_result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    generated_guideline: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    active_status: {
      type: DataTypes.BOOLEAN,
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
    tableName: "at_guideline_result",
    schema: "public",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: false,
  },
);

GuidelineConfigModel.hasMany(GuidelineResultModel, {
  foreignKey: "guideline_config_id",
  as: "results",
});

GuidelineResultModel.belongsTo(GuidelineConfigModel, {
  foreignKey: "guideline_config_id",
  as: "guidelineConfig",
});

export default GuidelineResultModel;
