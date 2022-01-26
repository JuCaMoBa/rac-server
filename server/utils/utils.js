exports.filterByNested = (params, referencesNames) => {
	const paramsName = Object.getOwnPropertyNames(params);
	const populateNames = referencesNames.filter(
		(item) => !paramsName.includes(item)
	);

	return {
		filters: params,
		populate: populateNames.join(' '),
	};
};
