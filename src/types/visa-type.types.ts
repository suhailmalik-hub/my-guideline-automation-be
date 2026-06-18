export interface CreateVisaTypeRequest {
  destinationCountryId: string;
  destinationCountry: string;
  visaType: string;
  subVisaType?: string;
}

export interface ListVisaTypesByDestinationRequest {
  destinationCountryId: string;
}

export interface ListSubVisaTypesByVisaTypeRequest {
  visaTypeId: string;
}

export interface VisaHierarchyItem {
  id: string;
  name: string;
  visaTypes: {
    id: string;
    visa_name: string;
    subVisaTypes: { id: string; sub_visa_name: string }[];
  }[];
}
