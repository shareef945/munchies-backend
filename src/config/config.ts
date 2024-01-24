//PORTS
export const port = process.env.API_PORT || 3000;

//CONSTANTS
export const INVALID_PASSWORD_MASSAGE = "Invalid password, please try again";
export const INVALID_TOKEN_MESSAGE = "Invalid token";
export const UNPROTECTED_ROUTES = ["/transport/v1/login", "/transport/v1/auth/login", "/transport/v1/auth/token/refresh"];

//ENVIRONMENT VARIABLES
export const API_PASSWORD = process.env.API_PASSWORD;

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