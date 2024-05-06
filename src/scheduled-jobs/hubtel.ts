import { HOUR_OF_THE_DAY } from "../config/config";
import { processCsvData } from "../functions/hubtel";
import { downloadCsvFromSftp, moveFilesFromSftp } from "../utils/utils";

var cron = require("node-cron");

export async function scheduleHubtelJob() {
  // cron.schedule("41 13 * * *", async () => {
  cron.schedule(`0 ${HOUR_OF_THE_DAY} * * *`, async () => {
    console.log(`Running the HUBTEL job at ${new Date().toLocaleString()}`);

    try {
      const csvData = await downloadCsvFromSftp();
      await processCsvData(csvData);
    } catch (error) {
      console.error("Failed to complete the cron job:", error);
    } finally {
    }
  });

  cron.schedule("00 9 * * *", async () => {
    console.log(`Moving files at${new Date().toLocaleString()}`);
    try {
      await moveFilesFromSftp();
      console.log(`Successfully moved files at ${new Date().toLocaleString()}`);
    } catch (err: any) {
      console.log("Error moving files ..", err);
    }
  });
}
