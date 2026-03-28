class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async getById(id, populate = null) {
    const item = await this.repository.findById(id, populate);
    if (!item) {
      throw ApiError.notFound(`${this.repository.model.modelName} not found`);
    }
    return item;
  }

  async getAll(filter = {}, options = {}) {
    return await this.repository.find(filter, options);
  }

  async update(id, data) {
    const item = await this.repository.updateById(id, data);
    if (!item) {
      throw ApiError.notFound(`${this.repository.model.modelName} not found`);
    }
    return item;
  }

  async delete(id) {
    const item = await this.repository.deleteById(id);
    if (!item) {
      throw ApiError.notFound(`${this.repository.model.modelName} not found`);
    }
    return item;
  }

  async count(filter = {}) {
    return await this.repository.count(filter);
  }
}

module.exports = BaseService;