const { sign, verify } = require('jsonwebtoken');

const {
  token: { expires, secret },
} = require('../../config');

exports.signToken = (payload, expiresIn = expires) =>
  sign(payload, secret, {
    expiresIn,
  });

exports.auth = (req, res, next) => {
  let token = req.headers.authorization || req.headers.query || '';
  if (token.startsWith('Bearer')) {
    token = token.substring(7);
  }

  const message = 'Unauthorized';
  const statusCode = 401;

  if (!token) {
    next({
      message,
      statusCode,
    });
  } else {
    verify(token, secret, (err, decoded) => {
      if (err) {
        next({
          message,
          statusCode,
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }
};

exports.owner = (req, res, next) => {
  const { decoded, doc } = req;

  const { id } = decoded;
  // console.log('ID: ', id);
  const {
    owner: { id: userId },
  } = doc;

  // console.log('User ID: ', userId);
  if (id !== userId) {
    const message = 'Forbidden';
    const statusCode = 403;

    next({
      message,
      statusCode,
    });
  } else {
    next();
  }
};
