import { PolarisRunConfig } from "../../dist";

export const vfsIndBelConfig: PolarisRunConfig = {
  mode: "play",
  useSession: false,
  flows: {
    vfs: {
      url: "https://visa.vfsglobal.com/ind/en/bel/visa-type#shorttermvisa",
      waitBeforeStart: 8000,
      steps: [
        {
          name: "Extract Overview",
          order: 1,
          action: "extract",
          targetDescription: "Overview active tab content",
          targetElement: "",
        },
        {
          name: "Click Visa Fees tab",
          order: 2,
          action: "click",
          targetDescription: "Visa Fees tab button",
          targetElement: "",
        },
        {
          name: "Extract Visa Fees",
          order: 3,
          action: "extract",
          targetDescription: "Visa Fees active tab content",
          targetElement: "",
          snapshotBeforeStep: true,
        },
        {
          name: "Click Documents Required tab",
          order: 4,
          action: "click",
          targetDescription: "Documents Required tab button",
          targetElement: "",
        },
        {
          name: "Extract Documents Required",
          order: 5,
          action: "extract",
          targetDescription: "Documents Required active tab content",
          targetElement: "",
          snapshotBeforeStep: true,
        },
        {
          name: "Extract Business PDF",
          order: 6,
          action: "extractPDF",
          pdfUrl:
            "https://assets.ctfassets.net/xxg4p8gt3sg6/6yvwjK5p9UkZBt2prbgSis/23056de911b54c7c5aa3664f24de9368/business.pdf",
        },
        {
          name: "Click Photo Specification tab",
          order: 7,
          action: "click",
          targetDescription: "Photo Specification tab button",
          targetElement: "",
        },
        {
          name: "Extract Photo Specification",
          order: 8,
          action: "extract",
          targetDescription: "Photo Specification active tab content",
          targetElement: "",
          snapshotBeforeStep: true,
        },
        {
          name: "Extract Photo Muster PDF",
          order: 9,
          action: "extractPDF",
          pdfUrl:
            "https://assets.ctfassets.net/xxg4p8gt3sg6/2FXb2emP5BPqEbydUGnhAl/e889ba8c8bc28d103a2024d1012df722/fotomustertafel_2005_english_141212.pdf",
        },
        {
          name: "Click Processing Time tab",
          order: 10,
          action: "click",
          targetDescription: "Processing Time tab button",
          targetElement: "",
        },
        {
          name: "Extract Processing Time",
          order: 11,
          action: "extract",
          targetDescription: "Processing Time active tab content",
          targetElement: "",
          snapshotBeforeStep: true,
        },
      ],
    },
  },
};
