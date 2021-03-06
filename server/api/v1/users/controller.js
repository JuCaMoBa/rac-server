const { hash } = require('bcryptjs');
const { Model, virtuals } = require('./model');
const { signToken } = require('../auth');
const { mail } = require('../../../utils/email');
const uploadToCloudinary = require('../../../utils/uploadToCloudinary');
const { filterByNested } = require('../../../utils/utils');

const referencesNames = Object.getOwnPropertyNames(virtuals);

exports.id = async (req, res, next) => {
  const { params = {} } = req;
  const { id = '' } = params;
  const { populate } = filterByNested(params, referencesNames);
  console.log(populate);
  try {
    const data = await Model.findById(id).populate(populate);
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
    /*
    if (!user.isVerified) {
      return next({
        message: 'Your Email has not been verified. Please click on resend',
        statusCode: 401,
      });
    } */

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
exports.signup = async (req, res, next) => {
  const { body = {} } = req;
  const { password, confirmPassword } = body;

  const document = new Model(body);

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
    const data = await document.save();
    const status = 201;
    res.status(status);

    const token = signToken({
      id: data.id,
    });

    res.json({
      data,
      meta: {
        token,
      },
    });

    const { firstName, email } = data;
    mail({
      email,
      subject: 'Welcome',
      template: 'server/utils/email/templates/welcomeEmail.html',
      data: {
        firstName,
      },
    });
  } catch (error) {
    next(error);
  }
};
/* exports.initSignup = async (req, res, next) => {
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
}; */
exports.read = async (req, res, next) => {
  const { doc = {} } = req;

  res.json({
    data: doc,
  });
};

exports.profile = async (req, res, next) => {
  const { decoded } = req;
  const { id } = decoded;
  const { populate } = filterByNested({}, referencesNames);
  console.log(populate);
  try {
    const data = await Model.findById(id).populate(populate);

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
  let photo = '';

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
    if (req.files) {
      photo = await uploadToCloudinary({
        file: req.files.file,
        path: 'renta-car-profile',
        allowedExts: ['jpg', 'jpeg', 'png'],
      });
      const data = await Model.findOneAndUpdate(
        { _id: id },
        {
          ...body,
          password,
          confirmPassword,
          photo,
        },
        {
          new: true,
        },
      );

      res.json({
        data,
      });
    } else {
      const data = await Model.findOneAndUpdate(
        { _id: id },
        {
          ...body,
          password,
          confirmPassword,
        },
        {
          new: true,
        },
      );

      res.json({
        data,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.updatePhoto = async (req, res, next) => {
  const { decoded } = req;
  const { id } = decoded;
  let photo = '';
  if (req.files.file) {
    photo = await uploadToCloudinary({
      file: req.files.file,
      path: 'renta-car-profile',
      allowedExts: ['jpg', 'jpeg', 'png'],
    });
  }
  const data = await Model.findOneAndUpdate(
    { _id: id },
    {
      photo,
    },
    {
      new: true,
    },
  );
  res.json({
    data,
  });
};
