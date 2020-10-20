const EmailValidator = require("./email-validator");
const validator = require("validator");

const makeSut = () => {
    return new EmailValidator();
};

describe("Email validator", () => {
    test("Should return true if validator returns true", () => {
        const sut = makeSut();
        const isEmailValid = sut.isValid("valid_email@com.br");
        expect(isEmailValid).toBe(true);
    });
    test("Should return false if validator returns false", () => {
        validator.isEmailValid = false;
        const sut = makeSut();
        const isEmailValid = sut.isValid("invalid_email@com.br");
        expect(isEmailValid).toBe(false);
    });
    test("Should call validator with correct email", () => {
        const sut = makeSut();
        sut.isValid("invalid_email@com.br");
        expect(validator.email).toBe("invalid_email@com.br");
    });
});
