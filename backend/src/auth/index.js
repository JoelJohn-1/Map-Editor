const jwt = require("jsonwebtoken");
// hide this secret later
const jwt_secret= "8530a59544906ae133822367b7b5da4e"
function authManager() {
  verify = function (req, res, next) {
    try {
      const token = req.cookies.token;
      if (!token) {
        console.log("token", token); // debug
        return res.status(401).json({
          loggedIn: false,
          user: null,
          errorMessage: "Unauthorized",
        });
      }

      const verified = jwt.verify(token, jwt_secret);
      req.username = verified.username;
      req.email = verified.email
      req.userId = verified.userId;

      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({
        errorMessage: "Unauthorized",
      });
    }
  };

  verifyUser = (req) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return null;
        }

        const decodedToken = jwt.verify(token, jwt_secret);
        return decodedToken.userId;
    } catch (err) {
        return null;
    }
  }
  
  signToken = function (user) {

    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username
      },
      jwt_secret
    );
  };

  return this;
}

const auth = authManager();
module.exports = auth;