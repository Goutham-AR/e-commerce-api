import { IPayloadJWT } from "../../utils/auth";

export {}

declare global {
    namespace Express {
        export interface Request {
            user?: IPayloadJWT,
        }
    }
}