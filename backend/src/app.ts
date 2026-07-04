import express from 'express';
import bodyParser from 'body-parser';
import router from './routes';
import cors from 'cors';
import morgan from 'morgan';
import { errorJsonHandler } from './middlewares/error.middleware';

/*
    STRUCTURE
    │   app.js          # App entry point
    └───routes          # Our routes controllers for all the endpoints of the app
    └───config          # Environment variables and configuration related stuff
    └───controllers     # Functions for our APIs
    └───models          # Database models
    └───middlewares     # Contains all the middleware that we need
    └───utils           # Common functions that would be used repetitively
*/

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        // Automatically set CORS origin header based on client request for faster development
        // TODO: check domain CORS in production environment
        return callback(null, true);
    },
}));

// Use body-parser middleware to parse request bodies before any other middleware
app.use(bodyParser.json({ limit: '1mb' }));

// Use morgan middleware to log requests
//app.use(morgan(':method :url :status :res[content-length]'));

// Middleware to log the request path and body
app.use((req, res, next) => {
    console.log('Request Path:', req.path);
    console.log('Request Body:', req.body);
    next();
});

app.use(router);

// JSON error handler (must be last) — returns friendly messages instead of HTML.
app.use(errorJsonHandler);

export default app;
