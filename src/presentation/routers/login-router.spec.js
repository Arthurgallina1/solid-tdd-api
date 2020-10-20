const LoginRouter = require("./login-router");
const { ServerError, UnauthorizedError } = require("../errors");
const { MissingParamError, InvalidParamError } = require("../../utils/errors");

const makeSut = () => {
    // isso é um mock pra auxiliar os testes no login router (um spy)
    const authUseCase = makeAuthUseCase();
    const emailValidatorSpy = makeEmailValidator();
    authUseCase.accessToken = "valid_token";
    const sut = new LoginRouter(authUseCase, emailValidatorSpy);
    return {
        sut,
        authUseCase,
        emailValidatorSpy,
    };
};

const makeEmailValidator = () => {
    class EmailValidatorSpy {
        isValid(email) {
            return this.isEmailValid;
        }
    }
    const emailValidatorSpy = new EmailValidatorSpy();
    emailValidatorSpy.isEmailValid = true;
    return emailValidatorSpy;
};

const makeAuthUseCase = () => {
    class AuthUseCase {
        async auth(email, password) {
            this.email = email;
            this.password = password;
            return this.accessToken;
        }
    }
    return new AuthUseCase();
};

const makeAuthUseCaseWithError = () => {
    class AuthUseCaseSpy {
        async auth() {
            throw new Error();
        }
    }

    return new AuthUseCaseSpy();
};

describe("Login Router", () => {
    test("Should return 400 if no email is provided", async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                password: "123",
            },
        };
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError("email"));
    });

    test("Should return 400 if no password is provided", async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                email: "email@com.br",
            },
        };
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError("password"));
    });

    test("Should return 500 if no httpRequest is provided", async () => {
        const { sut } = makeSut();
        const httpResponse = await sut.route();
        expect(httpResponse.status).toBe(500);
    });

    test("Should return 500 if no httpRequest has no body", async () => {
        const { sut } = makeSut();
        const httpRequest = {};
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(500);
    });

    test("Should call AuthUseCase with correct params", async () => {
        const { sut, authUseCase } = makeSut();
        const httpRequest = {
            body: {
                email: "email@email",
                password: "123",
            },
        };
        await sut.route(httpRequest);
        expect(authUseCase.email).toBe(httpRequest.body.email);
    });

    test("Should return 401 when invalid credentials are provided", async () => {
        const { sut, authUseCase } = makeSut();
        authUseCase.accessToken = null;
        const httpRequest = {
            body: {
                email: "invalid@email",
                password: "invalid_password",
            },
        };
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(401);
        expect(httpResponse.body).toEqual(new UnauthorizedError());
    });

    test("Should return 200 when valid credentials are provided", async () => {
        const { sut, authUseCase } = makeSut();

        const httpRequest = {
            body: {
                email: "valid@email",
                password: "valid_password",
            },
        };
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(200);
        expect(httpResponse.body.accessToken).toEqual(authUseCase.accessToken);
    });

    test("Should return 500 if no AuthUseCase is provided", async () => {
        const sut = new LoginRouter();
        const httpRequest = {
            body: {
                email: "any_email@email",
                password: "any_password",
            },
        };
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(500);
    });

    test("Should return 500 if no AuthUseCase has no auth method", async () => {
        class AuthUseCaseSpy {}
        const sut = new LoginRouter(new AuthUseCaseSpy());
        const httpRequest = {
            body: {
                email: "any_email@email",
                password: "any_password",
            },
        };
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(500);
    });

    test("Should return 500 if AuthUseCase throws", async () => {
        const authUseCaseWithErrorSpy = makeAuthUseCaseWithError();
        const sut = new LoginRouter(authUseCaseWithErrorSpy);
        const httpRequest = {
            body: {
                email: "any_email@email",
                password: "any_password",
            },
        };
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(500);
    });

    test("Should return 400 if an invalid email is provided", async () => {
        const { sut, emailValidatorSpy } = makeSut();
        emailValidatorSpy.isEmailValid = false;
        const httpRequest = {
            body: {
                email: "invalid_email@com.br",
                password: "any_pw",
            },
        };
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(400);
        expect(httpResponse.body).toEqual(new InvalidParamError("email"));
    });

    test("Should return 500 if no EmailValidator is provided", async () => {
        const authUseCaseSpy = makeAuthUseCase();
        const sut = new LoginRouter(authUseCaseSpy);

        const httpRequest = {
            body: {
                email: "invalid_email@com.br",
                password: "any_pw",
            },
        };
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(500);
        expect(httpResponse.body).toEqual(new ServerError());
    });

    test("Should return 500 if no EmailValidator has no isValid method", async () => {
        const authUseCaseSpy = makeAuthUseCase();
        const sut = new LoginRouter(authUseCaseSpy, {});

        const httpRequest = {
            body: {
                email: "invalid_email@com.br",
                password: "any_pw",
            },
        };
        const httpResponse = await sut.route(httpRequest);
        expect(httpResponse.status).toBe(500);
        expect(httpResponse.body).toEqual(new ServerError());
    });
});
