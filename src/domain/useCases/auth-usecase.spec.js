class AuthUseCase {
    async auth(email) {
        if (!email) {
            return null;
        }
    }
}

describe("Auth useCase", () => {
    test("should return null if no email is provided", async () => {
        const sut = new AuthUseCase();
        const acessToken = await sut.auth();
        expect(acessToken).toBeNull();
    });
});
