import {
    FilterQuery,
    DeleteResult,
    ProjectionType,
    QueryOptions,
    Model,
    Types,
    UpdateQuery,
    UpdateResult,
    PopulateOptions,
  } from "mongoose";
  
  export abstract class DBService<T> {
    constructor(private readonly model: Model<T>) {}
  
    create(document: Partial<T>): Promise<T> {
      return this.model.create(document);
    }
  
    findById({
      id,
      options,
      populate,
    }: {
      id: Types.ObjectId;
      options?: QueryOptions;
      populate?: PopulateOptions | PopulateOptions[];
    }): Promise<T | null> {
      let query = this.model.findById(id, options);
      if (populate) query = query.populate(populate);
      return query.exec();
    }
  
    findOne({
      filter,
      projection,
      options,
      populate,
    }: {
      filter: FilterQuery<T>;
      projection?: ProjectionType<T>;
      options?: QueryOptions;
      populate?: PopulateOptions | PopulateOptions[];
    }
    ): Promise<T | null> {
      let query = this.model.findOne(filter, projection, options);
      if (populate) query = query.populate(populate);
      return query.exec();
    }
  
    find({
      filter,
      projection,
      options,
      populate,
      sort
    }: {
      filter: FilterQuery<T>;
      projection?: ProjectionType<T>;
      options?: QueryOptions;
      populate?: PopulateOptions | PopulateOptions[];
      sort?: Record<string, 1 | -1>;
    }): Promise<T[]> {
      let query = this.model.find(filter, projection, options);
      if (populate) query = query.populate(populate);
      if (sort) query = query.sort(sort);
      return query.exec();
    }
    
    delete(filter: FilterQuery<T>): Promise<DeleteResult> {
      return this.model.deleteOne(filter).exec();
    }

    deleteMany(filter: FilterQuery<T>): Promise<DeleteResult> {
      return this.model.deleteMany(filter).exec();
    }
  
    update(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult> {
      return this.model.updateOne(filter, update).exec();
    }
  
    updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult> {
      return this.model.updateMany(filter, update).exec();
    }
  
    findByIdAndUpdate(
      id: Types.ObjectId,
      update: UpdateQuery<T>,
      options: QueryOptions = { new: true }
    ): Promise<T | null> {
      return this.model.findByIdAndUpdate(id, update, options).exec();
    }
  
    async paginate({
      filter = {},
      page = 1,
      limit = 10,
      projection,
      options,
      populate
    }: {
      filter: FilterQuery<T>,
      page: number,
      limit: number,
      projection?: ProjectionType<T>,
      options?: QueryOptions,
      populate?: PopulateOptions | PopulateOptions[]
    }): Promise<{ data: T[]; total: number }> {
      const skip = (page - 1) * limit;
      let query = this.model.find(filter, projection, { ...options, skip, limit });
      if (populate) query = query.populate(populate);
  
      const [data, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filter)
      ]);
  
      return { data, total };
    }

    aggregate(pipeline: any[]): Promise<T[]> {
      return this.model.aggregate(pipeline).exec();
    }
  }
  