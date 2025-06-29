import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv'


dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true,
    inflate: true,
    parameterLimit: 5000,
}));
app.use(cookieParser());
app.use(
    cors({
        origin: ["localhost:8810", "localhost:3300"],
        credentials: true,
    })
);
app.use(
    helmet({
        crossOriginResourcePolicy: false,
        referrerPolicy: false,
    })
);
app.use(morgan("dev"));
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
});
app.get("/", (_req: Request, res: Response, _next: NextFunction) => {
    res.send("Inventory API Home Page");
});

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
} )
