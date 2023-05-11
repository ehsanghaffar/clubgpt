
import { Application } from 'express';
import Locals from './Locals';
import Log from '../middlewares/Log';

import apiRouter from './../routes/Api';

class Routes {
	public mountApi(_express: Application): Application {
		const apiPrefix = Locals.config().apiPrefix;
		Log.info('Routes :: Mounting API Routes...');

		return _express.use(`/${apiPrefix}`, apiRouter);
	}
}

export default new Routes;
