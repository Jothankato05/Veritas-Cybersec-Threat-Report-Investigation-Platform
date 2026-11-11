import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Middleware, validation, prefix and CORS shared by the long-running server (main.ts) and the
// Vercel function (api/index.ts), so both behave the same.
export function configureApp(app: INestApplication) {
  // Security Middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP in dev for easier frontend debugging
  }));
  app.use(cookieParser());

  // CSRF Protection disabled in development - enable in production with proper cookie options
  // Note: CSRF protection requires cookies to be set up properly with SameSite and Secure flags
  // For development with separate frontend/backend, this blocks API requests
  // if (process.env.NODE_ENV === 'production') {
  //   const csurf = require('csurf');
  //   app.use(csurf({ cookie: true }));
  // }

  // Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Request Size Limits (default is 100kb in NestJS/Express, but we can be explicit if needed)
  // app.use(json({ limit: '100kb' })); // Already default

  // Enable CORS - production uses FRONTEND_URL env var, dev uses localhost
  const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176'
    ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

}
