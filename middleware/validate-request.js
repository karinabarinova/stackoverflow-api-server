module.exports = validateRequest;

function validateRequest(req, next, schema) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    // var file;
    // console.log(req.body)
    // if (req.file)
    //     file = req.file
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    } else {    
        req.body = value;
        // console.log(value)
        // if (file)
        //     req.body.file = file
        // // console.log("Validation")
        // // console.log(req.body)
        next();
    }
}