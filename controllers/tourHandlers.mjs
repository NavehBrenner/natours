import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// data objects //
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);
// data objects //

const checkID = (req, res, next, id) => {
  const tourIndex = tours.findIndex((el) => el.id === +id);

  if (tourIndex === -1)
    return res.status(404).json({
      status: 'fail',
      message: `Invalid ID (${id})`,
    });

  next();
};

const checkTourBody = (req, res, next) => {
  const tourData = req.body;
  if (!tourData.name || !tourData.price)
    return res.status(400).json({
      status: 'fail',
      message: `Bad tour data - Missing tour ${
        tourData.name ? 'price' : 'name'
      }`,
    });
  next();
};

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    tours,
  });
};

const getTourById = (req, res) => {
  const id = +req.params.id;
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
};

const updateTour = (req, res) => {
  const id = +req.params.id;
  const tourIndex = tours.findIndex((el) => el.id === id);
  const tour = tours[tourIndex];

  Object.keys(req.body).forEach((key) => {
    tour[key] = req.body[key];
  });

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: 'success',
        data: {
          tour: tour,
        },
      });
    },
  );
};

const deleteTour = (req, res) => {
  const id = +req.params.id;
  const tourIndex = tours.findIndex((el) => el.id === id);

  tours.splice(tourIndex);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    },
  );
};

export {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  checkID,
  checkTourBody,
};
