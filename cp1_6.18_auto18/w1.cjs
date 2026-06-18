const fs = require("fs"); fs.writeFileSync("src/backend/server.ts", "import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
", "utf8"); console.log("ok");
