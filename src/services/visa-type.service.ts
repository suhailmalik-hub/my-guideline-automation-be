import { Op } from "sequelize";
import { HttpStatus } from "../lib/enum";
import { AppError } from "../lib/error";
import { DestinationCountriesModel } from "../models/destination-countries.model";
import { SubVisaTypesModel } from "../models/sub-visa-types.model";
import { VisaTypesModel } from "../models/visa-types.model";
import {
  CreateVisaTypeRequest,
  ListSubVisaTypesByVisaTypeRequest,
  ListVisaTypesByDestinationRequest,
  VisaHierarchyItem,
} from "../types/visa-type.types";

export async function createVisaType(
  req: CreateVisaTypeRequest,
): Promise<void> {
  try {
    // Step 1 — verify destination country exists
    const destinationCountry = await DestinationCountriesModel.findOne({
      where: { id: req.destinationCountryId },
    });

    if (!destinationCountry) {
      throw new AppError(
        `Destination country not found for id: ${req.destinationCountryId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Step 2 — find or create visa type
    let visaType = await VisaTypesModel.findOne({
      where: {
        destination_country_id: req.destinationCountryId,
        visa_name: { [Op.iLike]: req.visaType },
      },
    });

    if (!visaType) {
      visaType = await VisaTypesModel.create({
        destination_country_id: req.destinationCountryId,
        destination_country: req.destinationCountry,
        visa_name: req.visaType,
      });
    }

    // Step 3 — create sub visa type if provided, block duplicates
    if (req.subVisaType) {
      const existingSubVisaType = await SubVisaTypesModel.findOne({
        where: {
          visa_id: visaType.id,
          sub_visa_name: { [Op.iLike]: req.subVisaType },
        },
      });

      if (existingSubVisaType) {
        throw new AppError(
          `Sub visa type "${req.subVisaType}" already exists under visa type: ${visaType.visa_name}`,
          HttpStatus.CONFLICT,
        );
      }

      await SubVisaTypesModel.create({
        destination_country_id: req.destinationCountryId,
        destination_country: req.destinationCountry,
        visa_id: visaType.id,
        visa_name: visaType.visa_name,
        sub_visa_name: req.subVisaType,
      });
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(
      `createVisaType failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function listVisaTypesByDestination(
  req: ListVisaTypesByDestinationRequest,
): Promise<VisaTypesModel[]> {
  try {
    return VisaTypesModel.findAll({
      where: { destination_country_id: req.destinationCountryId },
      attributes: ["id", "visa_name"],
      order: [["visa_name", "ASC"]],
    });
  } catch (error) {
    throw new Error(
      `listVisaTypesByDestination failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function listSubVisaTypesByVisaType(
  req: ListSubVisaTypesByVisaTypeRequest,
): Promise<SubVisaTypesModel[]> {
  try {
    return SubVisaTypesModel.findAll({
      where: { visa_id: req.visaTypeId },
      attributes: ["id", "sub_visa_name"],
      order: [["sub_visa_name", "ASC"]],
    });
  } catch (error) {
    throw new Error(
      `listSubVisaTypesByVisaType failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function listAllVisaHierarchy(): Promise<VisaHierarchyItem[]> {
  try {
    const [destinationCountries, visaTypes, subVisaTypes] = await Promise.all([
      DestinationCountriesModel.findAll({
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
      }),
      VisaTypesModel.findAll({
        attributes: ["id", "destination_country_id", "visa_name"],
        order: [["visa_name", "ASC"]],
      }),
      SubVisaTypesModel.findAll({
        attributes: ["id", "visa_id", "sub_visa_name"],
        order: [["sub_visa_name", "ASC"]],
      }),
    ]);

    return destinationCountries.reduce<VisaHierarchyItem[]>((acc, country) => {
      const countryVisaTypes = visaTypes
        .filter((visaType) => visaType.destination_country_id === country.id)
        .map((visaType) => ({
          id: visaType.id,
          visa_name: visaType.visa_name,
          subVisaTypes: subVisaTypes
            .filter((subVisaType) => subVisaType.visa_id === visaType.id)
            .map((subVisaType) => ({
              id: subVisaType.id,
              sub_visa_name: subVisaType.sub_visa_name,
            })),
        }));

      if (countryVisaTypes.length > 0) {
        acc.push({
          id: country.id as string,
          name: country.name,
          visaTypes: countryVisaTypes,
        });
      }

      return acc;
    }, []);
  } catch (error) {
    throw new Error(
      `listAllVisaHierarchy failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}
