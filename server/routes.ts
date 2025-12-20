import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure storage for multer
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ 
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + '-' + file.originalname)
    }
  })
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // File upload route
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // In a real IPFS scenario, we would upload to IPFS here and return the hash.
    // For this demo, we return the local filename as the "hash".
    res.json({ hash: req.file.filename, url: `/uploads/${req.file.filename}` });
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
      // Basic static file serving for uploads
      const filePath = path.join(uploadDir, req.path);
      if (fs.existsSync(filePath)) {
          res.sendFile(filePath);
      } else {
          next();
      }
  });

  // List funds
  app.get(api.funds.list.path, async (req, res) => {
    const role = req.query.role as string | undefined;
    const address = req.query.address as string | undefined;
    const funds = await storage.getFunds(role, address);
    res.json(funds);
  });

  // Get single fund
  app.get(api.funds.get.path, async (req, res) => {
    const fund = await storage.getFund(Number(req.params.id));
    if (!fund) {
      return res.status(404).json({ message: 'Fund not found' });
    }
    res.json(fund);
  });

  // Create fund
  app.post(api.funds.create.path, async (req, res) => {
    try {
      const input = api.funds.create.input.parse(req.body);
      const fund = await storage.createFund(input);
      res.status(201).json(fund);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Submit proof
  app.patch(api.funds.submitProof.path, async (req, res) => {
    try {
      const input = api.funds.submitProof.input.parse(req.body);
      const updated = await storage.submitProof(Number(req.params.id), input);
      if (!updated) {
         return res.status(404).json({ message: 'Fund not found' });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Verify fund
  app.patch(api.funds.verify.path, async (req, res) => {
    try {
      const input = api.funds.verify.input.parse(req.body);
      const updated = await storage.verifyFund(Number(req.params.id), input);
      if (!updated) {
         return res.status(404).json({ message: 'Fund not found' });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed data function
  async function seedDatabase() {
    const existing = await storage.getFunds();
    if (existing.length === 0) {
      await storage.createFund({
        funderAddress: "GBA...",
        beneficiaryAddress: "GBC...",
        verifierAddress: "GBV...",
        amount: "1000",
        conditions: "Must maintain GPA > 3.5",
        deadline: "2025-12-31",
        requiredDocuments: null
      });
       await storage.createFund({
        funderAddress: "GBA...",
        beneficiaryAddress: "GBC...",
        verifierAddress: "GBV...",
        amount: "500",
        conditions: "Complete CS101",
        deadline: "2025-06-30",
        requiredDocuments: null
      });
    }
  }

  // Call seed
  seedDatabase();

  return httpServer;
}
