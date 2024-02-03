import { HOUR_OF_THE_DAY } from "../config/config";
import { processEmailAttachments } from "../functions/hubtel";

var cron = require("node-cron");

export function scheduleHubtelJob() {
  // cron.schedule(`0 ${HOUR_OF_THE_DAY} * * *`, async () => {
    cron.schedule("*/1 * * * *", async () => {
    console.log(`Running the HUBTEL job at ${new Date().toLocaleString()}`);
    try {
      await processEmailAttachments();
    } catch (error) {
      console.error("Failed to complete the cron job:", error);
    }
  });
}
