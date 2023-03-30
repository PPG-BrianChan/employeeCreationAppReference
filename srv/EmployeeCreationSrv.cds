using {sap.employee as employee} from '../db/schema';

service EmployeeCreationService 
// @(requires : [
//   'EmployeeCreation_KBU',
//   'Tester' 
// ]) 
{
  @Capabilities : {
    InsertRestrictions.Insertable : true,
    UpdateRestrictions.Updatable  : true,
    DeleteRestrictions.Deletable  : false
  }
  entity EmpCreationForm            as projection on employee.EmpCreationForm

  @readonly
  entity Language                   as projection on employee.EmployeeLanguageCodeCollection;

  @readonly
  entity Country                    as projection on employee.EmployeeCountryCodeCollection;

  entity EmployeeUserPasswordPolicy as projection on employee.EmployeeUserPasswordPolicyCodeCollection;

  @readonly
  entity Job                        as projection on employee.JobDefinitionCollection;

  @readonly
  entity RoleCode                   as projection on employee.EmployeeOrganisationalUnitAssignmentRoleCodeCollection;

  @readonly
  entity DistributionChanelCode     as projection on employee.OrganisationalUnitDistributionChannelAndDivisionDistributionChannelCodeCollection;

  @readonly
  entity DivisionCode               as projection on employee.OrganisationalUnitDistributionChannelAndDivisionDivisionCodeCollection;

  @readonly
  entity SalesTerritoryCollection   as projection on employee.SalesTerritoryCollection;

  @readonly
  entity Roles                      as projection on employee.Roles;

  @readonly
  entity OrgUnitRoles               as projection on employee.EmployeeOrgaUnitAssignmentRoleCodeCollection;

  entity SalesOrgs                  as projection on employee.SalesOrgs;
  entity OrgUnit                    as projection on employee.OrgUnit;
  entity RemoteSystem               as projection on employee.RemoteSystem;
  entity TargetSystem               as projection on employee.TargetSystem;
  entity Mapping                    as projection on employee.Mapping;
  entity BusinessRoles              as projection on employee.BusinessRoles;
  entity EmployeeOrgUnitAssigment   as projection on employee.EmployeeOrgUnitAssigment;
  entity SalesResponsability        as projection on employee.SalesResponsability;
  entity Territories                as projection on employee.Territories;
  entity EmployeeIdentifier         as projection on employee.EmployeeIdentifier;
  entity Region                     as projection on employee.Region;
  entity Subregion                  as projection on employee.Subregion;

  type returnFunstionType {
      Code: String;
      Message: String;
  }

  function lockUsers(idsList: String) returns returnFunstionType;
  function unlockUsers(idsList: String) returns returnFunstionType;
  
}

annotate EmployeeCreationService.EmpCreationForm with @odata.draft.enabled;
