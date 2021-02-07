import { ERROR_MESSAGE } from "../ErrorMessages";
export class ErrorHandler extends Error {
    constructor(statusCode, customMessage, message) {
        super();
        this.statusCode = statusCode;
        this.customMessage = customMessage;
        this.message = message;
    }
}
export const handleError = (err, req, res, next) => {
    const statusCode = err.statusCode || 400;
    const message = err.customMessage || ERROR_MESSAGE.DEFAULT_ERROR_MESSAGE;
    console.error(err);

    res.status(statusCode).json({
        success: false,
        message
    });
};
