// Netlify serverless function wrapper for Express app
import serverless from 'serverless-http';
import app from '../../src/index';

// Export the handler for Netlify Functions
export const handler = serverless(app);

