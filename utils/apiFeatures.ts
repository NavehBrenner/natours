import { json, Request, Response } from 'express';
import { Document, Query } from 'mongoose';
import { Tour, ITour } from '../models/toursModel';

class APIFeatures {
  public query: Query<ITour[], ITour>;
  public reqQuery: any;
  constructor(query: Query<ITour[], ITour>, reqQuery: any) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter() {
    const queryObj = { ...this.reqQuery };
    const excludeFields = ['sort', 'limit', 'page', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    this.query = Tour.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      if (typeof this.reqQuery.sort != 'string')
        throw new Error('Invalid sort field');
      this.query = this.query.sort(this.reqQuery.sort.split(',').join(' '));
    } else this.query = this.query.sort('-createdAt');

    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      if (typeof this.reqQuery.fields != 'string')
        throw new Error('Invalid fields');
      this.query = this.query.select(this.reqQuery.fields.split(',').join(' '));
    } else this.query = this.query.select('-__v');

    return this;
  }

  paginate() {
    const page: number = +(this.reqQuery.page || 1);
    const limit: number = +(this.reqQuery.limit || 100);
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
