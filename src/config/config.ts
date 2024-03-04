//PORTS
export const port = process.env.PORT || 3000;

//CONSTANTS
export const INVALID_PASSWORD_MASSAGE = "Invalid password, please try again";
export const INVALID_TOKEN_MESSAGE = "Invalid token";
export const UNPROTECTED_ROUTES = ["/v1/login"];

//ENVIRONMENT VARIABLES
export const API_PASSWORD = process.env.API_PASSWORD;
export const API_SECRET = process.env.API_SECRET;
export const HOUR_OF_THE_DAY = process.env.HOUR_OF_THE_DAY;

// STATUS CODES
export const STATUS_OK = 200;
export const STATUS_CREATED = 201;
export const STATUS_BAD_REQUEST = 400;
export const STATUS_INTERNAL_SERVER_ERROR = 500;
export const STATUS_CONFLICT = 409;

//HUBTEL
export const HUBTEL_USERNAME = process.env.HUBTEL_USERNAME;
export const HUBTEL_PASSWORD = process.env.HUBTEL_PASSWORD;
export const HUBTEL_DOWNLOAD_URL = process.env.HUBTEL_DOWNLOAD_URL;

//ASHESI
export const ASHESI_USERNAME = process.env.ASHESI_USERNAME;
export const ASHESI_PASSWORD = process.env.ASHESI_PASSWORD;
export const ASHESI_DOWNLOAD_URL = process.env.ASHESI_DOWNLOAD_URL;

//EMAIL
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const EMAIL_PORT = process.env.EMAIL_PORT;

//DB
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const DB_PORT = process.env.DB_PORT;
export const TABLE_NAME = process.env.TABLE_NAME;

//SMS
export const TWILIO_SID = process.env.TWILIO_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
export const TWILIO_RECEIPIENT = process.env.TWILIO_RECEIPIENT;

//SFTP
export const SFTP_CONFIG = {
  host: process.env.SFTP_SERVER,
  port: process.env.SFTP_PORT,
  username: process.env.SFTP_USERNAME,
  password: process.env.SFTP_PASSWORD,
};
