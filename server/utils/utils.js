exports.filterByNested = (params, referencesNames) => {
  const paramsName = Object.getOwnPropertyNames(params);
  const populateNames = referencesNames.filter(
    (item) => !paramsName.includes(item),
  );

  return {
    filters: params,
    populate: populateNames.join(' '),
  };
};

exports.filterCarsByPrice = (data, price) =>
  data.filter((cars) => cars.price >= price);
exports.filterCarsByType = (data, type) =>
  data.filter((cars) => cars.type.toLowerCase() === type);

exports.filterCarsByMake = (data, make) =>
  data.filter((cars) => {
    let vehicleMake = make;
    if (make.includes('_')) {
      vehicleMake = make.replace('_', ' ');
    }
    return cars.make.toLowerCase() === vehicleMake;
  });

exports.filterCarsBySeats = (data, seats) =>
  data.filter((cars) => cars.seats >= seats);
