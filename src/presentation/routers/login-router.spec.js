class LoginRouter {
    route(httpRequest) {
        if (!httpRequest.body.email) {
            return {
                status: 400,
            };
        }
    }
}

describe("Login Router", () => {
    test("Should return 400 if no email is provided", () => {
        const sut = new LoginRouter();
        const httpRequest = {
            body: {
                password: "123",
            },
        };
        const httpResponse = sut.route(httpRequest);
        expect(httpResponse.status).toBe(400);
    });
});
