const mongoose = require('mongoose');
const { hash, compare } = require('bcryptjs');
const { isEmail } = require('validator');
const { body } = require('express-validator');

const sanitizers = [
	body('firstName').escape(),
	body('lastName').escape(),
	body('email').escape(),
	body('password').escape(),
	body('confirmPassword').escape(),
	body('terms').escape(),
];

const fields = {
	email: {
		type: String,
		required: true,
		trim: true,
		maxLength: 256,
		unique: true,
		validate: {
			validator(value) {
				return isEmail(value);
			},
			message: (props) => `${props.value} is not a valid email!`,
		},
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minLength: 6,
		maxLength: 256,
	},
	confirmPassword: {
		type: String,
		required: true,
		trim: true,
		minLength: 6,
		maxLength: 256,
	},
	firstName: {
		type: String,
		required: true,
		trim: true,
		maxLength: 128,
	},
	lastName: {
		type: String,
		required: true,
		trim: true,
		maxLength: 256,
	},
	terms: {
		type: Boolean,
		required: true,
		trim: true,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
};

const hiddenFields = ['password', 'confirmPassword'];

const user = new mongoose.Schema(fields, {
	timestamps: true,
});

user.methods.toJSON = function toJSON() {
	const document = this.toObject();
	hiddenFields.forEach((field) => {
		if (document[field] !== undefined) {
			delete document[field];
		}
	});
	return document;
};

user.pre('save', async function save(next) {
	/* if (this.isModified('password')) {
		this.password = await hash(this.password, 10);
	}
	if (this.isModified('confirmPassword')) {
		this.confirmPassword = await hash(this.confirmPassword, 10);
	} */

	try {
		if (
			!this.isModified('password') &&
			!this.isModified('confirmPassword')
		) {
			next();
		}
		this.password = await hash(this.password, 10);
		this.confirmPassword = await hash(this.confirmPassword, 10);
		next();
	} catch (err) {
		next({
			message: err,
			statusCode: 403,
		});
	}
});

user.methods.verifyPassword = function verifyPassword(value) {
	return compare(value, this.password);
};

const model = mongoose.model('user', user);

module.exports = {
	Model: model,
	fields,
	sanitizers,
};
