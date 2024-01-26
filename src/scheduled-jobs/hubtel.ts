import { processEmailAttachments } from "../functions/hubtel";
import { parseCSV } from "../utils/utils";

var cron = require("node-cron");


export function scheduleJob() {
  cron.schedule("*/3 * * * *", async () => {
    // This will run every two minutes
    console.log("Running the processEmailAttachments job");
    try {
      await processEmailAttachments();
    } catch (error) {
      console.error("Failed to complete the cron job:", error);
    }
  });
}