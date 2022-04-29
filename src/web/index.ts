import express from 'express';
import { webConfig } from '../config';
import { apiRouter } from './api';

const app = express();

app.use('/api', apiRouter);

export const launchWebServer = () => {
  app.listen(webConfig.port, () => {
    console.log(`web api now listening on ${webConfig.port}`);
  });
};
