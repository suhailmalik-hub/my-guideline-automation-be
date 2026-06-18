import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import db from "../lib/connections/db-connection/db.connection";
import { GuidelineConfigModel } from "./guideline-config.model";

export enum NotificationType {
  CONFIRM_GUIDELINE = "CONFIRM_GUIDELINE",
  RUN_ERROR = "RUN_ERROR",
}

export class NotificationModel extends Model<
  InferAttributes<NotificationModel>,
  InferCreationAttributes<NotificationModel>
> {
  declare id: CreationOptional<string>;
  declare readable_id: CreationOptional<number>;
  declare automation_id: CreationOptional<ForeignKey<
    GuidelineConfigModel["id"]
  > | null>;
  declare notification_type: string;
  declare message: CreationOptional<string | null>;
  declare is_read: CreationOptional<boolean>;
  declare read_at: CreationOptional<Date | null>;
  declare created_at: CreationOptional<Date>;
}

NotificationModel.init(
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
    automation_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: GuidelineConfigModel,
        key: "id",
      },
    },
    notification_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "at_notification",
    schema: "public",
    timestamps: false,
  },
);

export default NotificationModel;
