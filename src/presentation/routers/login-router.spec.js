const LoginRouter = require("./login-router");
const MissingParamError = require("../helpers/missing-param");
const UnauthorizedError = require("../helpers/unauthorized-error");

const makeSut = () => {
    // isso é um mock pra auxiliar os testes no login router
    class AuthUseCase {
        auth(email, password) {
            this.email = email;
            this.password = password;
        }
    }

    const authUseCase = new AuthUseCase();
    const sut = new LoginRouter(authUseCase);
    return {
        sut,
        authUseCase,
    };
};

describe("Login Router", () => {
    test("Should return 400 if no email is provided", () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                password: "123",
            },
        };
        const httpResponse = sut.route(httpRequest);
        expect(httpResponse.status).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError("email"));
    });
    test("Should return 400 if no password is provided", () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                email: "email@com.br",
            },
        };
        const httpResponse = sut.route(httpRequest);
        expect(httpResponse.status).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError("password"));
    });
    test("Should return 500 if no httpRequest is provided", () => {
        const { sut } = makeSut();
        const httpResponse = sut.route();
        expect(httpResponse.status).toBe(500);
    });
    test("Should return 500 if no httpRequest has no body", () => {
        const { sut } = makeSut();
        const httpRequest = {};
        const httpResponse = sut.route(httpRequest);
        expect(httpResponse.status).toBe(500);
    });
    test("Should call AuthUseCase with correct params", () => {
        const { sut, authUseCase } = makeSut();
        const httpRequest = {
            body: {
                email: "email@email",
                password: "123",
            },
        };
        sut.route(httpRequest);
        expect(authUseCase.email).toBe(httpRequest.body.email);
    });
    test("Should return 401 when invalid credentials are provided", () => {
        const { sut, authUseCase } = makeSut();
        const httpRequest = {
            body: {
                email: "invalid@email",
                password: "invalid_password",
            },
        };
        const httpResponse = sut.route(httpRequest);
        expect(httpResponse.status).toBe(401);
        expect(httpResponse.body).toEqual(new UnauthorizedError());
    });
});
