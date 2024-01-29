import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_USERNAME,
  HUBTEL_PASSWORD,
  HUBTEL_USERNAME,
  TABLE_NAME,
} from "../config/config";
import { sendTwilioMessage } from "./sms";
const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { Pool } = require("pg");
const fs = require("fs");
const { once } = require("events");
const fastcsv = require("fast-csv");
const { parse, format } = require("date-fns");

const imapConfig = {
  user: EMAIL_USERNAME,
  password: EMAIL_PASSWORD,
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
});

async function processCsvData(csvContent: any) {
  const client = await pool.connect();
  console.log("Connected to the database");
  let pendingInserts = 0;
  const inserts: any = [];

  try {
    console.log("Inserting data please wait...");
    const stream = fastcsv
      .parse({ headers: true })
      .on("data", (row: any) => {
        if (!row["Date"] || row["Date"].trim() === "") {
          // console.log("Skipping row with null or empty Id");
          return;
        }
        pendingInserts++;
        stream.pause();

        let dateStr = row["Date"];
        let formattedDate;

        if (dateStr.includes(" ")) {
          formattedDate = dateStr;
        } else {
          const parsedDate = parse(dateStr, "MM/dd/yyyyHH:mm:ss", new Date());

          if (isNaN(parsedDate.getTime())) {
            throw new Error(`Invalid date: ${dateStr}`);
          }

          formattedDate = format(parsedDate, "yyyy-MM-dd HH:mm:ss");
        }
        const insertText = `
        INSERT INTO "${TABLE_NAME}"(
          "Date" ,
          "Payment Type",
          "Recurring Payment" ,
          "Hubtel Transaction Id",
          "Unique Identifier",
          "Customer Number",
          "Customer Name",
          "Channel",
          "Network Id",
          "Client Reference",
          "Amount Paid",
          "Amount After Charges",
          "Charges",
          "Charge Customer" ,
          "Note",
          "Description",
          "Employee Name",
          "Branch Name",
          "Status",
          "Provider Response Code",
          "Receipt Number",
          "Currency",
          "Card Scheme",
          "Card Number",
          "Card Transaction Id",
          "Amount Tendered",
          "Is Refunded" ,
          "Hubtel Reference"
        ) VALUES(
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
        )`;
        const insertValues = [
          formattedDate,
          row["Payment Type"],
          row["Recurring Payment"],
          row["Hubtel Transaction Id"],
          row["Unique Identifier"],
          row["Customer Number"],
          row["Customer Name"],
          row["Channel"],
          row["Network Id"],
          row["Client Reference"],
          row["Amount Paid"],
          row["Amount After Charges"],
          row["Charges"],
          row["Charge Customer"],
          row["Note"],
          row["Description"],
          row["Employee Name"],
          row["Branch Name"],
          row["Status"],
          row["Provider Response Code"],
          row["Receipt Number"],
          row["Currency"],
          row["Card Scheme"],
          row["Card Number"],
          row["Card Transaction Id"],
          row["Amount Tendered"],
          row["Is Refunded"],
          row["Hubtel Reference"],
        ];
        // console.log("Inserting data please wait...");
        inserts.push(
          client
            .query(insertText, insertValues)
            .catch((insertError: any) => {
              console.error("Error inserting data:", insertError);
            })
            .finally(() => {
              pendingInserts--;
              if (pendingInserts === 0) {
                stream.resume();
              }
            }),
        );
      })
      .on("end", async () => {
        console.log(
          "Finished processing CSV data. Waiting for all inserts to complete.",
        );
        sendTwilioMessage("Hubtel data processed successfully.");
        await Promise.all(inserts);
        client.release();
        console.log("All data inserted and database connection released.");
      })
      .on("error", (error: any) => {
        console.error("Error processing CSV data:", error);
        sendTwilioMessage("Error processing Hubtel data, please check logs.");
      });

    stream.write(csvContent);
    stream.end();
  } catch (dbErr) {
    console.error("Database error:", dbErr);
    await client.release();
  }
}

export function processEmailAttachments(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const imap = new Imap(imapConfig);
    console.log("Connecting to the email server");

    imap.once("ready", () => {
      console.log("Connected to the email server");
      imap.openBox("INBOX", false, () => {
        console.log("Opened the inbox");
        imap.search(
          ["UNSEEN", ["SINCE", new Date()]],
          async (err: any, results: any) => {
            if (err || !results.length) {
              console.log("No unread emails found");
              imap.end();
              resolve(undefined); // Pass undefined to resolve
              return;
            }

            console.log("Found unread emails");
            const f = imap.fetch(results, { bodies: "" });

            f.on("message", (msg: any, seqno: any) => {
              console.log(`Processing message ${seqno}`);
              msg.on("body", (stream: any) => {
                simpleParser(stream, async (err: any, parsed: any) => {
                  if (err) {
                    console.error("Error parsing email:", err);
                    reject(err);
                    return;
                  }

                  for (const attachment of parsed.attachments) {
                    if (attachment.contentType === "text/csv") {
                      console.log(
                        `Processing attachment: ${attachment.filename}`,
                      );
                      await processCsvData(attachment.content);
                    }
                  }
                });
              });
            });

            f.once("end", () => {
              imap.end();
              resolve(undefined); // Pass undefined to resolve
            });
          },
        );
      });
    });

    imap.connect();
  });
}
