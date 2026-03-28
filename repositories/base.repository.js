class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id, populate = null) {
    let query = this.model.findById(id);
    if (populate) {
      query = query.populate(populate);
    }
    return await query;
  }

  async findOne(filter, populate = null) {
    let query = this.model.findOne(filter);
    if (populate) {
      query = query.populate(populate);
    }
    return await query;
  }

  async find(filter = {}, options = {}) {
    const {
      populate,
      sort = { createdAt: -1 },
      limit = 10,
      skip = 0,
      select = null,
    } = options;

    let query = this.model.find(filter);

    if (populate) {
      query = query.populate(populate);
    }

    if (select) {
      query = query.select(select);
    }

    query = query.sort(sort).skip(skip).limit(limit);

    return await query;
  }

  async updateById(id, data, options = { new: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  async updateOne(filter, data, options = { new: true }) {
    return await this.model.findOneAndUpdate(filter, data, options);
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteOne(filter) {
    return await this.model.findOneAndDelete(filter);
  }

  async deleteMany(filter) {
    return await this.model.deleteMany(filter);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  async exists(filter) {
    return await this.model.exists(filter);
  }

  async aggregate(pipeline) {
    return await this.model.aggregate(pipeline);
  }
}

module.exports = BaseRepository;