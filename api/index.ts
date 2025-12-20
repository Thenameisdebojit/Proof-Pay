import { app, setupServer } from '../server/index';

// Initialize the app
const setupPromise = setupServer();

export default async function handler(req: any, res: any) {
  await setupPromise;
  app(req, res);
}
