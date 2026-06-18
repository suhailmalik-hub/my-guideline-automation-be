export const guidelineReviewPrompt = `
TASK: Compare existing guideline with new aggregated data and generate the updated, consolidated guideline. The goal is to maximize specificity and completeness.

INPUT: 
1. Existing guideline JSON (current version)
2. New aggregated data JSON (from recent file extractions)
OUTPUT: Updated guideline JSON matching the target structure

--- REVIEW AND UPDATE COMMANDS ---

1. COMPARE CORE METADATA:
    - **COUNTRY & VISA:** Verify 'toCountryName', 'toCountryCode', 'visaType', 'visaCategory'.
    - **ACTION:** Update these fields ONLY if the consensus from the new aggregated data is substantially different, more frequent, or more specific than the existing value.
    - **ACTION:** Update 'visaName' if a more specific name is found, otherwise use the existing name or 'visaType'.
    - **ACTION:** Ensure 'toCountryCode' is mapped correctly to ISO 3166-1 alpha-3 (e.g., "United Kingdom" → "GBR").

2. REVIEW VISA FEES (visaFees):
    - **ACTION:** Compare the existing 'visaFees' array against the new aggregatedData.fees.
    - **Merging Logic:** Add any unique fee entries (unique by **standardized condition AND amount**) found in the new data.
    - **Update Logic:** If an existing fee condition is found in the new data, update the associated **amount** and **context** if the new data is more recent or specific.
    - **Removal:** Remove fee entries that are explicitly stated as removed or outdated in the new data (if contextually available).

3. REVIEW TIMING METADATA:
    - **ACTION:** Compare all fields in 'timingInfo' (maxLengthOfStay, duration, processingTime, etc.).
    - **Update Logic:** Update existing timing fields **ONLY** if the new data provides a **more specific, more descriptive, or more applicant-favorable** value (i.e., longer stay/duration, shorter processing time).
    - **Rule Preservation:** Preserve complex conditional statements over fixed numbers if the complexity is necessary (e.g., "3 weeks if applying from country A, 8 weeks if applying from country B").

4. REVIEW ADDITIONAL REQUIREMENTS (additionalRequirement):
    - **FIELD NAME:** Use the field name **'additionalRequirement'** (renamed from 'additionalNotes').
    - **ACTION:** Compare the existing 'additionalRequirement' array against the new aggregatedData.additionalRequirement.
    - **Standardization & Merging:** Apply the **Standardization Preprocessing** and **Deduplication Logic** from the Generation Phase to the combined (existing + new) data set.
        - **Standardization:** Consolidate semantically identical requirements (e.g., biometrics) into a single unified phrase.
        - **Deduplication:** The final array must contain unique objects based on the pairing of the **unified requirement text** and its **associated note text**. **Keep all unique pairings from both sources.**

5. REVIEW DOCUMENTS GUIDELINES (visaDocumentsGuidelines):
    - **ACTION:** Compare the existing 'visaDocumentsGuidelines' array against the new aggregatedData.documents.
    - **Categorization:** Documents must be maintained under their respective **docCategory**. If a new document is introduced, group it into the most appropriate **existing docCategory**. If no category fits, create a new, highly descriptive **docCategory**.
    - **Document Merging Logic:**
         - **Add:** Add any new unique documents (by documentName) to the appropriate category.
         - **Update:** For existing documents, merge the unique 'requirements' arrays from the new data into the existing requirements. 
         - **Retirement/Removal:** Apply the **DATA RETIREMENT RULE**. If a document or condition is completely absent from the new aggregated data set across all sources, it may be removed from the final guideline.
         **Keep all unique requirements.**
    - **Flag & Conditions Update:** Update the category-level **mandatory** flag and **conditions** based on the presence of new data. **Keep all unique conditions** from both sources in the final 'conditions' array.


6. UPDATE SOURCES AND METADATA:
    - **ACTION:** Merge 'baseUrls' from existing and new data. Flatten, deduplicate, and sort the final list.
    - **ACTION:** Update 'syncedAt' to the current timestamp in **ISO 8601 format**.

CRITICAL UPDATE RULES:
- **SEMANTIC PRESERVATION MANDATE:** If existing data and new data convey the exact same meaning (semantic equivalence), **ALWAYS RETAIN THE EXISTING WORDING and structure**. Do not change the existing value.
- **QUALITY OVERRIDE:** NEVER replace specific, meaningful existing data with generic or less descriptive versions, even if the new data is technically newer.
- **Substantive Change Only:** Only update when there is a **substantive difference in meaning or new, verifiable information** is available.
- **Completeness:** Preserve all existing specific context and meaningful descriptions throughout ALL sections.
- **Addition Over Degradation:** Only add new data; never degrade existing data quality by making it less specific.

CONFLICT RESOLUTION RULES:
- When existing and new data conflict substantively, **prefer the newer aggregated data**.
- If multiple versions exist in new data, use the **most frequent or specific** one.
- For mandatory flags: **true** if any source (existing or new) indicates mandatory.
- Keep all unique conditions and requirements from both sources.
`;
