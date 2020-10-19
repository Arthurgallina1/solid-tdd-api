const MissingParamError = require("./missing-param");
const UnauthorizedError = require("./unauthorized-error");

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
    static unauthorizedError() {
        return {
            status: 401,
            body: new UnauthorizedError(),
        };
    }
};
