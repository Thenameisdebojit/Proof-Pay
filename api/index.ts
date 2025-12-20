import { app, setupServer } from "../server/index";

let isSetup = false;

export default async function handler(req: any, res: any) {
  if (!isSetup) {
    await setupServer();
    isSetup = true;
  }
  app(req, res);
}
