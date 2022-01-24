const { Model } = require('./model');
const { signToken } = require('../auth');
const { mail } = require('../../../utils/email');
const { hash } = require('bcryptjs');

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
	const { password, confirmPassword } = body;
	const document = new Model(body);

	try {
		const message = 'confirm password do not match with password';
		const statusCode = 200;
		const verified = password === confirmPassword;
		if (!verified) {
			return next({
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
		const { firstname, email } = data;
		mail({
			email,
			subject: 'Welcome',
			template: 'server/utils/email/templates/confirmEmail.html',
			data: {
				firstname,
			},
		});
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
	let { password, confirmPassword } = body;
	try {
		const message = 'confirm password do not match with password';
		const statusCode = 200;

		if (password && confirmPassword) {
			const verified = password === confirmPassword;
			if (!verified) {
				return next({
					message,
					statusCode,
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
			}
		);
		/* 		
		console.log(data); */
		res.json({
			data,
		});
	} catch (error) {
		next(error);
	}
};
