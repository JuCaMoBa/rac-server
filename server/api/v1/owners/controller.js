const { Model, fields } = require('./model');
const { signToken } = require('../auth');
const { mail } = require('../../../utils/email.js');

exports.signin = async (req, res, next) => {
  // Recibir informacion
  const { body = {} } = req;
  const { email, password } = body;

  try {
    // Buscar el usuario (documento) por el username
    const user = await Model.findOne({
      email,
    }).exec();
    // SI NO = res no existe 200
    const message = 'email or password invalid';
    const statusCode = 200;

    if (!user) {
      return next({
        message,
        statusCode,
      });
    }

    // SI = Veriticar Password
    const verified = await user.verifyPassword(password);
    if (!verified) {
      // SI NO = res no existe 200
      return next({
        message,
        statusCode,
      });
    }
    const token = signToken({
      id: user.id,
    });
    // SI = Devolver la informacion del usuario
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
  const document = new Model(body);

  try {
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
    mail(data);
  } catch (error) {
    next(error);
  }
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

  try {
    const data = await Model.findOneAndUpdate({ _id: id }, body, {
      new: true,
    });
    res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
};
