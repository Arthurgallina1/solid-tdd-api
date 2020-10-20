const { MissingParamError, InvalidParamError } = require("../../utils/errors");
const AuthUseCase = require("./auth-usecase");

//factories dividindo resposanbilidade
const makeEncrypter = () => {
    class EncrypterSpy {
        async compare(password, hashedPassword) {
            this.password = password;
            this.hashedPassword = hashedPassword;
            return this.isValid;
        }
    }

    const encrypterSpy = new EncrypterSpy();
    encrypterSpy.isValid = true;
    return encrypterSpy;
};

const makeTokenGenerator = () => {
    class TokenGeneratorSpy {
        async generate(userId) {
            this.userId = userId;
            return this.accessToken;
        }
    }

    const tokenGenrator = new TokenGeneratorSpy();
    tokenGenrator.accessToken = "any_token";
    return tokenGenrator;
};

const makeLoadUserByEmailRepoSpy = () => {
    class LoadUserByEmailRepositorySpy {
        async load(email) {
            this.email = email;
            return this.user;
        }
    }
    const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy();
    loadUserByEmailRepositorySpy.user = {
        id: "any_id",
        password: "hashed_password",
    };
    return loadUserByEmailRepositorySpy;
};

const makeSut = () => {
    const encrypterSpy = makeEncrypter();
    const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepoSpy();
    const tokenGenerator = makeTokenGenerator();

    const sut = new AuthUseCase(
        loadUserByEmailRepositorySpy,
        encrypterSpy,
        tokenGenerator
    );
    return { sut, loadUserByEmailRepositorySpy, encrypterSpy, tokenGenerator };
};

describe("Auth useCase", () => {
    test("Should throw if no email is provided", async () => {
        const { sut } = makeSut();
        const promise = sut.auth();
        expect(promise).rejects.toThrow(new MissingParamError("email"));
    });

    test("Should throw if no password is provided", async () => {
        const { sut } = makeSut();
        const promise = sut.auth("any_email@email.com");
        expect(promise).rejects.toThrow(new MissingParamError("password"));
    });

    test("Should call LoadUserByEmailRepository with correct email", async () => {
        const { sut, loadUserByEmailRepositorySpy } = makeSut();
        await sut.auth("any_email@email.com", "any_password");
        expect(loadUserByEmailRepositorySpy.email).toBe("any_email@email.com");
    });

    test("Should throw if no LoadUserByEmailRepository is provided", async () => {
        const sut = new AuthUseCase();
        const promise = sut.auth("any_email@email.com", "any_password");
        expect(promise).rejects.toThrow();
    });

    test("Should throw if no LoadUserByEmailRepository has no load method", async () => {
        const sut = new AuthUseCase({}); //instancia vazia sem método load
        const promise = sut.auth("any_email@email.com", "any_password");
        expect(promise).rejects.toThrow();
    });

    // test("Should return null if LoadUserByEmailRepository returns null", async () => {
    //     const { sut } = makeSut();
    //     const accessToken = await sut.auth(
    //         "invalid_email@email.com",
    //         "any_password"
    //     );
    //     expect(accessToken).toBeNull();
    // });

    test("Should return null if invalid email is provided", async () => {
        const { sut, loadUserByEmailRepositorySpy } = makeSut();
        loadUserByEmailRepositorySpy.user = null;
        const accessToken = await sut.auth(
            "invalid_email@email.com",
            "any_password"
        );
        expect(accessToken).toBeNull();
    });

    test("Should return null if invalid password is provided", async () => {
        const { sut, encrypterSpy } = makeSut();
        encrypterSpy.isValid = false;
        const accessToken = await sut.auth(
            "any_email@email.com",
            "invalid_password"
        );
        expect(accessToken).toBeNull();
    });

    test("Should call Encrypter with correct values", async () => {
        const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut();
        await sut.auth("any_email@email.com", "invalid_password");
        expect(encrypterSpy.password).toBe("invalid_password");
        expect(encrypterSpy.hashedPassword).toBe(
            loadUserByEmailRepositorySpy.user.password
        );
    });

    test("Should call TokenGenerator with correct userId", async () => {
        const { sut, loadUserByEmailRepositorySpy, tokenGenerator } = makeSut();
        await sut.auth("any_email@email.com", "invalid_password");
        expect(tokenGenerator.userId).toBe(
            loadUserByEmailRepositorySpy.user.id
        );
    });

    test("Should return an accessToken if correct credentials are provided", async () => {
        const { sut, tokenGenerator } = makeSut();
        const accessToken = await sut.auth(
            "any_email@email.com",
            "invalid_password"
        );
        expect(accessToken).toBe(tokenGenerator.accessToken);
        expect(accessToken).toBeTruthy();
    });
});
