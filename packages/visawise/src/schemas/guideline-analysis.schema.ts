import { z } from "zod";
export const individualFileAnalysisSchema = z.object({
  extractedData: z.object({
    baseUrl: z.string(),
    sourceFileName: z.string(),
    countryInfo: z.object({
      countryName: z.string(),
      countryMentions: z.array(z.string()),
    }),
    visaInfo: z.object({
      visaType: z.string(),
      visaCategory: z.string(),
      visaName: z.string(),
      context: z.array(z.string()),
    }),
    fees: z.array(
      z.object({
        feesCondition: z.string(),
        amount: z.string(),
        context: z.array(z.string()),
      })
    ),
    timingInfo: z.object({
      maxLengthOfStay: z.string(),
      duration: z.string(),
      processingTime: z.string(),
      earliestTimeToApply: z.string(),
      entriesAllowed: z.string(),
      context: z.array(z.string()),
    }),

    documents: z.array(
      z.object({
        documentName: z.string(),
        category: z.string(),
        requirements: z.array(z.string()),
        mandatory: z.boolean(),
        conditions: z.array(z.string()),
        link: z.string(),
        context: z.array(z.string()),
      })
    ),

    additionalRequirements: z.array(
      z.object({
        requirement: z.string(),
        note: z.string(),
        link: z.string(),
        context: z.array(z.string()),
      })
    ),
  }),
});
