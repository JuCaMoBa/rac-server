const { filterByNested } = require('../../../utils/utils');
const { Model: model, fields, references } = require('./model');
const { Model: Owner } = require('../owners/model');
const referencesNames = [...Object.getOwnPropertyNames(references)];

exports.parentId = async (req, res, next) => {
	const { params = {} } = req;
	const { owners = '' } = params;

	if (owners) {
		const data = await Owner.findById(owners).exec();

		if (data) {
			next();
		} else {
			const message = 'User not found';
			next({
				message,
				statusCode: 404,
				level: 'warn',
			});
		}
	} else {
		next();
	}
};

exports.id = async (req, res, next) => {
	const { params = {} } = req;
	const { id = '' } = params;
	const { populate } = filterByNested(params, referencesNames);

	try {
		const data = await model.findById(id).populate(populate);

		if (!data) {
			const message = `${model.modelName} not found`;
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

exports.all = async (req, res, next) => {
	const { params } = req;
	const { filters, populate } = filterByNested(params, referencesNames);

	const docs = model.find(filters).populate(populate);
	const all = model.countDocuments(filters);

	try {
		const response = await Promise.all([docs.exec(), all.exec()]);
		const [data] = response;
		console.log(data);
		res.json({
			data,
		});
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

exports.create = async (req, res, next) => {
	const { body = {}, decoded } = req;
	const { id } = decoded;
	const owner = await Owner.findById(id).exec();
	if (!owner) {
		next({
			message: 'Only owners can create cars',
			statusCode: 401,
		});
	}
	const document = new model({
		...body,
		owner: id,
	});

	try {
		const data = await document.save();
		const status = 201;
		res.status(status);
		res.json({
			data,
		});
	} catch (error) {
		next(error);
	}
};

exports.update = async (req, res, next) => {
	const { doc = {}, body = {} } = req;

	Object.assign(doc, body);
	try {
		const data = await doc.save();
		res.json({
			data,
		});
	} catch (error) {
		next(error);
	}
};

exports.delete = async (req, res, next) => {
	const { doc = {} } = req;
	try {
		const data = await doc.remove();
		res.json({
			data,
		});
	} catch (error) {
		next(error);
	}
};
