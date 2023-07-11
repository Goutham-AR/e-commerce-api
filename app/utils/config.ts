import dotenv from "dotenv";
import { expand } from "dotenv-expand";


interface ENV {
    DB_URI: string | undefined,
    PORT: number | undefined,
    JWT_SECRET: string | undefined,
    JWT_LIFETIME: string | undefined,
    NODE_ENV: string | undefined,
}

interface Config {
    DB_URI: string,
    PORT: number,
    JWT_SECRET: string,
    JWT_LIFETIME: string,    
    NODE_ENV: string,
}


const getEnvVars: () => ENV = () => {
    expand(dotenv.config());
    return { 
        DB_URI: process.env.DB_URI,
        PORT: Number(process.env.PORT) || undefined,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_LIFETIME: process.env.JWT_LIFETIME,
        NODE_ENV: process.env.NODE_ENV || "dev",
    };
}

const sanitizeEnv: (e: ENV) => Config = (e: ENV) => {
    let errMsg = "";
    Object.entries(e).forEach(([key, value]) => {
        if (value === undefined) {
            errMsg += `env var ${key} not set\n`;
        }
    });
    if (errMsg != "") {
        console.error(errMsg);
        process.exit(1);
    }

    return e as Config;

}



const env = getEnvVars();
export const config = sanitizeEnv(env);
