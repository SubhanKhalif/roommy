import AppError from './AppError.js';

const handleTypeError = (err, req) => {
    const message = `Can't find ${req.url} in this server`;
    return new AppError(message, 404);
};

const handleDuplicateError = (err) => {
    const message = `The email is in use please use different email`;
    return new AppError(message, 400);
};

const handleValidationError = (err) => {
    const message = `Invalid Input data. Please Validate data`;
    return new AppError(message, 400);
};

export default (err, req, res, next) => {
    let error;
    
    if (err.message === 'TypeError') {
        error = handleTypeError(err, req);
    }
    if (err.code === 11000) {
        error = handleDuplicateError(err);
    }
    if (err._message === 'users validation failed') {
        error = handleValidationError(err);
    }

    if (!error) {
        res.status(400).json({
            status: 'fail',
            message: 'Something went wrong'
        });
    } else {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    }
};