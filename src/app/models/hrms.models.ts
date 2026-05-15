export type Role = 'Super Admin' | 'HR' | 'Manager' | 'Employee';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  accessToken: string;
}

export interface Employee {
  _id?: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: number;
  status: 'Onboarding' | 'Active' | 'On Leave' | 'Inactive';
  address?: string;
  emergencyContact?: string;
  profileImageUrl?: string;
}

export interface LeaveRequest {
  _id: string;
  employeeName: string;
  type: 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Maternity Leave';
  startDate: string;
  endDate: string;
  status: 'Pending Manager' | 'Pending HR' | 'Approved' | 'Rejected';
}

export interface DashboardMetrics {
  employees: number;
  presentToday: number;
  pendingLeaves: number;
  payrollProcessed: number;
  attritionRate: number;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'leave' | 'payroll' | 'attendance' | 'announcement';
  read: boolean;
  createdAt: string;
}
