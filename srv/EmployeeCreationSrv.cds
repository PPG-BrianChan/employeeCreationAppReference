using {sap.employee as empployee} from '../db/schema';

service EmployeeCreationService{
    entity EmpCreationForm as projection on empployee.EmpCreationForm;
}