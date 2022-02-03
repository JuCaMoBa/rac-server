const { hash } = require('bcryptjs');
const { verify } = require('jsonwebtoken');
const { Model } = require('./model');
const { signToken } = require('../auth');
const { mail } = require('../../../utils/email');
const { localhost } = require('../../../config');
const {
  token: { secret },
} = require('../../../config');

exports.id = async (req, res, next) => {
  const { params = {} } = req;
  const { id = '' } = params;

  try {
    const data = await Model.findById(id);
    if (!data) {
      const message = `${Model.modelName} not found`;
      next({
        message,
        statusCode: 404,
        level: 'warn',
      });
    } else {
      req.doc = data;
      next();
    }
  } catch (error) {
    next(error);
  }
};

exports.signin = async (req, res, next) => {
  const { body = {} } = req;
  const { email, password } = body;

  try {
    const user = await Model.findOne({
      email,
    }).exec();

    const statusCode = 200;

    if (!user) {
      return next({
        message: `The email address ${email} is not associated with any account. please check and try again!`,
        statusCode: 401,
      });
    }

    const verified = await user.verifyPassword(password);
    if (!verified) {
      return next({
        message: 'The email or password not valid',
        statusCode: 401,
      });
    }

    if (!user.isVerified) {
      return next({
        message: 'Your Email has not been verified. Please click on resend',
        statusCode: 401,
      });
    }

    res.status(statusCode);

    const token = signToken({
      id: user.id,
    });

    return res.json({
      data: user,
      meta: {
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.initSignup = async (req, res, next) => {
  const { body: user = {} } = req;
  const { password, confirmPassword } = user;

  try {
    const message = 'confirm password do not match with password';
    const statusCode = 200;
    const verified = password === confirmPassword;
    if (!verified) {
      next({
        message,
        statusCode,
      });
    }
    const { firstName, email } = user;
    const status = 201;
    res.status(status);

    const token = signToken({
      data: user,
    });
    mail({
      email,
      subject: 'Welcome',
      template: 'server/utils/email/templates/confirmEmail.html',
      data: {
        firstName,
        url: `${localhost}/emailverified/${token}`,
      },
    });
    res.send();
  } catch (error) {
    next(error);
  }
};

exports.read = async (req, res, next) => {
  const { doc = {} } = req;

  res.json({
    data: doc,
  });
};

exports.signUp = async (req, res, next) => {
  const { body } = req;
  const { token } = body;

  const { data } = verify(token, secret, (err, decoded) => {
    if (err) {
      next({
        message: 'Unauthorized',
        statusCode: 401,
      });
    }
    return decoded;
  });
  const user = new Model(data);
  user.isVerified = true;
  await user.save();

  res.status(200).json({
    data: user,
    meta: {
      token,
    },
  });
};

exports.profile = async (req, res, next) => {
  const { decoded } = req;
  const { id } = decoded;

  try {
    const data = await Model.findById(id);

    res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  const { body = {}, decoded } = req;
  const { id } = decoded;
  let { password, confirmPassword } = body;
  try {
    const message = 'confirm password do not match with password';

    if (password && confirmPassword) {
      const verified = password === confirmPassword;
      if (!verified) {
        next({
          message,
          statusCode: 401,
        });
      }
      password = await hash(password, 10);
      confirmPassword = await hash(confirmPassword, 10);
    }

    const data = await Model.findOneAndUpdate(
      { _id: id },
      { ...body, password, confirmPassword },
      {
        new: true,
      },
    );

    res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
};
