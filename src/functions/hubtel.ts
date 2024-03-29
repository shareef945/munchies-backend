import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  TABLE_NAME,
} from "../config/config";
import { sendTwilioMessage } from "./sms";
const { Pool } = require("pg");
const fastcsv = require("fast-csv");
const { parse, format } = require("date-fns");

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
});

//figure out how to send SMS for failed inserts.
export async function processCsvData(csvContent: any) {
  const client = await pool.connect();
  console.log("Connected to the database");
  let pendingInserts = 0;

  const inserts: any = [];

  let duplicateErrorOccurred = false;

  try {
    console.log("Inserting data please wait...");
    const stream = fastcsv
      .parse({ headers: true })
      .on("data", (row: any) => {
        if (!row["Date"] || row["Date"].trim() === "") {
          // console.log("Skipping row with null or empty Id");
          return;
        }

        if (duplicateErrorOccurred) {
          return; // Skip further processing if a duplicate error has been encountered
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
              if (insertError.code === "23505") {
                // PostgreSQL error code for unique violation
                if (!duplicateErrorOccurred) {
                  duplicateErrorOccurred = true;
                  // console.error(
                  //   "Duplicate data detected, stopping further inserts:",
                  //   insertError
                  // );
                  sendTwilioMessage(
                    "Duplicate data detected, stopping further inserts."
                  );
                  console.log(
                    "Duplicate data detected, stopping further inserts."
                  );
                  stream.end(); // Stop processing the CSV
                }
              } else {
                console.error("Error inserting data:", insertError);
              }
            })
            .finally(() => {
              pendingInserts--;
              if (pendingInserts === 0 && !duplicateErrorOccurred) {
                stream.resume();
              }
            })
        );
      })
      .on("end", async () => {
        console.log(
          "Finished processing CSV data. Waiting for all inserts to complete."
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
    sendTwilioMessage("Error processing Hubtel data, please check logs.");
    await client.release();
  }
}

export function getPieChartData(transactions: any[]) {
  const labels = {
    mobileMoney: "Mobile Money",
    card: "Card",
    cash: "Cash",
  };

  return Object.entries(
    transactions.reduce(
      (acc: any, curr: any) => {
        const { "Payment Type": paymentType, "Amount After Charges": amount } =
          curr;
        if (paymentType === "mobilemoney") {
          acc.mobileMoney += amount;
        } else if (paymentType === "card") {
          acc.card += amount;
        } else if (paymentType === "cash") {
          acc.cash += amount;
        }
        return acc;
      },
      { mobileMoney: 0, card: 0, cash: 0 }
    )
  ).map(([key, value]) => ({
    name: labels[key as keyof typeof labels],
    sales: value,
  }));
}

export function getMonthlyRevenueChartData(transactions: any[]) {
  const labels: { [key: string]: string } = {
    mobilemoney: "Mobile Money",
    card: "Card",
    cash: "Cash",
  };

  const grouped: { [key: string]: any } = {};
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "short" })
  );
  for (const month of months) {
    grouped[month] = { month };
    for (const label of Object.values(labels)) {
      grouped[month][label] = 0;
    }
  }

  transactions.forEach((curr: any) => {
    const month = new Date(curr.Date).toLocaleString("default", {
      month: "short",
    });
    const group = labels[curr["Payment Type"]];
    grouped[month][group] += curr["Amount After Charges"];
  });

  return Object.values(grouped);
}
