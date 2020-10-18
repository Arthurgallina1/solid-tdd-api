const MissingParamError = require("./missing-param");

module.exports = class HttpResponse {
    static badRequest(paramName) {
        return {
            status: 400,
            body: new MissingParamError(paramName),
        };
    }
    static serverError() {
        return {
            status: 500,
        };
    }
};
