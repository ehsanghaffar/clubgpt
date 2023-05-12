// @ts-nocheck
import cors from 'cors';
import { Application } from 'express';
import compress from 'compression';
import bodyParser from 'body-parser';
import session, { SessionOptions } from 'express-session';
import flash from 'express-flash';
import connectMongo from 'connect-mongo';

import Log from './Log';
import Locals from '../providers/Locals';


const MongoStore = new connectMongo(session);

class Http {
	public static mount(_express: Application): Application {
		Log.info('Booting the \'HTTP\' middleware...');

		// Enables the request body parser
		_express.use(bodyParser.json({
			limit: Locals.config().maxUploadLimit
		}));

		_express.use(bodyParser.urlencoded({
			limit: Locals.config().maxUploadLimit,
			parameterLimit: Locals.config().maxParameterLimit,
			extended: false
		}));

		// Disable the x-powered-by header in response
		_express.disable('x-powered-by');

		// Enables the request flash messages
		_express.use(flash());

		const options = {
			resave: true,
			saveUninitialized: true,
			secret: Locals.config().appSecret,
			cookie: {
				maxAge: 1209600000 // two weeks (in ms)
			},
			store: new MongoStore({
				url: process.env.MONGOOSE_URL,
				autoReconnect: true
			})
		} as SessionOptions

		_express.use(session(options));

		// Enables the CORS
		_express.use(cors());

		// Enables the "gzip" / "deflate" compression for response
		_express.use(compress());

		return _express;
	}
}

export default Http;
