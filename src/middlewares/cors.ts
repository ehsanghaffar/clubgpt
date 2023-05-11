import cors from 'cors';
import { Application } from 'express';

import Log from './Log';
import Locals from '../providers/Locals';

const { url } = Locals.config();

export default {
  mount: (_express: Application) => {
    Log.info('Booting the \'CORS\' middleware...');
    const { url } = Locals.config();
    _express.use(cors({ origin: url, optionsSuccessStatus: 200 }));
    return _express;
  }
}