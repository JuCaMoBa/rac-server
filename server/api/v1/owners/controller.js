const { hash } = require('bcryptjs');
const { Model } = require('./model');
const { signToken } = require('../auth');
const { mail } = require('../../../utils/email');
const uploadToCloudinary = require('../../../utils/uploadToCloudinary');

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
    const owner = await Model.findOne({
      email,
    }).exec();

    const statusCode = 200;

    if (!owner) {
      return next({
        message: `The email address ${email} is not associated with any account. please check and try again!`,
        statusCode: 401,
      });
    }

    const verified = await owner.verifyPassword(password);
    if (!verified) {
      return next({
        message: 'The email or password not valid',
        statusCode: 401,
      });
    }

    /*  if (!owner.isVerified) {
      return next({
        message: 'Your Email has not been verified. Please click on resend',
        statusCode: 401,
      });
    } */

    res.status(statusCode);

    const token = signToken({
      id: owner.id,
    });

    return res.json({
      data: owner,
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
  const { body: owner = {} } = req;
  const { password, confirmPassword } = owner;

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

    const { firstName, email } = owner;
    const status = 201;
    res.status(status);

    const token = signToken({
      data: owner,
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

  const owner = new Model(data);
  owner.isVerified = true;
  await owner.save();

  res.status(200);
  return res.json({
    data: owner,
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
  let photo = '';
  try {
    const message = 'confirm password do not match with password';
    const statusCode = 200;

    if (password && confirmPassword) {
      const verified = password === confirmPassword;
      if (!verified) {
        next({
          message,
          statusCode,
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
