import "dotenv/config";
import db, {
  connectDB,
} from "../src/lib/connections/db-connection/db.connection";
import { DestinationCountriesModel } from "../src/models/destination-countries.model";

const DESTINATION_COUNTRIES: { name: string; alpha2: string; alpha3: string }[] =
  [
    { name: "AUSTRALIA", alpha2: "AU", alpha3: "AUS" },
    { name: "BELGIUM", alpha2: "BE", alpha3: "BEL" },
    { name: "FRANCE", alpha2: "FR", alpha3: "FRA" },
    { name: "GERMANY", alpha2: "DE", alpha3: "DEU" },
    { name: "INDONESIA", alpha2: "ID", alpha3: "IDN" },
    { name: "ITALY", alpha2: "IT", alpha3: "ITA" },
    { name: "NETHERLANDS", alpha2: "NL", alpha3: "NLD" },
    { name: "POLAND", alpha2: "PL", alpha3: "POL" },
    { name: "PORTUGAL", alpha2: "PT", alpha3: "PRT" },
    { name: "SWITZERLAND", alpha2: "CH", alpha3: "CHE" },
    { name: "UNITED KINGDOM", alpha2: "GB", alpha3: "GBR" },
    { name: "UNITED STATES OF AMERICA", alpha2: "US", alpha3: "USA" },
  ];

async function seed(): Promise<void> {
  try {
    await connectDB();

    const existing = await DestinationCountriesModel.count();
    if (existing > 0) {
      console.log(
        `Skipping seed — ${existing} destination countries already exist in at_destination_countries.`,
      );
      await db.close();
      return;
    }

    await DestinationCountriesModel.bulkCreate(DESTINATION_COUNTRIES);
    console.log(
      `Seeded ${DESTINATION_COUNTRIES.length} destination countries into at_destination_countries.`,
    );
  } catch (error) {
    throw new Error(
      `seed-destination-countries failed: ${error instanceof Error ? error.message : error}`,
    );
  } finally {
    await db.close();
  }
}

seed();
