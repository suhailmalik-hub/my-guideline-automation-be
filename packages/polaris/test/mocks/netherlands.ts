import { PolarisRunConfig } from "../../dist";

export const netherlandsConfig: PolarisRunConfig = {
  mode: "play",
  useSession: false,
  flows: {
    netherlands: {
      url: "https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa/apply-india",
      waitBeforeStart: 8000,
      steps: [
        {
          name: "Overview",
          order: 1,
          action: "extractScreenshot",
          contentFrom:
            "Applying for a Schengen visa for the Netherlands in India",
          contentUpto: "Step 1: Check before applying ",
          targetDescription:
            "Extract only the introductory paragraph above Step 1, describing who can apply for a Schengen visa",
        },
      ],
    },
  },
};
