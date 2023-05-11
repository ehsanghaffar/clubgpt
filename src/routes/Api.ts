
import { Router } from 'express';
import * as expressJwt from 'express-jwt';

import Locals from '../providers/Locals';



const router = Router();

router.get('/', HomeController.index);


export default router;
