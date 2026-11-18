import { IEmployeeRepository } from '../repositories';
import { Employee } from '../types';

export class EmployeeService {
  constructor(private readonly employeeRepo: IEmployeeRepository) {}

  getEmployeeById(id: number): Employee | null {
    return this.employeeRepo.findById(id);
  }

  getTotalCount(): number {
    return this.employeeRepo.count();
  }
}
