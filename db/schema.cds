namespace sap.employee;


using { cuid, managed, temporal } from '@sap/cds/common';

entity EmpCreationForm : cuid, managed {
    key EmployeeIDInternal : Integer;
    EmployeeIDExternal : String;
    UserLogin : String;
    Tenant : String;
    FirstName : String;
    LastName : String;
    Email : String;
    MobilePhone : String;
    Country : String;
    Language : String;
    ValidatyStartDate : Date;
    ValidatyEndDate : Date;
    UserPasswordPolicy : String;
}