// Global Error Handling Middleware
exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log error stack for debugging

    // Handle Mongoose/Sequelize Validation Errors (if applicable)
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        const messages = err.errors.map(val => val.message);
        return res.status(400).json({
            success: false,
            message: messages.join('. ')
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
};
