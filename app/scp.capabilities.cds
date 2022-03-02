using EmployeeCreationService as scp from '../srv/EmployeeCreationSrv';

annotate scp.EmpCreationForm with @Common.SecondaryKey: [EmployeeIDExternal];