import express from 'express';
import usersRouter from './users';
import todoRouter from './todos';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/todos', todoRouter);

export default router;
