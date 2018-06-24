const errorMiddleware = function(err, req, res, next) {
    // No routes handled the request and no system error, that means 404 issue.
    // Forward to next middleware to handle it.
    if (!err) return next();

    console.log('errorMiddleware logged: ', err.message);

    // render the error page
    res.status(err.status || 500).send({error: true});
};

module.exports = errorMiddleware;
