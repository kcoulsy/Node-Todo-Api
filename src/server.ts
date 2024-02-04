import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import _ from 'lodash';

import todoRoutes from './routes/todos';
import userRoutes from './routes/user';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// basic logging middleware
app.use((req, res, next) => {
  console.log('Request: ', req.method, req.url);
  next();
});

app.use('/todos', todoRoutes);
app.use('/users', userRoutes);

app.listen(port, () => {
  console.log(`Server Started on port ${port}`);
});

export default app;
