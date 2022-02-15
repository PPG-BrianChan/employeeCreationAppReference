using { sap.employee as employee } from '../db/schema';
using { employeeanduser as external} from './external/employeeanduser.csn';
using { jobdefinition as extjob } from './external/jobdefinition.csn';
using { organisationalunit as extunit } from './external/organisationalunit.csn';
using { objectidentifiermapping as extmapping } from './external/objectidentifiermapping.csn';


service EmployeeCreationService
{
    entity EmpCreationForm as projection on employee.EmpCreationForm;
    @readonly
    entity Language as projection on employee.EmployeeLanguageCodeCollection;
    @readonly
    entity Country as projection on employee.EmployeeCountryCodeCollection;
    @readonly
    entity EmployeeUserPasswordPolicy as projection on employee.EmployeeUserPasswordPolicyCodeCollection;
    @readonly
    entity Job as projection on employee.JobDefinitionCollection;
    @readonly
    entity RoleCode as projection on employee.EmployeeOrganisationalUnitAssignmentRoleCodeCollection;    
    @readonly  
    entity DistributionChanelCode as projection on employee.OrganisationalUnitDistributionChannelAndDivisionDistributionChannelCodeCollection;
    @readonly
    entity DivisionCode as projection on employee.OrganisationalUnitDistributionChannelAndDivisionDivisionCodeCollection;    
    @readonly   
    entity Roles as projection on employee.Roles;
    @readonly
    entity OrgUnitRoles as projection on employee.EmployeeOrgaUnitAssignmentRoleCodeCollection;
    entity SalesOrgs as projection on employee.SalesOrgs;
    entity OrgUnit as projection on employee.OrgUnit;

}

annotate EmployeeCreationService.EmpCreationForm with @odata.draft.enabled;

