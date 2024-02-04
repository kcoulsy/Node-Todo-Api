import Router from 'express-promise-router';
import usersRouter from './users';
import todoRouter from './todos';

const router = Router();

router.use('/users', usersRouter);
router.use('/todos', todoRouter);

export default router;
