import { DestinationCountriesModel } from "../models/destination-countries.model";
import { WorldCountriesModel } from "../models/world-countries.model";

export async function listWorldCountries(): Promise<WorldCountriesModel[]> {
  try {
    return WorldCountriesModel.findAll({
      attributes: ["id", "name", "alpha2", "alpha3"],
      order: [["name", "ASC"]],
    });
  } catch (error) {
    throw new Error(
      `listWorldCountries failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function listDestinationCountries(): Promise<
  DestinationCountriesModel[]
> {
  try {
    return DestinationCountriesModel.findAll({
      attributes: ["id", "name", "alpha2", "alpha3"],
      order: [["name", "ASC"]],
    });
  } catch (error) {
    throw new Error(
      `listDestinationCountries failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}
