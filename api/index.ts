import { app, setupServer } from '../server/index';

// Cache the initialization promise to ensure setupServer is called only once
let setupPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  if (!setupPromise) {
    setupPromise = setupServer();
  }
  await setupPromise;
  
  // Forward the request to the Express app
  app(req, res);
}
