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
const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { Pool } = require("pg");
const fs = require("fs");
const { once } = require("events");
const fastcsv = require("fast-csv");

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

async function processCsvData(csvContent:any) {
  const client = await pool.connect();
  console.log("Connected to the database");
  let pendingInserts = 0;
  const inserts:any = []; 

  try {
    const stream = fastcsv
      .parse({ headers: true })
      .on("data", (row:any) => {
        if (!row["Id"] || row["Id"].trim() === "") {
          // console.log("Skipping row with null or empty Id");
          return; 
        }
        pendingInserts++; 
        stream.pause(); 

        const insertText = `
        INSERT INTO "${TABLE_NAME}"(
          "Updated By", "Id", " Updated Date", " Name", " Branch Name", " Item Type", 
          " Category", " Color", " Size", " Weight", " Model", " Other Key", " Other Value", 
          " Selling Price", " Barcode", " SKU", " New Quantity", " Old Quantity", 
          " Quantity Difference", " Low Stock Limit", " Expiry Date", " Reason"
        ) VALUES(
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
          $15, $16, $17, $18, $19, $20, $21, $22
        )`;
        const insertValues = [
          row["Updated By"],
          row["Id"],
          row[" Updated Date"],
          row[" Name"],
          row[" Branch Name"],
          row[" Item Type"],
          row[" Category"],
          row[" Color"],
          row[" Size"],
          row[" Weight"],
          row[" Model"],
          row[" Other Key"],
          row[" Other Value"],
          row[" Selling Price"],
          row[" Barcode"],
          row[" SKU"],
          row[" New Quantity"],
          row[" Old Quantity"],
          row[" Quantity Difference"],
          row[" Low Stock Limit"],
          row[" Expiry Date"],
          row[" Reason"],
        ];

        inserts.push(
          client
            .query(insertText, insertValues)
            .catch((insertError:any) => {
              console.error("Error inserting data:", insertError);
            })
            .finally(() => {
              pendingInserts--; 
              if (pendingInserts === 0) {
                stream.resume();
              }
            })
        );
      })
      .on("end", async () => {
        console.log(
          "Finished processing CSV data. Waiting for all inserts to complete."
        );
        await Promise.all(inserts); 
        client.release();
        console.log("All data inserted and database connection released.");
      })
      .on("error", (error:any) => {
        console.error("Error processing CSV data:", error);
      });

    // Pipe the CSV content to the stream
    stream.write(csvContent);
    stream.end();
  } catch (dbErr) {
    console.error("Database error:", dbErr);
    await client.release(); 
  }
}

// Function to process email attachments
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
                        `Processing attachment: ${attachment.filename}`
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
          }
        );
      });
    });

    imap.connect();
  });
}
