// ── Automation — Test Runner ──────────────────────────────────────────────────
// Run with: npm test (from packages/automation/)
// Requires: OPENAI_API_KEY in .env at repo root

const MOCK_POLARIS_OUTPUT = {
  success: true,
  message: "Guideline automation played",
  result: {
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
            xpath: '//*[@id="shorttermvisa"]/div/div/div[3]/div/div/div[2]',
            extractedContent:
              "#### Overview\n\nIf you are planning a short visit to Belgium for up to 90 days or less, you may need to apply for a Schengen visa. Applications can be lodged 6 months in advance of travel date.Belgium is one of the 29 European countries forming the Schengen Area which have no border controls between them. These countries also issue a common visa, the Schengen visa for a stay of up to 90 days in any period of 180 days. Please note that the following essentials must be met by all applicants submitting their applications for visa.\n\n*   Passport should have at least two blank pages.\n    \n*   Passport should be valid for at least 3 months from the date on which the applicant intends to leave the SCHENGEN territory, or, in the case of multiple journeys the date on which the applicant intends to leave it for the last time\n    \n*   Applications are only accepted within 6 months of the requested date of arrival\n    \n\n**Previous Schengen Visa Please Note:-**\n\nIn case you have already submitted your fingerprints for a previous Schengen visa application in the last 59 months, you are not required to submit them again.\n\nHowever, If you are uncertain whether your fingerprints have been captured for a Schengen visa within the last 59 months, you are advised to appear in person.\n\nKindly note that, if it would appear that the fingerprints prove not to be present in the VIS system, you will be asked to reappear in person for new biometric data collection. To avoid this possible complication, you have the right to ask for your fingerprints to be taken again.\n\n**Schengen Common Information for India**\n\nRead here important information on Schengen in India and specific details on Indian passports validity: Click here\n\n**Please Note**\n\nThe overseas travel medical insurance valid for all Schengen-countries has to cover the applicant for at least 30000 Euros or equivalent, for all risks e.g. accident, illness, medical emergency evacuation, repatriation of mortals remains etc. The policy has to clearly specify the period of validity and has to cover the entire duration of the trip including the date of arrival and departure. Please click on the following link for the approved list of insurance companies in India.\n\nSubmission of Visa application and collection of passports can be done by the following:\n\n*   Applicant himself.\n    \n*   If your Belgium visa application is submitted by a representative or a travel agent, we request you to please ensure that the declaration is filled and signed by you, and the representative or travel agent submitting the application form submits a copy of their passport bio page.\n    \n*   Third party collection of the documents or passports will not be permitted, except in the following cases:\n    \n    *   Immediate Family Member (that is Parents, Children, Spouse)\n        \n    *   A person collecting on behalf of Government officials if authorized on the Government letter head.\n        \n    *   Red Carpet Representatives if authorized on the Company’s letter head\n        \n    \n\nIf any of the above comes for passport collection they need to carry the following documents:\n\n1.  Original Government ID card\n    \n2.  Original ICR\n    \n3.  Original authorization letter from applicant\n    \n\nIt is also mandatory to mention applicant’s personal address on the covering letter on which passport has to be couriered. Applicant's passport will not be couriered to their travel agencies 'addresses as directed by the Embassy.\n\n**Please Note: - New slots are released every 1st Monday of the month for visa appointments in the upcoming month. (For East and North Zone)**\n\n**Note\\***\n\n1.  In case of a business applicant, if the applicant wishes to receive the passport to his/her office, then the same needs to be mentioned in the covering letter and the applicant’s office address needs to be mentioned in the courier request form.\n    \n2.  For application withdrawal cases, the passport needs to be collected from VFS Global only.\n    \n3.  **For Short Term**\\- Two sets of the entire document is required for short stay applications\n    \n\n**NOTE\\***\n\n1.  For Seaman Applicants, the passports can be collected by the applicant personally from VFS Global or the passport will be couriered to the seaman’s residential address only.\n    \n2.  In case of a business applicant, if the applicant wishes to receive the passport to his/her office, then the same needs to be mentioned in the covering letter and the applicant’s office address needs to be mentioned in the courier request form.\n    \n3.  For Legalisations courier is not mandatory.\n    \n4.  For application withdrawal cases, the passport needs to be collected from VFS Global only.\n    \n\nPersonal appearance: after filling in the application form on Visa On web, the applicant’s personal appearance at the VFS Visa Application Center is required in order to register the biometric fingerprints data along with a live photograph. The following applicants are however exempted of the personal appearance\n\n*   Applicants for a national long term visa D\n    \n*   Applicants for a Schengen short term visa C below 12 years of age",
            usage: {
              input_tokens: 7113,
              output_tokens: 19,
              total_tokens: 7132,
            },
          },
          {
            name: "Click Visa Fees tab",
            order: 2,
            action: "click",
            targetDescription: "Visa Fees tab button",
            targetElement: "",
            xpath: '//*[@id="visafees"]',
            usage: {
              input_tokens: 7113,
              output_tokens: 7,
              total_tokens: 7120,
            },
          },
          {
            name: "Extract Visa Fees",
            order: 3,
            action: "extract",
            targetDescription: "Visa Fees active tab content",
            targetElement: "",
            snapshotBeforeStep: true,
            xpath: '//*[@id="shorttermvisa"]/div/div/div[3]/div/div/div[2]',
            extractedContent:
              "#### Visa Fees\n\nTable Information:\n\n- Duration: Short Term Visa\n  Visa Fees in INR: 9720\n  Visa Fees in Euros: 90\n  \n- Duration: Children between 6-12 years\n  Visa Fees in INR: 4860\n  Visa Fees in Euros: 45\n  \n\n\\*Applicants applying at VFS Delhi/Chandigarh/Kolkata/Jalandhar/Gurugram - Fee can be paid by Cash/Card/UPI.\n\n\\*Applicants applying at VFS Mumbai/Ahmedabad/Bengaluru/Cochin/Chennai/Hyderabad/Goa/Pune/Puducherry – Visa Fee and VFS Services Charges can be paid by Cash/Card and UPI.\n\nExemption of Visa Fee\n\nShort Term Schengen visa:\n\n*   Children less than 6 years old\n    \n*   Family members of an EU citizen\n    \n\n“EU citizen” is a citizen of one of the European Union countries, of Norway, Iceland, Liechtenstein or Switzerland. The following persons are defined as family members:\n\n*   the spouse;\n    \n*   the partner with whom the EU citizen has contracted a registered partnership\n    \n*   the direct descendants who are under the age of 21 or are dependent as well as those of the spouse or partner as defined above; or\n    \n*   the dependent direct relatives in the ascending line and those of the spouse or partner as defined above.\n    \n\nService Fee:\n\nINR 2700/- per application (All VFS’s Service Charges are inclusive of Goods and Service Tax – SGST @ 9% and CGST @ 9%).\n\n**Please Note**\n\n*   The applicable Visa Fee in Indian Rupees is as per the current exchange rate. The same is subject to change without notice.\n    \n*   The Visa fee is non-refundable.\n    \n*   There is an Optional Courier facility available at INR 760/- (Inclusive of Goods & Service Tax – SGST @ 9% and CGST @ 9%) per application/passport.\n    \n*   There is an Optional Courier Assurance facility available at INR 1236/- (Inclusive of Goods & Service Tax – SGST @ 9% and CGST @ 9%) per application/passport.\n    \n*   There is an Optional SMS facility available at INR 278/- (Inclusive of Goods & Service Tax – SGST @ 9% and CGST @ 9%) per application/passport.\n    \n*   There is an Optional Premium Lounge facility available at INR 4680/- (Inclusive of Goods & Service Tax – SGST @ 9% and CGST @ 9%) per application/passport.\n    \n*   There is an Optional Prime Time Submission of your application facility available at INR 5072/- (Inclusive of Goods & Service Tax – SGST @ 9% and CGST @ 9%) per application/passport.\n    \n*   There is an Optional Prime time passport collection facility available at INR 796/- (Inclusive of Goods & Service Tax – SGST @ 9% and CGST @ 9%) per application/passport.",
            usage: {
              input_tokens: 6196,
              output_tokens: 19,
              total_tokens: 6215,
            },
          },
          {
            name: "Click Documents Required tab",
            order: 4,
            action: "click",
            targetDescription: "Documents Required tab button",
            targetElement: "",
            xpath: '//*[@id="documentsrequired"]',
            usage: {
              input_tokens: 6195,
              output_tokens: 6,
              total_tokens: 6201,
            },
          },
          {
            name: "Extract Documents Required",
            order: 5,
            action: "extract",
            targetDescription: "Documents Required active tab content",
            targetElement: "",
            snapshotBeforeStep: true,
            xpath: '//*[@id="shorttermvisa"]/div/div/div[3]/div/div/div[2]',
            extractedContent:
              "#### Documents Required\n\nTravel insurance is mandatory for all Schengen countries.\n\nWhat are the documents required for a Belgium Visa?\n\nAll applicants can visit the website of Embassy of Belgium in New Delhi/Consulate General of Belgium in Mumbai below for the recommended document list for the Visa category in which they wish to apply.\n\nhttp://india.diplomatie.belgium.be/en\n\nYou will find all conditions on the Federal Public Service Home Affairs Immigration Office website, the only Belgian competent authority for the admittance, stay, residence and removal of foreigners.\n\nFor Short Term - One set of documents is required. The embassy has instructed us to accept only one set of original copies of documents.\n\n**Guarantees for return (assessment of migration risk):** The applicant is requested to provide as much information as possible to document his/her family background, professional and socio-economic status, ownership of land or real estate (for instance : proof of family bonds with his/her country of origin, proof of regular income and stable source of revenues from the applicant and/or his/her partner, proof of property, etc.)\n\nThis information is essential to correctly judge the intention of the applicant to leave the Schengen area before the expiry of his/her visa.\n\nIf your Belgium visa application is submitted by a representative or a travel agent, we request you to please ensure that the attached declaration is filled and signed by you, and the representative or travel agent submitting the application form submits a copy of their passport bio page.\n\nLetter of Authorization",
            usage: {
              input_tokens: 3477,
              output_tokens: 19,
              total_tokens: 3496,
            },
          },
          {
            name: "Extract Business PDF",
            order: 6,
            action: "extractPDF",
            pdfUrl:
              "https://assets.ctfassets.net/xxg4p8gt3sg6/6yvwjK5p9UkZBt2prbgSis/23056de911b54c7c5aa3664f24de9368/business.pdf",
            extractedContent:
              "German Missions\nFebruary 2023\nin India\nChecklist for a Schengen visa for\nBusiness\nA\nPersonal details of the applicant\nName:\n__________________________________\nSurname:\n__________________________________\nDate of birth:\n__________________________________\nPassport number:\n__________________________________\nB\nRequired documents\n(if not otherwise noted, submittal of copies of the original document are sufficient. Please note that the\nVisa Section does not return original documents if you do not provide a copy)\nPlease mark on the right column if you submitted the document / form or not!\nYES\nNO\n1\nCompletely filled out and signed Schengen visa application form. Please use the\nVIDEX website to fill out the application online. Please ensure to print and\nsubmit all pages of the application form including the barcodes.\n2\nSigned declaration of True and Complete Information\n3\nSigned declaration of travel with valid medical insurance\nValid passport (issued within the last 10 years and with at least 3 months'\nvalidity after the scheduled return); passports with observations regarding the\nfront data page will not be accepted; passport must have at least two empty\npages to affix visa\n4\nCopy of the biometric & address page of the passport (DIN A4)\nMin. 1 biometric passport picture (35x45mm white background, 70%-80% face\ncoverage), not older than six months\n5\nPersonal covering letter/ Proof of intended means of transport and itinerary\n6\nFor international staff exchange or contracts for work and services: Approval of\nthe Federal Employment Agency, kindly see remarks under H)\n7\nIn all cases: Original signed covering letter from the company in India on\ncompany letterhead\nincluding details of:\nname of traveler and\n-\npassport number of traveler and\n-\npurpose of trip and duration of stay and\n-\nitinerary of the visit in brief\n-\n8\nIn all cases in addition to the covering letter of the company in India:\nCertificate of Incorporation of the Company and\nGST Registration and\nProof of Company Registration\n9\nInvitation letter from the business partner in German or English\nWhat activities are planned\n-\nWhat is the business relationship between the inviting and sending company?\n-\n(same group, inviting company is a supplier or sending company is a supplier,\nwhat exactly do the companies trade with each other (machines, equipment,\nmerchandise)), etc.?\n1\nFebruary 2023\nFor consultancy services: a confirmation letter from the German client.\nYES\nNO\nIf the inviting company arranges for accommodation, they should\n-\nconfirm the same in their invitation letter. If the inviting company does\nso, you may leave out point 12 (proof of accommodation)\n10\nDetailed schedule of your business meetings (ONLY for stays over 30 days)\n11\nIf you have further appointments in the Schengen area: Signed invitation letter\nfrom the Schengen business partner on the company letterhead, mentioning\npurpose of travel and itinerary and personal data of the applicant\n12\nProof of accommodation:\nHotel reservations, rental of holiday home or campus residence reservation or\nIf the applicant intends to stay with a family member or a friend: proof of\nsponsorship and/or private accommodation from the host, confirmation of the\nthird person with signature, proof of address and copy of passport or German ID\ncard\nIf the applicant is travelling to several Member States, proof of\naccommodation in each of the Member States.\n13\nSponsor documentation - proof of financial means if trip is sponsored by a third\nparty\na) if you are sponsored by an Indian resident\nSponsor letter with a passport copy of the sponsor and\nSponsor’s bank statements for the last 3 months stamped by the bank (If the\npages are in continuation, kindly separate the pages; passbook copies are not\naccepted.) and\nIf sponsor is your spouse - marriage certificate or\nIf sponsor is your parent - birth certificate\nb) if you are sponsored by a German/EU resident\nSponsor letter with a passport copy of the sponsor and copy of the German\nresidence permit (if sponsor is residing in Germany and not a German Citizen)\nand\nIf provided: Verpflichtungserklärung (formal obligation letter) of your sponsor\nand\nIf sponsor is your spouse - marriage certificate or\nIf sponsor is your parent - birth certificate\nc) if you are sponsored by a company in India\nin addition to point 7 & 8:\nAcknowledgement of the company's ITR Returns for the last three years\n(latest first, for example, 2022-2020)\nd) if you are sponsored by a company in Germany\nSponsor letter with a passport copy of the sponsor and copy of the German\nresidence permit (if sponsor is residing in Germany and not a German Citizen)\n2\nFebruary 2023\nYES\nNO\n14\nTraveler documentation - proof of economic status of the applicant (also\nnecessary if the trip is sponsored)\na) If you are employed:\nPay slips for the last three months and\nemployment contract and\nemployers’ statement on approval for holidays (Leave Sanction letter from\napplicant’s company) and\nApplicant’s bank statements for the last 3 months stamped by the bank (If the\npages are in continuation, kindly separate the pages; passbook copies are not\naccepted.) and\nIndian income tax return (ITR) acknowledgment for the last two assessment\nyears OR Form 16 (Certificate of Income Tax deducted at the source of salary)\nb) If you are a company owner or self-employed:\n0\ncertificate of registration of the company, including its goods and services tax\n(GST) registration number for companies based in India and\nIndian income tax return (ITR) acknowledgment for the last two assessment\nyears OR Form 16 (Certificate of Income Tax deducted at the source of salary)\nand\nApplicant’s bank statements for the last 3 months stamped by the bank (If the\npages are in continuation, kindly separate the pages; passbook copies are not\naccepted.)\nc) If you are retired:\npension statements for the last three months and/or\nproof of regular income generated by ownership of property or busines and\nApplicant’s bank statements for the last 3 months stamped by the bank (If the\npages are in continuation, kindly separate the pages; passbook copies are not\naccepted.)\nd) if you are a student:\ncertificates of the establishment at which you are enrolled and\nno objection certificate from School / University and\nfor university students: Applicant’s bank statements for the last 3 months\nstamped by the bank (If the pages are in continuation, kindly separate the\npages; passbook copies are not accepted.)\ne) if you are unemployed\nApplicant’s bank statements for the last 3 months stamped by the bank (If the\npages are in continuation, kindly separate the pages; passbook copies are not\naccepted.)\n3\nFebruary 2023\nYES\nNO\n15\nProof of civil status:\nif single: nothing else required\n-\nif applicable Marriage certificate or\n-\nif applicable Divorce decree/ custody decree or\n-\nif applicable Birth certificate of children or\n-\nif applicable Death certificate of spouse\n-\n16\nFlight reservation\n17\nOverseas travel medical insurance that is valid for all Schengen countries and\ncovers the entire duration of the Schengen trip as per your application,\nminimum coverage for medical expenses: EUR 30,000\nPlease note: German Missions accept Indian Travel Medical Insurances only\nfrom approved Indian Travel Insurance companies, you can find more\ninformation here: https://india.diplo.de/in-en/service/-/1984578\nC\nAdditional documents for applications of minor applicants\nApplication form and both declarations under 1)-3) have to be signed by both\nparents\nBirth Certificate\nPassport copy (biometric and address page) of the applicants mother\nPassport copy (biometric and address page) of the applicants father\nIf one or both parents are not submitting the visa application with the child:\ncopy of the visa of that parent\nIf only one parent submits the application:\nProof of single custody of that parent either by submittal of the court\nruling or submittal of the death certificate of the deceased parent\nOr (if both parents have shared custody) submittal of written and signed\nauthorization letter of the parent non-present with passport copy\n(biometric and address page)\nD\nAdditional documents the applicant wants to submit (please note that VFS is\nnot authorized to refuse acceptance of documents the applicant wants to\nsubmit but are not mentioned on the checklist)\nE\nInformation about biometric data\nWere the fingerprints of the applicant collected in the last 59 months for applying for a\nSchengen visa in India? If yes, please mention month and year of collection:\nPlease note that fingerprints should be taken if the applicant submits his application in\nperson even if the last submittal was within the last 59 months!\nWas the applicant excused from giving fingerprints for biometrics? If so, please specify why!\n4\nFebruary 2023\nF\nAdditional document if application is not submitted by the applicant directly\nYES\nNO\nSigned authorization letter for the travel agent or the representative\nCopy of passport of the person submitting the application\nG\nGeneral remarks of the German mission for submittal of a Schengen visa application\nA\nApplications are processed within 15 working days from the day of arrival at the visa\nsection. When submitting your application via VFS application center, please keep in\nmind that the visa application will need up to two working days to reach the visa\nsection. Public holidays of the German missions as announced on our website will\nnot count as working days.\nA AA\nPlease note that individual status inquiries cannot be answered within the standard\nprocessing time of 15 working days.\nA booked flight ticket does not result in a preferred processing of the application.\nAll documents, forms and declarations have to be submitted either in German or\nEnglish. All documents, forms and declarations not in German or English have to be\nsubmitted with proper German or English translation. Failing to provide proper\ntranslation will result in the document, form or declaration considered “missing”\nH\nSpecial remarks of the German mission for submittal of a Schengen visa application in the\nrespective category\nIf you are planning on working in Germany on your Schengen Visa, kindly check with the\ninviting company whether you need a (Pre-)approval of the Federal Employment Agency\n(Einvernehmen und / oder Zustimmung der Bundesagentur für Arbeit!)\nThe (Pre-)approval of the Federal Employment Agency (Einvernehmen und / oder\nZustimmung der Bundesagentur für Arbeit) has to be obtained by the hosting company /\ninstitution directly at the Federal Employment Agency and has to be presented when\nsubmitting the visa application. The visa section cannot apply for these documents.\nBe aware that if your visa category requires a (Pre-) approval of the Federal Employment\nAgency (Einvernehmen und / oder Zustimmung der Bundesagentur für Arbeit) and you\ncannot provide us with the same in your application, this justifies grounds for rejection!\nDeclaration of the visa applicant (signed by the representative if application is submitted\nI\nby him/her at the VFS VAC on the day of submittal)\nI have taken note of the general and special remarks as mentioned under F and G on checklist. I have\nbeen informed that VFS Global does not have any influence on the decision about a visa application!\nI confirm that the VFS officer has noted all documents submitted by me and that I want the\napplication in its present form to be forwarded to the German mission. I am aware that original\ndocuments not submitted with a copy will be kept by the visa section.\n5\nFebruary 2023\nDate:\nName, Surname of the applicant or representative:\nSignature of the applicant or representative:\nJ\nConfirmation of VFS on the day of submittal\nDate of submittal: __________________________\nVFS VAC in _____________________\nApplication submitted: by the applicant / the parents as holders of the custody of minor\napplications / a representative with proper authorization (please cross what is not applicable)\nI confirm that above this checklist has been filled out together with and signed in front of me by the\napplicant or his / her duly authorized representative at today’s appointment at the above VAC.\nVFS Officer Full Name: …………………… Signature: ……………………….….\n6\n",
          },
          {
            name: "Click Photo Specification tab",
            order: 7,
            action: "click",
            targetDescription: "Photo Specification tab button",
            targetElement: "",
            xpath: '//*[@id="photospecifications"]',
            usage: {
              input_tokens: 3476,
              output_tokens: 7,
              total_tokens: 3483,
            },
          },
          {
            name: "Extract Photo Specification",
            order: 8,
            action: "extract",
            targetDescription: "Photo Specification active tab content",
            targetElement: "",
            snapshotBeforeStep: true,
            xpath: '//*[@id="shorttermvisa"]/div/div/div[3]/div/div/div[2]',
            extractedContent:
              "#### Photo Specifications\n\n#### Photograph Quality\n\nThe photographs must be:\n\n*   No more than 6-months old\n    \n*   35-45mm in width\n    \n*   Close up of your head and top of your shoulders so that your face takes up 70 -80% of the photograph\n    \n*   In sharp focus and clear\n    \n*   Of high quality with no ink marks or creases\n    \n\nThe photographs must:\n\n*   Show you looking directly at the camera\n    \n*   Show your skin tones naturally\n    \n*   Have appropriate brightness and contrast\n    \n*   Be printed on high quality paper, and at high resolution Photographs taken with a digital camera must be high quality colour and printed on photo-quality paper.\n    \n\n#### Style and lighting\n\nThe photographs must be:\n\n*   Be colour neutral\n    \n*   Show your eyes open and clearly visible-no hair across your eyes\n    \n*   Show you facing square on to the camera, not looking over one shoulder (portrait style) or tilted, and showing both edges of your face clearly\n    \n*   Be taken with a plain white background\n    \n*   Be taken with uniform lighting and not show shadows or flash reflections on your face and no red eye\n    \n\n#### Glasses and head covers\n\nIf you wear glasses:\n\n*   Be colour neutral\n    \n*   The photograph must show your eyes clearly with no flash reflection off the glasses, and no tinted lenses (if possible, avoid heavy frames - wear lighter framed glasses if you have them)\n    \n*   Make sure that the frames do not cover any part of your eyes.\n    \n\nHead coverings :\n\n*   Are not permitted except for religious reasons, but your facial features from bottom of chin to top of forehead and both edges of your face must be clearly shown.\n    \n\n#### Expression and frame\n\nYour photographs must:\n\n*   Show you alone (no chair backs, toys or other people visible), looking at the camera with a neutral expression and your mouth closed.\n    \n\n#### Photograph Required\n\n*   2 photograph for Short term Visa (Non VIS)\n    \n*   3 Photograph for Long Term Visa\n    \n*   3 Photograph for Short Term Visa VIS case\n    \n*   4 Photograph for Long Term if the applicant is below 6 years",
            usage: {
              input_tokens: 6855,
              output_tokens: 19,
              total_tokens: 6874,
            },
          },
          {
            name: "Extract Photo Muster PDF",
            order: 9,
            action: "extractPDF",
            pdfUrl:
              "https://assets.ctfassets.net/xxg4p8gt3sg6/2FXb2emP5BPqEbydUGnhAl/e889ba8c8bc28d103a2024d1012df722/fotomustertafel_2005_english_141212.pdf",
            extractedContent:
              "S A M P L E P H O T O S\nS A M P L E P H O T O\nHigh-quality photos form\nthe\nbasis\nfor\nthe\nperfect\nsample photo\nreproduction of the image and are a precondition for the application of\nfacial biometrics in ID documents.\nThese sample photos show the quality features that warrant the\nsuitability of photos for the use foreseen in ID documents. It is vital\nthat the requirements described here be observed because otherwise\nbiometric recognition of the applicant as well as the perfect reproduction\n45 mm\nof the image in the document are not warranted.\nThe passport applicant must generally be photographed without\nany headwear. The passport authority can permit exceptions to this rule\nespecially for credible religious reasons.\nPassport law foresees that no parts of uniforms be depicted on\nthe photos.\n35 mm\n-\nminimum size\nmaximum size\nof the face\nof the face\n32 mm\n36 mm\nF O R M A T\nThe photo must clearly show the person‘s facial features from\nthe tip of the chin to the crown of the head as well as the left and right\nsides of the face. The face must take up 70 - 80% of the photo. This\ncorresponds to a height of 32 - 36mm. In the case of voluminous hair, it\nmust be ensured that the head (including the hairstyle) is fully depicted\nwithout reducing the size of the face, if possible. The height of the face\nmay not be less than 32mm. The face must be centred in the photo.\ntoo close\ntoo far away\nnot centred\nF O C U S A N D C O N T R A S T\nThe face must be sharply focused in all areas, rich in contrast\nand clear.\nblurred\nlow contrast\ntoo light\nI L L U M I N A T I O N\nThe face must be evenly illuminated. Reflections or shadows on\nthe face as well as red eyes must be avoided.\ntoo dark\nflash reflection on the face\nshadows across face\nB AC KG R O U N D\nThe background should be one colour and bright (ideally a\nneutral grey colour) and in a contrasting colour to the face and hair. In\nthe case of light coloured hair, a medium-grey background is suitable\nwhilst a light-grey background is suitable for dark hair. The background\nshould not have any pattern.\nThe photo should show only the person to be photographed (no\nother persons or objects in the photo).\nNo shadows must be shown on the background.\nshadows behind head\nbusy background\nno contrast\nP H O T O Q U A L I T Y\nThe photo should be printed on high-quality paper with a\nprint resolution of at least 600 dpi (especially when taken with a digital\ncamera).\nThe photo must be neutral in colour and skin tones should appear\nnatural.\nThe photo should have no creases or impurities.\nunnatural color\ncreased/ink marked\npixelated\nH E A D P O S I T I O N A N D\nFAC I A L E X P R E S S I O N\nThe head of the person photographed should be neither at an\nangle nor turned (portrait style).\nThe person‘s expression should be neutral with the mouth closed\nand looking directly into the camera.\nmouth open\nportrait style\nhead tilted\nE Y E S A N D L I N E O F S I G H T\nThe person in the photo must look directly into the camera.\nThe eyes must be open and clearly visible and may not be covered\nby hair or spectacle frames.\neyes closed\nhair across eyes\nlooking away\nP E R S O N S W E A R I N G G L A S S E S\nThe eyes must be clearly recognisable (reflections from glasses,\ntinted glasses or sunglasses are not permitted).\nThe edge of glasses or the frame may not cover the eyes.\nframes covering eyes\ndark tinted glasses\nflash reflection on glasses\nH E A D W E A R\nGenerally speaking, headwear is not permitted. Exceptions are\npossible, especially for religious reasons.\nIn such cases, the face must be visible from the lower tip of the\nchin to the forehead.\nNo shadows should be visible on the face.\nwearing a hat\nface covered\nshadows across face\n",
          },
          {
            name: "Click Processing Time tab",
            order: 10,
            action: "click",
            targetDescription: "Processing Time tab button",
            targetElement: "",
            xpath: '//*[@id="processingtime"]',
            usage: {
              input_tokens: 6854,
              output_tokens: 6,
              total_tokens: 6860,
            },
          },
          {
            name: "Extract Processing Time",
            order: 11,
            action: "extract",
            targetDescription: "Processing Time active tab content",
            targetElement: "",
            snapshotBeforeStep: true,
            xpath: '//*[@id="shorttermvisa"]/div/div/div[3]/div/div',
            extractedContent:
              "Overview Visa Fees Documents Required Photo Specifications Processing Time Online Application Form\n\nOverview\n\nVisa Fees\n\nDocuments Required\n\nPhoto Specifications\n\nProcessing Time\n\nOnline Application Form\n\n#### Processing Time\n\nAs a general rule,a decision will be taken by the Embassy/Consulate within 15 working days from the submission of the visa application. However, this deadline may be extended up to 30 Calendar days and even, exceptionally, 60 Calendar days, if a more detailed examination of your application and/or additional documents are required. In that case, your application will be sent to the Aliens Office in Belgium, which will take the final decision.\n\nWhen the file is presented to the Aliens Office in Belgium, the Embassy / Consulate General of Belgium shares the reference number of your file with you. This number enables you to contact the Immigration Office in order to check on the status of your file (Antwerpsesteenweg 59B, 1000 Brussels, T: +32.2.793.80.00, F: +32.2.274.66.91, helpdesk.dvzoe@dofi.fgov.be).\n\nFurthermore, using this file number, you may check on the status of your visa application on the Immigration Office website. With your passport number and last name, you can also track your visa application on this web site click here.\n\nThe Embassy / Consulate General of Belgium will inform you in each instance in writing, by telephone or orally about the decision that is finally taken concerning your visa application.",
            usage: {
              input_tokens: 3184,
              output_tokens: 15,
              total_tokens: 3199,
            },
          },
        ],
      },
    },
    totalUsage: {
      input_tokens: 50463,
      output_tokens: 117,
      total_tokens: 50580,
    },
  },
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
import {
  IGuidelineSource,
  IScrapeMetaData,
  IVisawiseInput,
} from "../src/types";
import { Visawise } from "../src/visawise";

const convertPolarisOutput = (
  polarisResult: typeof MOCK_POLARIS_OUTPUT.result,
  metaData: IScrapeMetaData,
  existingGuideline: Record<string, any>,
): IVisawiseInput => {
  const sources: IGuidelineSource[] = [];

  for (const flow of Object.values(polarisResult.flows)) {
    for (const step of flow.steps) {
      if (step.action === "extract") {
        sources.push({
          stepName: step.name,
          url: flow.url,
          content: (step as any).extractedContent ?? "",
        });
      } else if (step.action === "extractPDF") {
        sources.push({
          stepName: step.name,
          url: (step as any).pdfUrl ?? "",
          content: (step as any).extractedContent ?? "",
        });
      } else if (step.action === "extractScreenshot") {
        sources.push({
          stepName: step.name,
          url: flow.url,
          content: (step as any).extractedContent ?? "",
        });
      }
    }
  }

  return { metaData, sources, existingGuideline };
};

const automate = new Visawise({
  aiProvider: "openai",
  aiProviderKey: OPENAI_API_KEY,
});

const input = convertPolarisOutput(
  MOCK_POLARIS_OUTPUT.result,
  {
    country: "BELGIUM",
    visaType: "BELGIUM_SCHENGEN_VISA",
    subVisaType: "BELGIUM_SCHENGEN_VISA_SHORT_STAY",
  },
  {},
);

automate
  .run(input)
  .then((result) => {
    // console.log("Result guideline:");
    // console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error("Automation failed:", error);
  });
