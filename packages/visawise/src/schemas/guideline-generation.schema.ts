import { z } from "zod";

const additionalRequirementSchema = z.object({
  requirements: z.string(),
  note: z.string(),
  link: z.string(),
});

const VisaFeeSchema = z.object({
  feesType: z.string(),
  amount: z.string(),
});

const VisaMetaDataSchema = z.object({
  visaName: z.string(),
  visaFees: z.array(VisaFeeSchema),
  maxLengthOfStay: z.string(),
  duration: z.string(),
  processingTime: z.string(),
  earliestTimeToApply: z.string(),
  entriesAllowed: z.string(),
  additionalRequirements: z.array(additionalRequirementSchema),
  baseUrls: z.array(z.string()),
});

const DocumentSchema = z.object({
  documentName: z.string(),
  category: z.string(),
  requirements: z.array(z.string()),
  links: z.array(z.string()),
});

const VisaDocumentsGuidelineSchema = z.object({
  docCategory: z.string(),
  documents: z.array(DocumentSchema),
  notes: z.array(z.string()),
  links: z.array(z.string()),
  mandatory: z.boolean(),
  conditions: z.array(z.string()),
});

export const guidelineGenerationSchema = z.object({
  toCountryCode: z.string(),
  toCountryName: z.string(),
  visaType: z.string(),
  visaCategory: z.string(),
  syncedAt: z.string(),
  route: z.string(),
  visaMetaData: VisaMetaDataSchema,
  visaDocumentsGuidelines: z.array(VisaDocumentsGuidelineSchema),
});
