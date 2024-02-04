import Router from 'express-promise-router';
import v1router from './v1';

const router = Router();

router.use('/v1', v1router);

export default router;
