
import { Router } from 'express';

import Locals from '../providers/Locals';



const router = Router();

router.get('/', HomeController.index);


export default router;
