// @ts-nocheck
import { NextFunction, Request, Response } from 'express';

import ErrorResponse from '../interfaces/ErrorResponse';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

import Log from '../middlewares/Log';
import Locals from '../providers/Locals';

class Handler {
  /**
   * Handles all the not found routes
   */

  public static notFoundHandler(_express): any {
    const apiPrefix = Locals.config().apiPrefix;

    _express.use('*', (req, res) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      Log.error(`Path '${req.originalUrl}' not found [IP: '${ip}']!`);
      if (req.xhr || req.originalUrl.includes(`/${apiPrefix}/`)) {
        return res.json({
          error: 'Page Not Found'
        });
      } else {
        res.status(404);
        return res.render('pages/error', {
          title: 'Page Not Found',
          error: []
        });
      }
    });

    return _express;
  }

  /**
   * Handles your api/web routes errors/exception
   */

  public static clientErrorHandler(err, req, res, next): any {
    Log.error(err.stack);

    if (req.xhr) {
      return res.status(500).send({ error: 'Something went wrong!' });
    } else {
      return next(err);
    }
  }

  /**
   * Show undermaintenance page incase of errors
   */
  public static errorHandler(err, req, res, next): any {
    Log.error(err.stack);
    res.status(500);

    const apiPrefix = Locals.config().apiPrefix;
    if (req.originalUrl.includes(`/${apiPrefix}/`)) {

      if (err.name && err.name === 'UnauthorizedError') {
        const innerMessage = err.inner && err.inner.message ? err.inner.message : undefined;
        return res.json({
          error: [
            'Invalid Token!',
            innerMessage
          ]
        });
      }

      return res.json({
        error: err
      });
    }

    return res.render('pages/error', { error: err.stack, title: 'Under Maintenance' });
  }

  /**
   * Register your error / exception monitoring
   * tools right here ie. before "next(err)"!
   */
  public static logErrors(err, req, res, next): any {
    Log.error(err.stack);

    return next(err);
  }
}

export default Handler;
