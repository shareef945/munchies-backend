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
