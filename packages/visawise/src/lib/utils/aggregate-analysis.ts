const isValidObject = (obj: any): boolean => {
  if (!obj || typeof obj !== "object") return false;

  return Object.values(obj).some((value) => {
    if (value === null || value === undefined) return false;

    // Non-empty string
    if (typeof value === "string" && value.trim() !== "") return true;

    // Non-empty array
    if (Array.isArray(value) && value.length > 0) return true;

    // boolean true
    if (typeof value === "boolean" && value === true) return true;

    // non-zero numbers
    if (typeof value === "number" && value !== 0) return true;
    return false;
  });
};

export function aggregateAnalysisResults(analysisResults: any[]) {
  //Push only NON-empty strings
  const pushIfNotEmpty = (arr: string[], value: string) => {
    if (value && value.trim() !== "") arr.push(value);
  };

  const pushArrayStrings = (arr: string[], values: string[]) => {
    for (const v of values) {
      if (v && v.trim() !== "") arr.push(v);
    }
  };

  const CombinedDataAnalysis = {
    aggregatedData: {
      baseUrl: [] as string[],
      sourceFileName: [] as string[],
      countryInfo: {
        countryName: [] as string[],
        countryMentions: [] as string[],
      },
      visaInfo: [] as {
        visaType: string;
        visaCategory: string;
        visaName: string;
        context: string[];
      }[],
      additionalRequirements: [] as {
        requirement: string;
        note: string;
        link: string;
        context: string;
      }[],

      fees: [] as {
        feeCondition: string;
        amount: string;
        context: string;
      }[],
      timingInfo: [] as {
        maxLengthOfStay: string;
        duration: string;
        processingTime: string;
        earliestTimeToApply: string;
        entriesAllowed: string;
        context: string;
      }[],
      documents: [] as {
        documentName: string;
        category: string;
        requirements: string[];
        mandatory: boolean;
        conditions: string[];
        context: string;
      }[],
      notes: [] as {
        requirement: string;
        note: string;
        context: string;
      }[],
    },
  };

  for (const item of analysisResults) {
    const data = item.extractedData;

    // --- Combine primitive string → array (skip empty) ---
    pushIfNotEmpty(CombinedDataAnalysis.aggregatedData.baseUrl, data.baseUrl);
    pushIfNotEmpty(
      CombinedDataAnalysis.aggregatedData.sourceFileName,
      data.sourceFileName
    );

    pushIfNotEmpty(
      CombinedDataAnalysis.aggregatedData.countryInfo.countryName,
      data.countryInfo.countryName
    );

    pushArrayStrings(
      CombinedDataAnalysis.aggregatedData.countryInfo.countryMentions,
      data.countryInfo.countryMentions
    );

    CombinedDataAnalysis.aggregatedData.visaInfo.push({
      visaType: data.visaInfo.visaType || "",
      visaCategory: data.visaInfo.visaCategory || "",
      visaName: data.visaInfo.visaName || "",
      context: data.visaInfo.context.filter((c: string) => c.trim() !== ""),
    });

    CombinedDataAnalysis.aggregatedData.fees.push(...data.fees);

    CombinedDataAnalysis.aggregatedData.timingInfo.push({
      maxLengthOfStay: data.timingInfo.maxLengthOfStay,
      duration: data.timingInfo.duration,
      processingTime: data.timingInfo.processingTime,
      earliestTimeToApply: data.timingInfo.earliestTimeToApply,
      entriesAllowed: data.timingInfo.entriesAllowed,
      context: data.timingInfo.context,
    });

    CombinedDataAnalysis.aggregatedData.documents.push(...data.documents);

    CombinedDataAnalysis.aggregatedData.additionalRequirements.push(
      ...data.additionalRequirements
    );

    // CombinedDataAnalysis.aggregatedData.notes.push(...data.notes);
  }
  CombinedDataAnalysis.aggregatedData.timingInfo =
    CombinedDataAnalysis.aggregatedData.timingInfo.filter(isValidObject);
  return CombinedDataAnalysis;
}
