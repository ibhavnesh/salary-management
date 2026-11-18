import { Router } from 'express';
import Database from 'better-sqlite3';
import { EmployeeRepository } from '../repositories';
import { EmployeeService } from '../services';
import { EmployeeController } from '../controllers';

export function createEmployeeRouter(db: Database.Database): Router {
  const router = Router();
  const repository = new EmployeeRepository(db);
  const service = new EmployeeService(repository);
  const controller = new EmployeeController(service);

  router.get('/', controller.getEmployees);
  router.get('/filters', controller.getFilters);
  router.get('/:id', controller.getEmployeeById);
  router.post('/', controller.createEmployee);
  router.put('/:id', controller.updateEmployee);
  router.delete('/:id', controller.deleteEmployee);

  return router;
}
