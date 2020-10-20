const MissingParamError = require("../errors/missing-param");
const UnauthorizedError = require("../errors/unauthorized-error");
const ServerError = require("../errors/server-error");

module.exports = class HttpResponse {
    static badRequest(error) {
        return {
            status: 400,
            body: error,
        };
    }
    static serverError() {
        return {
            status: 500,
            body: new ServerError(),
        };
    }
    static unauthorizedError() {
        return {
            status: 401,
            body: new UnauthorizedError(),
        };
    }
    static ok(data) {
        return {
            status: 200,
            body: data,
        };
    }
};
