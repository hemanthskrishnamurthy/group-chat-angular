export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findById(id) {
    return this.model.findById(id);
  }

  create(payload) {
    return this.model.create(payload);
  }

  update(id, payload) {
    return this.model.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  }

  remove(id) {
    return this.model.findByIdAndDelete(id);
  }
}
