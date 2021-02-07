import request from "request";
const streams = new Map();
const Twit = require("twit");

const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET_KEY;

const setupStream = (parsedBody, screenName, io) => {
  const T = new Twit({
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token: parsedBody.oauth_token,
    access_token_secret: parsedBody.oauth_token_secret,
    timeout_ms: 60 * 1000,
    strictSSL: true,
  });

  const stream = T.stream("statuses/filter", { track: [`@${screenName}`] });

  stream.on("tweet", function (tweet) {
    console.log(tweet);
    io.to(screenName).emit("tweet", tweet);
  });
  return stream;
};

export const requestAuthToken = async (req, res, next) => {
  try {
    request.post(
      {
        url: "https://api.twitter.com/oauth/request_token",
        oauth: {
          oauth_callback: "http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback",
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
        },
      },
      (err, r, body) => {
        if (err) {
          throw new ErrorHandler(500, err.message);
        }
        const jsonStr =
          '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
        res.send(JSON.parse(jsonStr));
      }
    );
  } catch (error) {
    next(error);
  }
};

export const tokenVerifier = async (req, res, next) => {
  try {
    request.post(
      {
        url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
        oauth: {
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
          token: req.query.oauth_token,
        },
        form: { oauth_verifier: req.query.oauth_verifier },
      },
      (err, r, body) => {
        if (err) {
          console.log(err);
          throw new ErrorHandler(500, err.message);
        }

        const bodyString =
          '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
        const parsedBody = JSON.parse(bodyString);

        req.body["oauth_token"] = parsedBody.oauth_token;
        req.body["oauth_token_secret"] = parsedBody.oauth_token_secret;
        req.body["user_id"] = parsedBody.user_id;
        const screenName = parsedBody.screen_name;
        if (!streams.has(screenName)) {
          const stream = setupStream(parsedBody, screenName, res.io);
          streams.set(screenName, stream);
        }
        res.json(parsedBody);
      }
    );
  } catch (error) {
    next(error);
  }
};

export const replyTweet = async (req, res, next) => {
  try {
    const oauth_token = req.body["oauth_token"];
    const oauth_token_secret = req.body["oauth_token_secret"];
    const screen_name = req.body["screen_name"];
    const tweet = req.body["tweet"];
    const T = new Twit({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token: oauth_token,
      access_token_secret: oauth_token_secret,
      timeout_ms: 60 * 1000,
      strictSSL: true,
    });
    T.post("statuses/update", tweet, function (err, data, response) {
      if (err) {
        console.log(err);
        throw new ErrorHandler(500, err.message);
      }
      console.log(data);
      res.io.to(screen_name).emit("tweet", data);
      res.sendStatus(200);
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentMentions = async (req, res, next) => {
  try {
    const oauth_token = req.body["oauth_token"];
    const oauth_token_secret = req.body["oauth_token_secret"];
    const T = new Twit({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token: oauth_token,
      access_token_secret: oauth_token_secret,
      timeout_ms: 60 * 1000,
      strictSSL: true,
    });
    T.get("statuses/mentions_timeline", function (err, data, response) {
      if (err) {
        console.log(err);
        throw new ErrorHandler(500, err.message);
      }
      console.log(data);
      res.json(data);
    });
  } catch (error) {
    next(error);
  }
};
