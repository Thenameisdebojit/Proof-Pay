import { app, setupServer } from "../server/index";

let isSetup = false;

export default async function handler(req: any, res: any) {
  try {
    if (!isSetup) {
      await setupServer();
      isSetup = true;
    }
    app(req, res);
  } catch (err: any) {
    console.error("Server setup error:", err);
    res.status(500).json({ message: "Internal Server Error", details: err.message });
  }
}
