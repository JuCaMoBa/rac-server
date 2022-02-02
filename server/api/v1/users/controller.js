const { hash } = require('bcryptjs');
const { verify } = require('jsonwebtoken');
const { Model } = require('./model');
const { signToken, signEmailToken } = require('../auth');
const { mail } = require('../../../utils/email');
const { localhost } = require('../../../config');
const {
  token: { emailSecret, secret },
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
      email: user.email,
    });

    const emailToken = signEmailToken({
      data: user,
      token,
    });
    mail({
      email,
      subject: 'Welcome',
      template: 'server/utils/email/templates/confirmEmail.html',
      data: {
        firstName,
        url: `${localhost}/users/confirmation/${email}/${emailToken}`,
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

exports.emailConfirmation = async (req, res, next) => {
  const { params } = req;
  const { email, token } = params;
  const statusCode = 401;

  try {
    const tokenValue = verify(token, emailSecret, (err, decoded) => {
      if (err) {
        next({
          message:
            'Your verification link may have expired. Please click on resend for verify your Email.',
          statusCode,
        });
      }
      return decoded;
    });
    const { data, token: tokenUser } = tokenValue;
    if (!(email === data.email)) {
      next({
        message: 'Unauthorized',
        statusCode,
      });
    }
    const document = new Model(data);
    document.isVerified = true;
    await document.save();
    res.redirect(`http://localhost:3000/emailverified/${tokenUser}`);
  } catch (error) {
    next(error);
  }
};
// exports.resendEmail = async (req, res, next) => {};
exports.signUp = async (req, res, next) => {
  const { body } = req;
  const { token } = body;

  const data = verify(token, secret, (err, decoded) => {
    if (err) {
      next({
        message: 'Unauthorized',
        statusCode: 401,
      });
    }
    return decoded;
  });

  const user = await Model.findOne({ email: data.email }).exec();

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
