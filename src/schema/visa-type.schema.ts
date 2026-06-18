import { z } from "zod";

// CREATE VISA TYPE SCHEMA

export const createVisaTypeSchema = z.object({
  destinationCountryId: z.uuid(),
  destinationCountry: z.string(),
  visaType: z.string(),
  subVisaType: z.string().optional(),
});

// LIST VISA TYPES BY DESTINATION SCHEMA

export const listVisaTypesByDestinationSchema = z.object({
  destinationCountryId: z.uuid(),
});

// LIST SUB VISA TYPES BY VISA TYPE SCHEMA

export const listSubVisaTypesByVisaTypeSchema = z.object({
  visaTypeId: z.uuid(),
});
