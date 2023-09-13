const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

let server;
let database;
let cookies;

const auth = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  RESETPASSWORD: "/auth/resetpassword",
  LOGGEDIN: "/auth/loggedIn",
  SENDEMAIL: "/auth/sendemail",
};
const VALID_USER = {
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};
const INVALID_USER = {
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};
const STATUS = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FAILED: 400,
  SERVER_ERROR: 500,
};
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

beforeAll((done) => {
  // Start express server
  server = app.listen(process.env.PORT, () => {
    // console.log(`Server running at port: ${process.env.PORT}`);
  });

  // Start mongodb
  database = mongoose
    .connect(process.env.TEST_DATABASE, { useNewUrlParser: true })
    .then((res) => {
      // console.log("Mongo connected");
    })
    .catch((err) => {
      console.log(err);
    });

  // Clear the database
  clearDatabase();
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

describe("Register Account", () => {
  test("Attempt to register account with missing input field", (done) => {
    const response = request(app)
      .post(auth.REGISTER)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(STATUS.FAILED)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
  test("Register account with valid inputs", (done) => {
    const response = request(app)
      .post(auth.REGISTER)
      .send(VALID_USER)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(STATUS.SUCCESS)
      .end(function (err, res) {
        if (err) return done(err);
        return done();
      });
  });

  test("Attempts to register account with email already registered", (done) => {
    const response = request(app)
      .post(auth.REGISTER)
      .send(VALID_USER)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(STATUS.FAILED)
      .end(function (err, res) {
        if (err) return done(err);
        return done();
      });
  });
});

describe("Login Account", () => {
  test("Attempt to login with missing input fields", (done) => {
    const response = request(app)
      .post(auth.LOGIN)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(STATUS.FAILED)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
  test("Attempt to login with invalid credentials", (done) => {
    const response = request(app)
      .post(auth.LOGIN)
      .send(INVALID_USER)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(STATUS.UNAUTHORIZED)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  test("Login with valid credentials", (done) => {
    request(app)
      .post(auth.LOGIN)
      .send(VALID_USER)
      .set("Accept", "application/json")
      .expect(STATUS.SUCCESS)
      .then((response) => {
        // Checks if the cookies are being sent
        cookies = response.headers["set-cookie"];
        expect(cookies).toBeDefined();
        done();
      });
  });

  test("Logout", (done) => {
    request(app)
      .get(auth.LOGOUT)
      .set("Accept", "application/json")
      .then((response) => {
        // Checks if the cookies are being sent
        cookies = response.headers["set-cookie"];
        let expectedCookies = [
          "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None",
        ];
        expect(cookies).toEqual(expectedCookies);
      });
    done();
  });
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
});
