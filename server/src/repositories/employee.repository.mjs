import { Employee } from '../models/employee.model.mjs';
import { BaseRepository } from './base.repository.mjs';

export class EmployeeRepository extends BaseRepository {
  constructor() {
    super(Employee);
  }

  async list({ page = 1, limit = 10, search = '', sort = '-createdAt' }) {
    const filter = search ? { $text: { $search: search } } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Employee.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Employee.countDocuments(filter),
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }
}
