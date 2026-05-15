import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database.mjs';
import { Department } from '../models/department.model.mjs';
import { Employee } from '../models/employee.model.mjs';
import { Notification } from '../models/notification.model.mjs';
import { User } from '../models/user.model.mjs';
import { logger } from '../utils/logger.mjs';

await connectDatabase();

const passwordHash = await bcrypt.hash('Password@123', 10);

const users = await User.insertMany(
  [
    { name: 'Super Admin', email: 'admin@company.com', role: 'Super Admin', passwordHash },
    { name: 'HR Manager', email: 'hr@company.com', role: 'HR', passwordHash },
    { name: 'Line Manager', email: 'manager@company.com', role: 'Manager', passwordHash },
    { name: 'Employee User', email: 'employee@company.com', role: 'Employee', passwordHash },
  ],
  { ordered: false },
).catch(() => User.find());

await Department.insertMany(
  [
    { name: 'Engineering', code: 'ENG' },
    { name: 'People Ops', code: 'HR' },
    { name: 'Sales', code: 'SAL' },
    { name: 'Finance', code: 'FIN' },
  ],
  { ordered: false },
).catch(() => null);

await Employee.insertMany(
  [
    { employeeId: 'EMP-1001', name: 'Aarav Sharma', email: 'aarav@company.com', phone: '+91 90000 1001', department: 'Engineering', designation: 'Senior Developer', joiningDate: new Date('2023-04-10'), salary: 1850000, status: 'Active' },
    { employeeId: 'EMP-1002', name: 'Maya Iyer', email: 'maya@company.com', phone: '+91 90000 1002', department: 'People Ops', designation: 'HR Manager', joiningDate: new Date('2022-08-22'), salary: 1650000, status: 'Active' },
    { employeeId: 'EMP-1003', name: 'Kabir Khan', email: 'kabir@company.com', phone: '+91 90000 1003', department: 'Sales', designation: 'Regional Manager', joiningDate: new Date('2021-11-15'), salary: 2100000, status: 'On Leave' },
  ],
  { ordered: false },
).catch(() => null);

await Notification.create({
  recipient: users[1]?._id,
  title: 'Welcome to Enterprise HRMS',
  message: 'Seed data has been created for development.',
  type: 'announcement',
});

logger.info('Seed completed. Default password: Password@123');
process.exit(0);
