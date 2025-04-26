import express, { NextFunction, Request, Response } from "express";
import { readFileSync } from "fs";

import crypto from "crypto";
import { exec } from "child_process";

const envData = readFileSync(".env", "utf-8");
envData.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  process.env[key.trim()] = value?.trim();
});

const PORT = process.env.WEBHOOK_PORT || 0;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET?.toString() || "";

const app = express();
// Middleware to parse JSON payload
app.use(express.json());

// Verify GitHub signature
const verifySignature = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const signature = req.headers["x-hub-signature-256"] as string;
  const body = JSON.stringify(req.body);
  const hash = `sha256=${crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex")}`;

  if (signature !== hash) {
    res.status(401).send("Unauthorized");
    return;
  }

  next(); // Make sure you call next() to pass control to the next middleware
};

// Webhook endpoint
app.post("/webhook", verifySignature, (req: Request, res: Response) => {
  console.log("webhook triggered");
  const payload = req.body;

  // Trigger deployment script on push event
  if (payload.ref === "refs/heads/main") {
    // Replace with your branch name
    exec(
      "cd /var/www/unitedcore && git pull --no-rebase git@github.com:Subhajit-Roy-Partho/oxCloud.git main && npm install && npm run build",
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Deployment error: ${stderr}`);
          return res.status(500).send("Deployment failed.");
        }
        console.log(`Deployment successful: ${stdout}`);
        res.status(200).send("Webhook received and processed.");

        exec(
          "npm run hook-build && pm2 restart unitedcore && pm2 restart webhook-server",

          (err, stdout, stderr) => {
            if (err) {
              console.error(`Building step error: ${stderr}`);
            }
            console.log(`Building step successful: ${stdout}`);
          }
        );
      }
    );
  } else {
    res.status(200).send("Not a main branch push.");
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
