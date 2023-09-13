const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
let server;
let database;
beforeAll((done) => {
  // Start express server
  server = app.listen(process.env.PORT, () => {
    // console.log(`Server running at port: ${process.env.PORT}`);
  });

  // Start mongodb
  database = mongoose
    .connect(process.env.DATABASE, { useNewUrlParser: true })
    .then((res) => {
      // console.log("Mongo connected");
    })
    .catch((err) => {
      console.log(err);
    });
  done();
});
describe("Environment Variables", () => {
  it("Should have Port Number defined", () => {
    expect(process.env.PORT).toBeDefined();
  });
  it("Should have Database URI defined", () => {
    expect(process.env.TEST_DATABASE).toBeDefined();
  });
});
afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
});
