using { sap.employee as dm } from '../db/schema';

//
// annotations that control rendering of fields and labels
//

annotate dm.EmpCreationForm with @title: '{i18n>EmpCreationForm}'
{
    ID                                  @UI.Hidden;
    EmployeeIDExternal                  @title: '{i18n>EmployeeIDExternal}';
    EmployeeIDInternal                  @title: '{i18n>EmployeeIDInternal}';
    FirstName                           @title: '{i18n>FirstName}';
    LastName                            @title: '{i18n>LastName}';
    MobilePhone                         @title: '{i18n>MobilePhone}';
    UserLogin                           @title: '{i18n>UserLogin}';
    UserPasswordPolicy                  @title: '{i18n>UserPasswordPolicy}';
    ValidatyEndDate                     @title: '{i18n>ValidatyEndDate}';
    ValidatyStartDate                   @title: '{i18n>ValidatyStartDate}';
    Language                            @title: '{i18n>Language}';
    Email                               @title: '{i18n>Email}';
    Country                             @title: '{i18n>Country}';


    createdAt                           @title: '{i18n>createdAt}'  @UI.HiddenFilter: false;
    createdBy                           @title: '{i18n>createdBy}'  @UI.HiddenFilter: false;
    modifiedAt                          @title: '{i18n>modifiedAt}' @UI.HiddenFilter: false;
    modifiedBy                          @title: '{i18n>modifiedBy}' @UI.HiddenFilter: false;

}
