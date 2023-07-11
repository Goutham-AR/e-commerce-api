import express from "express";
import { StatusCodes } from "http-status-codes";
import "express-async-errors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { cpus } from "node:os";
import cluster, {Worker} from "node:cluster";
import { once } from "node:events";

import { errorHandler } from "./middlewares/errorHandler";
import { authRouter } from "./auth";
import { notFoundMiddleware } from "./middlewares/notFound";
import { config } from "./utils/config";
import { userRouter } from "./routers/userRouter";
import { productRouter } from "./routers/productRouter";
import { reviewRouter } from "./routers/reviewRouter";
import { connectDB } from "./db/db";



const app = express();
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(process.cwd(), "app/public")));




// Routes
app.get("/", (req, res) => res.json(req.cookies));
app.get("/ping", (req, res) => res.status(StatusCodes.OK).send("Ping...."));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);



app.use(notFoundMiddleware);
app.use(errorHandler);


const PORT = config.PORT;
const run = async (processId: number) => {
    try {
        // await mongoose.connect(config.DB_URI as string);
        // console.log("Successfully connected to the database...");
        await connectDB(config.DB_URI);
        app.listen(PORT, () => console.log(`Server running on port(${PORT}), process(${processId}); `));

        // getFromGridFS("photos", "64a7e149ee37959d65d250c5", () => console.log("Read"));
    } catch (error) {
        console.error(error);
    }
}

const runInClusterMode = async () => {
    if (cluster.isPrimary) {
        const availableCpus = cpus();
        console.log(`Clustering to ${availableCpus.length} processes.`);
        availableCpus.forEach(() => cluster.fork());

        cluster.on("exit", (worker, code) => {
            if (code != 0 && !worker.exitedAfterDisconnect) {
                console.log(`Worker ${worker.process.pid} crashed. ` + `Starting a new worker`);
            }
            cluster.fork();
        });

        process.on("SIGUSR2", async () => {
            const workers = Object.values(cluster.workers as unknown as NodeJS.Dict<Worker>);
            for (const worker of workers) {
                const w = worker as Worker;
                console.log(`Stopping worker: ${w.process.pid}`);
                w.disconnect();
                await once(w, "exit");
                if (!w.exitedAfterDisconnect) continue;
                const newWorker = cluster.fork();
                await once(newWorker, "listening");
                console.log(`Started worker: ${newWorker.process.pid}`);
            }

        });
    } else {
        const { pid } = process;
        await run(pid);
    }
}


run(process.pid);
// runInClusterMode();








