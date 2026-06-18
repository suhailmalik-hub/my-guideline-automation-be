import { z } from "zod";

const baseStepSchema = z.object({
  name: z.string(),
  order: z.number().int().nonnegative(),
  snapshotBeforeStep: z.boolean().optional(),
  waitBeforeStep: z.number().int().nonnegative().optional(),
});

const extractStepSchema = baseStepSchema.extend({
  action: z.literal("extract"),
  targetDescription: z.string(),
  targetElement: z.string().optional(),
  xpath: z.string().optional(),
});

const extractPDFStepSchema = baseStepSchema.extend({
  action: z.literal("extractPDF"),
  pdfUrl: z.string().url(),
});

const extractScreenshotStepSchema = baseStepSchema.extend({
  action: z.literal("extractScreenshot"),
  targetDescription: z.string(),
  contentFrom: z.string(),
  contentUpto: z.string(),
});

const clickStepSchema = baseStepSchema.extend({
  action: z.literal("click"),
  targetDescription: z.string(),
  targetElement: z.string().optional(),
  xpath: z.string().optional(),
});

const selectDropdownOptionStepSchema = baseStepSchema.extend({
  action: z.literal("selectDropdownOption"),
  targetDescription: z.string(),
  targetElement: z.string().optional(),
  value: z.string(),
  xpath: z.string().optional(),
});

const fillTextInputStepSchema = baseStepSchema.extend({
  action: z.literal("fillTextInput"),
  targetDescription: z.string(),
  targetElement: z.string().optional(),
  value: z.string(),
  xpath: z.string().optional(),
});

const selectRadioInputStepSchema = baseStepSchema.extend({
  action: z.literal("selectRadioInput"),
  targetDescription: z.string(),
  value: z.string(),
  targetElement: z.string().optional(),
  xpath: z.string().optional(),
});

const automationStepSchema = z.discriminatedUnion("action", [
  extractStepSchema,
  extractPDFStepSchema,
  extractScreenshotStepSchema,
  clickStepSchema,
  selectDropdownOptionStepSchema,
  fillTextInputStepSchema,
  selectRadioInputStepSchema,
]);

const automationFlowSchema = z.object({
  url: z.string().url(),
  waitBeforeStart: z.number().int().nonnegative().optional(),
  steps: z.array(automationStepSchema).min(1),
});

const sessionRunConfigSchema = z.object({
  useSession: z.literal(true),
  flows: z.record(z.string(), automationFlowSchema),
});

const noSessionRunConfigSchema = z.object({
  useSession: z.literal(false),
  flows: z.record(z.string(), automationFlowSchema),
});

const playExtraFieldsSchema = {
  tabId: z.string(),
  clientId: z.string(),
  guidelineId: z.uuid(),
};

export const playGuidelineAutomateSchema = z.discriminatedUnion("useSession", [
  sessionRunConfigSchema.extend(playExtraFieldsSchema),
  noSessionRunConfigSchema.extend(playExtraFieldsSchema),
]);

// CREATE GUIDELINE AUTOMATE SCHEMA

export const createGuidelineAutomateSchema = z.object({
  sourceCountryId: z.uuid(),
  sourceCountry: z.string(),
  destinationCountryId: z.uuid(),
  destinationCountry: z.string(),
  visaTypeId: z.uuid(),
  visaType: z.string(),
  subVisaTypeId: z.uuid().optional(),
  subvisaType: z.string().optional(),
});

// SAVE GUIDELINE AUTOMATE SCHEMA

export const saveGuidelineAutomateSchema = z.object({
  guidelineId: z.uuid(),
  automationConfig: z.discriminatedUnion("useSession", [
    sessionRunConfigSchema,
    noSessionRunConfigSchema,
  ]),
});

// RUN GUIDELINE AUTOMATE SCHEMA

export const runGuidelineAutomateSchema = z.object({
  guidelineId: z.uuid(),
  tabId: z.string(),
  clientId: z.string(),
});

// UPDATE AUTOMATION STEP SCHEMA

export const updateAutomationStepSchema = z.object({
  guidelineId: z.uuid(),
  automationStep: z.discriminatedUnion("useSession", [
    sessionRunConfigSchema,
    noSessionRunConfigSchema,
  ]),
});

// DETAIL GUIDELINE AUTOMATE SCHEMA

export const detailGuidelineAutomateSchema = z.object({
  guidelineId: z.uuid(),
});

// LIST GUIDELINE AUTOMATE SCHEMA

export const listGuidelineAutomateSchema = z.object({
  page: z.coerce.number({
    error: "Page is required",
  }),
  limit: z.coerce.number({
    error: "Limit is required",
  }),
  status: z.enum(["PUBLISHED", "IN_PROGRESS", "RUN_ERROR"]),
});

// CONFIRM GUIDELINE SCHEMA

export const confirmGuidelineSchema = z.object({
  guidelineId: z.uuid(),
  guideline: z.object(),
});

// DELETE GUIDELINE AUTOMATE SCHEMA

export const deleteGuidelineAutomateSchema = z.object({
  guidelineId: z.uuid(),
});

// GUIDELINE DETAIL SCHEMA

export const guidelineDetailSchema = z.object({
  guidelineId: z.uuid(),
});
