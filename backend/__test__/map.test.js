const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const fs = require('fs');
let server;
let database;
let cookies;
let mapId;
const auth = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  RESETPASSWORD: "/auth/resetpassword",
  LOGGEDIN: "/auth/loggedIn",
  SENDEMAIL: "/auth/sendemail",
};
const map = {
    GETMAPLIST:    "/api/getmaplist",
    GETALLMAPS:    "/api/getallmaps",
    UPLOADMAP:     "/api/uploadmap",
    GETMAP:        "/api/getmap",
    DELETEMAP:     "/api/deletemap",
    DELETEALLMAPS: "/api/deleteAllMaps"
}
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
const FILES = {
    file1: require("../__test__/data/file1.json")
}
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
    console.log(`Server running at port: ${process.env.PORT}`);
  });

  // Start mongodb
  database = mongoose
    .connect(process.env.TEST_DATABASE, { useNewUrlParser: true })
    .then((res) => {
      console.log("Mongo connected");
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

describe("Prepare the cookies", () => {
  test("Create valid user", (done) => {
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
  test("Login with valid credentials & store cookies", (done) => {
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
});

describe("map endpoint", () => {
    test("Get none map from user ", (done) => {
        const response = request(app)
          .get(map.GETMAPLIST)
          .send(VALID_USER)
          .set("Accept", "application/json")
          .set("Cookie",[cookies])
          .expect(STATUS.SUCCESS)
          .end(function (err, res) {
            expect(res.body.success).toBe(true);
            expect(res.body.mapList).toStrictEqual([]);

            if (err) return done(err);
            return done();
          });
      });
    test("Upload map from user", (done) => {
        // UPLOADMAP
        const features = FILES.file1
        const data = {
            type: features.type,
            features: features.features,
        }
        const response = request(app)
        .post(map.UPLOADMAP)
        .send(data)
        .set("Accept", "application/json")
        .set("Cookie",[cookies])
        .expect(STATUS.SUCCESS)
        .end(function (err, res) {
            expect(res.body.id).toBeDefined();
            mapId = res.body.id;
          if (err) return done(err);
          return done();
        });
    })

    test("Check if map is in database - source 1", (done) => {
        const response = request(app)
        .post(map.GETMAP)
        .send({id:mapId})
        .set("Accept", "application/json")
        .set("Cookie",[cookies])
        .expect(STATUS.SUCCESS)
        .end(function (err, res) {
          expect(res.body.success).toBe(true);
          expect(res.body.map).toBeDefined();
          if (err) return done(err);
          return done();
        });
    })
    
    test("Check if map is in database - source 2", (done) => {
        const response = request(app)
        .get(map.GETMAPLIST)
        .set("Accept", "application/json")
        .set("Cookie",[cookies])
        .expect(STATUS.SUCCESS)
        .end(function (err, res) {
          expect(res.body.success).toBe(true);
          expect(res.body.mapList).not.toStrictEqual([]);
          if (err) return done(err);
          return done();
        });
    })

    test("Delete valid map", (done) => {
        const data = {
            id: mapId
        }
        const response = request(app)
        .post(map.DELETEMAP)
        .send(data)
        .set("Accept", "application/json")
        .set("Cookie",[cookies])
        .expect(STATUS.SUCCESS)
        .end(function (err, res) {
          expect(res.body.success).toBe(true);
          if (err) return done(err);
          return done();
        });
    })
    test("Check if map exist after deleting - source 1", (done) => {
        const response = request(app)
        .post(map.GETMAP)
        .send({id:mapId})
        .set("Accept", "application/json")
        .set("Cookie",[cookies])
        .expect(STATUS.FAILED)
        .end(function (err, res) {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toStrictEqual("Error to get map");
          if (err) return done(err);
          return done();
        });
    })
    test("Check if map exist after deleting - source 2", (done) => {
        const response = request(app)
        .get(map.GETMAPLIST)
        .set("Accept", "application/json")
        .set("Cookie",[cookies])
        .expect(STATUS.SUCCESS)
        .end(function (err, res) {
            expect(res.body.success).toBe(true);
            expect(res.body.mapList).toStrictEqual([]);
            if (err) return done(err);
            return done();
        });
    })

})
describe("Upload multiple files", () => {
    let testLength = 5
    for (let i = 0; i < testLength; i++) {
        test(`Upload map #${i+1}`, (done) => {
            // UPLOADMAP
            const features = FILES.file1
            const data = {
                type: features.type,
                features: features.features,
            }
            const response = request(app)
            .post(map.UPLOADMAP)
            .send(data)
            .set("Accept", "application/json")
            .set("Cookie",[cookies])
            .expect(STATUS.SUCCESS)
            .end(function (err, res) {
                expect(res.body.id).toBeDefined();
                mapId = res.body.id;
              if (err) return done(err);
              return done();
            });
        })
    }
    test("Check if all the maps are in database - source 2", (done) => {
        const response = request(app)
        .get(map.GETMAPLIST)
        .set("Accept", "application/json")
        .set("Cookie",[cookies])
        .expect(STATUS.SUCCESS)
        .end(function (err, res) {
          expect(res.body.success).toBe(true);
          expect(res.body.mapList).not.toStrictEqual([]);
          expect(res.body.mapList.length).toStrictEqual(testLength);
          if (err) return done(err);
          return done();
        });
    })

    test("Delete all maps", (done) => {
        const data = {
            author: VALID_USER.username
        }
        const response = request(app)
        .post(map.DELETEALLMAPS)
        .send(data)
        .set("Accept", "application/json")
        .set("Cookie",[cookies])
        .expect(STATUS.SUCCESS)
        .end(function (err, res) {
            expect(res.body.author).toBe(VALID_USER.username);
          if (err) return done(err);
          return done();
        });  
    })
    test("Check if map exist after deleting - source 2", (done) => {
        const response = request(app)
        .get(map.GETMAPLIST)
        .set("Accept", "application/json")
        .set("Cookie",[cookies])
        .expect(STATUS.SUCCESS)
        .end(function (err, res) {
            expect(res.body.success).toBe(true);
            expect(res.body.mapList).toStrictEqual([]);
            if (err) return done(err);
            return done();
        });
    })
})
afterAll(async () => {
    console.log(cookies)
  await server.close();
  await mongoose.disconnect();
});
