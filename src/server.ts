import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import _ from 'lodash';

import apiRouter from './api';
import loggerMiddleware from './middleware/logger.middleware';
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(loggerMiddleware);

app.use('/api', apiRouter);

app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.log(`Server Started on port ${port}`);
});

export default app;
