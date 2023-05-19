
import { Router } from 'express';
import HomeController from '../controllers/Home';

const router = Router();

router.get('/', HomeController.index);

router.get('/test', async (req, res) => {
  res.send("hello")
})


export default router;
