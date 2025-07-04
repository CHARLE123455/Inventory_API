import joi, { string } from 'joi';
import { AppError } from '../util/error';


const env = joi.object({
    PORT: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRES_IN:joi.string().required(),
    EMAIL_HOST: joi.string().required(),
    EMAIL_PORT: joi.string().required(),
    EMAIL_USER:joi.string().required(),
    EMAIL_PASS: joi.string().required(),
    NODE_ENV: joi.string(),
    CLOUDINARY_CLOUD_NAME: joi.string().required(),
    CLOUDINARY_API_KEY:joi.string().required(),
    CLOUDINARY_API_SECRET: joi.string().required(),
}).unknown();

const { error, value: envVariables } = env.validate(process.env, {
    abortEarly: false,
    stripUnknown: true,
});

if (error) {
    console.error("Config validation error(s):");
    error.details.forEach((detail) => {
        console.error(`- ${detail.message}`);
    });
    throw new AppError(400, "Environment variables validation failed.");
 };

 const config = {
     port: envVariables.PORT,
     jwtSecret: envVariables.JWT_SECRET,
     jwtExpires: envVariables.JWT_EXPIRES_IN,
     emailHost: envVariables.EMAIL_HOST,
     emailPort: envVariables.EMAIL_PORT,
     emailUser: envVariables.EMAIL_PORT,
     emailPass: envVariables.EMAIL_PASS,
     nodeEnv: envVariables.NODE_ENV,
     cloudName: envVariables.CLOUDINARY_CLOUD_NAME,
     apiKey: envVariables.CLOUDINARY_API_KEY,
     apiSecret: envVariables.CLOUDINARY_API_SECRET,
 };

 export default config;