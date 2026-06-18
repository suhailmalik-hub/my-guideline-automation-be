import { Visawise } from "@visawise/core";

export const visawise = new Visawise({
  aiProvider: "openai",
  aiProviderKey: process.env.OPENAI_API_KEY!,
});
