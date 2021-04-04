import supertest from "supertest";
import { ApiServer } from "../app";

describe("GET /", function () {
  this.timeout("10000");

  after((done) => {
    ApiServer.close(done);
  });

  it("it should has status code 200", async () => {
    return await supertest(ApiServer).get("/hola").expect(200);
  });
});
