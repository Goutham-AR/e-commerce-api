import { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
    statusCode: number
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}


export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, StatusCodes.BAD_REQUEST);
    }
}


export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(message, StatusCodes.NOT_FOUND);
    }
}


export class UnauthenticatedError extends ApiError {
    constructor(message: string) {
        super(message, StatusCodes.UNAUTHORIZED);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string) {
        super(message, StatusCodes.FORBIDDEN);
    }
}



