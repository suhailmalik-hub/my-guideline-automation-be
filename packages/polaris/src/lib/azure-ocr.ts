import * as fs from "fs";

export interface AzureOCRCredentials {
  subscriptionKey: string;
  endpoint: string;
}

export const extractPdfTextAzure = async (
  pdfFilePath: string,
  credentials: AzureOCRCredentials,
): Promise<string> => {
  try {
    const fileBuffer = fs.readFileSync(pdfFilePath);

    const endpointUrl = `${credentials.endpoint}/vision/v3.2/read/analyze`;

    // 1. Submit the document to Cognitive Services
    const submitResponse = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": credentials.subscriptionKey,
        "Content-Type": "application/octet-stream",
      },
      body: fileBuffer,
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      throw new Error(
        `Azure OCR rejected file. Status: ${submitResponse.status}. Details: ${errorText}`,
      );
    }

    const operationLocation = submitResponse.headers.get("operation-location");
    if (!operationLocation) {
      throw new Error("Missing operation-location in success response.");
    }

    // 2. Poll the API until it finishes extracting the text
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3 seconds before first poll
      const pollResponse = await fetch(operationLocation, {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": credentials.subscriptionKey,
        },
      });

      const pollData = await pollResponse.json();
      const status = pollData.status;

      if (status === "succeeded") {
        let extractedText = "";
        const readResults = pollData.analyzeResult.readResults;
        for (const page of readResults) {
          for (const line of page.lines) {
            extractedText += line.text + "\n";
          }
        }
        return extractedText;
      } else if (status === "failed") {
        throw new Error("Azure OCR processing failed inside Computer Vision.");
      }
      // If it's not succeeded/failed, it will loop again
    }
  } catch (error) {
    throw new Error(
      `PDF text extraction failed for "${pdfFilePath}": ${error instanceof Error ? error.message : error}`,
    );
  }
};
