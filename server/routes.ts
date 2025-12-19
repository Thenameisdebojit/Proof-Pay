import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
  app.post('/api/log-error', (req, res) => {
    console.error("CLIENT SIDE ERROR:", req.body);
    res.sendStatus(200);
  });

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
      });
       await storage.createFund({
        funderAddress: "GBA...",
        beneficiaryAddress: "GBC...",
        verifierAddress: "GBV...",
        amount: "500",
        conditions: "Completion of Module 1",
        deadline: "2024-06-30",
      });
    }
  }

  // Call seed
  seedDatabase();

  return httpServer;
}
