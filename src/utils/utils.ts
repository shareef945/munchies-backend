import csv from "csv-parser";
import { Readable } from "stream";

export async function parseCSV(csvData: string): Promise<any[]> {
  const results: any[] = [];
  const csvStream = csv();

  // Convert the CSV data string to a stream
  const readableStream = new Readable({
    read() {
      process.nextTick(() => {
        this.push(csvData);
        this.push(null);
      });
    },
  });

  readableStream.pipe(csvStream);

  return new Promise((resolve, reject) => {
    csvStream
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

export class ValidationError extends Error {
  formattedErrors: any;
  constructor(formattedErrors: any) {
    super("Validation error");
    this.name = "ValidationError";
    this.message = "Validation Error";
    this.formattedErrors = formattedErrors;
  }
}


export function formatDateQuery(date: Date | string): string {
  const pad = (num: number): string => num?.toString().padStart(2, "0");

  if (date instanceof Date) {
    const year = date?.getUTCFullYear();
    const month = pad(date?.getUTCMonth() + 1); // getUTCMonth() returns 0-11
    const day = pad(date?.getUTCDate());
    const hours = pad(date?.getUTCHours());
    const minutes = pad(date?.getUTCMinutes());
    const seconds = pad(date?.getUTCSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}+00`;
  } else if (typeof date === 'string') {
    // If the date is a string in the format "YYYY-MM-DD", append the default time
    return `${date} 00:00:00+00`;
  } else {
    throw new Error('Invalid date input');
  }
}