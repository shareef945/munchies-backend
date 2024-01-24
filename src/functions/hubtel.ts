import {
  HUBTEL_DOWNLOAD_URL,
  HUBTEL_PASSWORD,
  HUBTEL_USERNAME,
} from "../config/config";

const puppeteer = require("puppeteer");

export async function downloadHubtelData() {
  const url = HUBTEL_DOWNLOAD_URL;

  const loginDetails = {
    username: HUBTEL_USERNAME,
    password: HUBTEL_PASSWORD,
  };
  const downloadButtonSelector = "#downloadButton"; // Replace with the actual selector

  // Launch the browser
  const browser = await puppeteer.launch();
  // Open a new page
  const page = await browser.newPage();

  try {
    // Go to the login page
    await page.goto(url, { waitUntil: "networkidle2" });

    // Input login details and submit the form
    await page.type("input[name=username]", loginDetails.username);
    await page.type("input[name=password]", loginDetails.password);
    await page.click("button[type=submit]");

    // Wait for navigation after the login
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Click the download button
    await page.click(downloadButtonSelector);

    // Wait for the file to be downloaded
    // This part may need to be adjusted depending on how the CSV is provided
    // For example, if it's a direct download you can intercept the request
    // and get the CSV content from the response

    // The following is a pseudo-code example. You'll need to adapt this part
    // to fit how the website provides the CSV download
    const csvData = await page.evaluate(() => {
      // Perform actions to get the CSV data
      // This could be an AJAX request that returns the CSV data as a string
      // or other methods depending on the website's functionality
    });

    // Close the browser
    await browser.close();

    // Return the CSV data
    return csvData;
  } catch (error) {
    console.error("Error downloading CSV data:", error);
    await browser.close();
    throw error;
  }
}

export async function insertDataIntoDB(data:any) {
  // Insert the data into the database
}