import { PolarisRunConfig } from "@polaris/core";

export enum GuidelineAutomateStatus {
  IN_PROGRESS = "IN_PROGRESS",
  PUBLISHED = "PUBLISHED",
  RUN_ERROR = "RUN_ERROR",
}

export interface CreateGuidelineAutomateRequest {
  sourceCountryId: string;
  sourceCountry: string;
  destinationCountryId: string;
  destinationCountry: string;
  visaTypeId: string;
  visaType: string;
  subVisaTypeId?: string;
  subvisaType?: string;
}

export type PlayGuidelineAutomateRequest = Omit<PolarisRunConfig, "mode"> & {
  tabId: string;
  clientId: string;
  guidelineId: string;
};

export interface SaveGuidelineAutomateRequest {
  guidelineId: string;
  automationConfig: Omit<PolarisRunConfig, "mode">;
}

export interface RunGuidelineAutomateRequest {
  guidelineId: string;
  tabId: string;
  clientId: string;
}

export interface IPagination {
  page: number;
  limit: number;
  status: GuidelineAutomateStatus;
}

export interface UpdateAutomationStepRequest {
  guidelineId: string;
  automationStep: Omit<PolarisRunConfig, "mode">;
}

export interface ConfirmGuidelineRequest {
  guidelineId: string;
  guideline: object;
}

export interface DeleteGuidelineAutomateRequest {
  guidelineId: string;
}

export interface GuidelineDetailRequest {
  guidelineId: string;
}
