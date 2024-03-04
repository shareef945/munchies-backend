import csv from "csv-parser";
import { Readable } from "stream";
import SftpClient from "ssh2-sftp-client";
import { SFTP_CONFIG } from "../config/config";
const fs = require("fs").promises;
const path = require("path");

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
    const month = pad(date?.getUTCMonth() + 1); 
    const day = pad(date?.getUTCDate());
    const hours = pad(date?.getUTCHours());
    const minutes = pad(date?.getUTCMinutes());
    const seconds = pad(date?.getUTCSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}+00`;
  } else if (typeof date === "string") {
    return `${date} 00:00:00+00`;
  } else {
    throw new Error("Invalid date input");
  }
}

export async function downloadCsvFromSftp() {
  console.log("Checking for CSV data...");
  const sftp = new SftpClient();
  const remotePath = "/munchies/input";

  try {
    await sftp.connect({
      host: SFTP_CONFIG.host,
      port: Number(SFTP_CONFIG.port),
      username: SFTP_CONFIG.username,
      password: SFTP_CONFIG.password,
    });

    const fileList = await sftp.list(remotePath);
    const csvFiles = fileList.filter((file) => file.name.endsWith(".csv"));

    if (csvFiles.length === 0) {
      throw new Error("No CSV files found in the remote directory.");
    }

    const firstCsvFile = csvFiles[0];
    const remoteCsvPath = `${remotePath}/${firstCsvFile.name}`;

    const csvBuffer = await sftp.get(remoteCsvPath);
    console.log("CSV file downloaded successfully");

    const csvContent = csvBuffer.toString("utf8");
    return csvContent;
  } catch (err) {
    console.error("Failed to download CSV file:", err);
    throw err;
  } finally {
    await sftp.end();
  }
}

export async function moveFilesFromSftp() {
  console.log("Moving files...");
  const sftp = new SftpClient();

  const inputPath = "/munchies/input";
  const processedPath = "/munchies/processed";
  try {
    await sftp.connect({
      host: SFTP_CONFIG.host,
      port: Number(SFTP_CONFIG.port),
      username: SFTP_CONFIG.username,
      password: SFTP_CONFIG.password,
    });

    await moveFilesAndClearDirectory(sftp, inputPath, processedPath);

    await sftp.end();
  } catch (err) {
    console.log(err);
  }
}

export async function moveFilesAndClearDirectory(
  sftp: any,
  sourceDir: string,
  destinationDir: string
) {
  try {
    await sftp.mkdir(destinationDir, true);
    const fileList = await sftp.list(sourceDir);

    for (const file of fileList) {
      const sourceFilePath = `${sourceDir}/${file.name}`;
      const destFilePath = `${destinationDir}/${file.name}`;

      await sftp.rename(sourceFilePath, destFilePath);
      console.log(`Moved file from ${sourceDir} to ${destinationDir}`);
    }
  } catch (err) {
    console.error("An error occurred:", err);
    throw err;
  }
}
