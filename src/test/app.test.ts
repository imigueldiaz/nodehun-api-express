import { OrderedWord } from "./../app";
import supertest from "supertest";
import { ApiServer } from "../app";
import { assert } from "chai";

describe("GET /", function () {
  this.timeout("10000");

  after((done) => {
    ApiServer.close(done);
  });

  it("it should have status code 200.", async () => {
    return await supertest(ApiServer).get("/test").expect(200);
  });

  it("it should respond with JSON.", async () => {
    return await supertest(ApiServer)
      .get("/test")
      .expect("Content-Type", /json/);
  });

  it("it should be an array", async () => {
    return await supertest(ApiServer)
      .get("/test")
      .expect("Content-Type", /json/)
      .expect((res) => {
        assert.isArray(res.body);
      });
  });

  it("it should contain an OrderedWord whith the same id and word.", async () => {
    return await supertest(ApiServer)
      .get("/test")
      .expect("Content-Type", /json/)
      .expect((res) => {
        let list = res.body;

        assert.notStrictEqual(
          new OrderedWord(0, "test"),
          new OrderedWord(list[0].orderedWord.id, list[0].orderedWord.word)
        );
      });
  });
});
