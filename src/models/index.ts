export * from "./destination-countries.model";
export * from "./guideline-config.model";
export * from "./guideline-result.model";
export * from "./notification.model";
export * from "./sub-visa-types.model";
export * from "./visa-types.model";
export * from "./world-countries.model";

import { GuidelineConfigModel } from "./guideline-config.model";
import { GuidelineResultModel } from "./guideline-result.model";

GuidelineConfigModel.hasOne(GuidelineResultModel, {
  foreignKey: "guideline_config_id",
  as: "guideline_result",
});
GuidelineResultModel.belongsTo(GuidelineConfigModel, {
  foreignKey: "guideline_config_id",
  as: "config",
});
