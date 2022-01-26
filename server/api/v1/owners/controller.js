const { Model, fields } = require('./model');
const { signToken, signEmailToken } = require('../auth');
const { mail } = require('../../../utils/email');
const { hash } = require('bcryptjs');
const { localhost } = require('../../../config');
const { verify } = require('jsonwebtoken');
const {
	token: { emailSecret: secret },
} = require('../../../config');

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

		if (!owner.isVerified) {
			return next({
				message:
					'Your Email has not been verified. Please click on resend',
				statusCode: 401,
			});
		}

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
			return next({
				message,
				statusCode,
			});
		}
		const data = await document.save();
		const { firstname, email } = data;
		const status = 201;
		res.status(status);

		const token = signToken({
			id: data.id,
		});

		const emailToken = signEmailToken({
			id: data.id,
			email,
		});

		res.json({
			data,
			meta: {
				token,
			},
		});

		mail({
			email,
			subject: 'Welcome',
			template: 'server/utils/email/templates/confirmEmail.html',
			data: {
				firstname,
				url: `${localhost}/owners/confirmation/${email}/${emailToken}`,
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.emailVerification = async (req, res, next) => {
	const { params } = req;
	const { email, token } = params;
	const statusCode = 401;

	try {
		const tokenValue = verify(token, secret, (err, decoded) => {
			if (err) {
				return next({
					message:
						'Your verification link may have expired. Please click on resend for verify your Email.',
					statusCode,
				});
			}
			return decoded;
		});

		if (!(email === tokenValue.email)) {
			return next({
				message: 'Unauthorized',
				statusCode,
			});
		}
		const owner = await Model.findById(tokenValue.id).exec();

		if (!owner) {
			return next({
				message:
					'We were unable to find a user for this verification. Please SignUp!',
				statusCode,
			});
		}
		res.status(200);

		owner.isVerified = true;
		await user.save();

		res.json({
			data: user,
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

		res.json({
			data,
		});
	} catch (error) {
		next(error);
	}
};
