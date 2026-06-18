import { PolarisRunConfig } from "../../dist";

export const ukConfig: PolarisRunConfig = {
  mode: "play",
  useSession: false,
  flows: {
    FLOW_2: {
      url: "https://www.gov.uk/standard-visitor/apply-standard-visitor-visa",
      waitBeforeStart: 8000,
      steps: [
        {
          name: "Visa Fees",
          order: 1,
          action: "extract",
          targetDescription: "Extract Visa fees table.",
          targetElement: "table",
        },
        {
          name: "Document",
          order: 2,
          action: "extract",
          targetDescription: "Documents and information you'll need to apply",
          targetElement: "heading",
          snapshotBeforeStep: true,
        },
        {
          name: "Required Documents",
          order: 3,
          action: "extractScreenshot",
          contentFrom:
            "Apply for a Standard Visitor visa If you need a Standard Visitor visa, you must apply online before you travel to the UK and attend an appointment at a visa application centre.",
          contentUpto:
            "You can apply on behalf of your partner and child, if they cannot apply for themselves.",
          targetDescription: "Apply for a Standard Visitor visa",
        },
      ],
    },
  },
};
