// import { Visawise } from "@visawise/core";

// export const visawise = new Visawise({
//   aiProvider: "openai",
//   aiProviderKey: process.env.OPENAI_API_KEY!,
// });

import { Visawise } from "@visawise/core";

export const visawise = new Visawise({
  aiProvider: "claude",
  aiProviderKey: process.env.ANTHROPIC_API_KEY!,
  aiModel: "claude-sonnet-4-6",
});
