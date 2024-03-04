import { HOUR_OF_THE_DAY } from "../config/config";
import { processCsvData } from "../functions/hubtel";
import { downloadCsvFromSftp, moveFilesFromSftp } from "../utils/utils";

var cron = require("node-cron");

// Flag to indicate whether the job is currently running
// let isJobRunning = false;

export function scheduleHubtelJob() {
  // cron.schedule("11 16 * * *", async () => {
    cron.schedule(`0 ${HOUR_OF_THE_DAY} * * *`, async () => {

    // Check if the job is already running
    // if (isJobRunning) {
    //   console.log(
    //     `Skipping this run because the previous job is still running at ${new Date().toLocaleString()}`
    //   );
    //   return; // Exit the function if the job is running
    // }

    console.log(`Running the HUBTEL job at ${new Date().toLocaleString()}`);
    // isJobRunning = true; // Set the flag to indicate the job is running

    try {
      const csvData = await downloadCsvFromSftp();
      await processCsvData(csvData);
    } catch (error) {
      console.error("Failed to complete the cron job:", error);
    } finally {
      // isJobRunning = false; // Reset the flag when the job is finished
    }
  });

  cron.schedule("0 9 * * *", async () => {
    console.log("Moving files..");
    try {
      await moveFilesFromSftp();
    } catch (err: any) {
      console.log("Error moving files ..", err);
    }
  });
}
