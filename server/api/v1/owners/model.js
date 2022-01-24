const mongoose = require('mongoose');
const { hash, compare } = require('bcryptjs');
const { isEmail } = require('validator');
const { body } = require('express-validator');

const sanitizers = [
	body('firstname').escape(),
	body('lastname').escape(),
	body('email').escape(),
	body('password').escape(),
	body('terms').escape(),
];

const fields = {
	firstname: {
		type: String,
		required: true,
		trim: true,
		maxLength: 128,
		unique: true,
	},
	lastname: {
		type: String,
		required: true,
		trim: true,
		maxLength: 256,
	},
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
	terms: {
		type: Boolean,
		required: true,
		trim: true,
	},
};

const hiddenFields = ['password', 'confirmPassword'];

const owner = new mongoose.Schema(fields, {
	timestamps: true,
});

owner.methods.toJSON = function toJSON() {
	const document = this.toObject();
	hiddenFields.forEach((field) => {
		if (document[field] !== undefined) {
			delete document[field];
		}
	});
	return document;
};

owner.pre('save', async function save(next) {
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

owner.methods.verifyPassword = function verifyPassword(value) {
	return compare(value, this.password);
};

const model = mongoose.model('owner', owner);

module.exports = {
	Model: model,
	fields,
	sanitizers,
};
