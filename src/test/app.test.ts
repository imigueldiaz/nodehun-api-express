import { OrderedWord } from "./../lib/business";
import supertest from "supertest";
import { ApiServer } from "../app";
import { assert, expect } from "chai";

const testData = "Esta es una frase para las pruebas";

describe("POST /analyze", function () {
  after((done) => {
    ApiServer.close(done);
  });

  it("it should have status code 200.", async () => {
    return await await supertest(ApiServer)
      .post("/analyze")
      .set("Content-type", "text/plain")
      .send(testData)
      .expect(200);
  });

  it("it should respond with JSON.", async () => {
    return await supertest(ApiServer)
      .post("/analyze")
      .set("Content-type", "text/plain")
      .send(testData)
      .expect("Content-Type", /json/);
  });

  it("it should be an array", async () => {
    return await supertest(ApiServer)
      .post("/analyze")
      .set("Content-type", "text/plain")
      .send(testData)
      .expect((res) => {
        assert.isArray(res.body);
      });
  });

  it("it should contain an OrderedWord whith the same id and word.", async () => {
    return await supertest(ApiServer)
      .post("/analyze")
      .set("Content-type", "text/plain")
      .send(testData)
      .expect((res) => {
        let list = res.body;

        expect(new OrderedWord(0, "Esta")).to.be.deep.equal(
          <OrderedWord>list[0].orderedWord
        );
      });
  });
  it("Response should be empty with status 204 (No content).", async () => {
    return await supertest(ApiServer).post("/analyze").expect(204);
  });
});
