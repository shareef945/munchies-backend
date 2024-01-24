import { downloadHubtelData, insertDataIntoDB } from "../functions/hubtel";
import { parseCSV } from "../utils/utils";

var cron = require("node-cron");

cron.schedule("0 * * * *", async () => {
  // This will run every hour at minute 0
  console.log("Running the scraping job");
  try {
    const csvData = await downloadHubtelData();
    const parsedData = await parseCSV(csvData);
    await insertDataIntoDB(parsedData);
    console.log("Scraping and insertion successful");
  } catch (error) {
    console.error("Failed to complete the cron job:", error);
  }
});
