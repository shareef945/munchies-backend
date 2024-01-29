import {
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_NUMBER,
  TWILIO_RECEIPIENT,
} from "../config/config";
const client = require("twilio")(TWILIO_SID, TWILIO_AUTH_TOKEN);

export function sendTwilioMessage(body: string) {
  client.messages
    .create({
      body: body,
      to: TWILIO_RECEIPIENT,
      from: TWILIO_NUMBER,
    })
    .then(() => console.log(`Text Message sent`))
    .catch((error: any) =>
      console.error(`Failed to send message: ${error.message}`),
    );
}
