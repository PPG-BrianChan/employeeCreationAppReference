using {sap.employee as dm} from '../db/schema';

//
// annotations that control rendering of fields and labels
//

annotate dm.EmpCreationForm with @title : '{i18n>EmpCreationForm}' {
    ID                          @UI.Hidden;
    SalesReportingEligible      @title           : '{i18n>SalesReportingEligible}';
    BusinessPartnerID           @title           : '{i18n>BusinessPartnerID}';
    EmployeeIDExternal          @title           : '{i18n>EmployeeIDExternal}';
    EmployeeIDInternal          @title           : '{i18n>EmployeeIDInternal}';
    FirstName                   @title           : '{i18n>FirstName}';
    LastName                    @title           : '{i18n>LastName}';
    MobilePhone                 @title           : '{i18n>MobilePhone}';
    UserLogin                   @title           : '{i18n>UserLogin}';
    UserLocked                  @title           : '{i18n>UserLocked}';
    UserPasswordPolicy          @title           : '{i18n>UserPasswordPolicy}';
    UserPassword                @title           : 'User Password';
    ValidatyEndDate             @title           : '{i18n>ValidatyEndDate}';
    ValidatyStartDate           @title           : '{i18n>ValidatyStartDate}';
    Language                    @title           : '{i18n>Language}';
    Email                       @title           : '{i18n>Email}';
    Country                     @title           : '{i18n>Country}';
    unblockBtnEnabled           @title           : '{i18n>Country}';
    createdAt                   @title           : '{i18n>createdAt}'  @UI.HiddenFilter  : false;
    createdBy                   @title           : '{i18n>createdBy}'  @UI.HiddenFilter  : false;
    modifiedAt                  @title           : '{i18n>modifiedAt}'  @UI.HiddenFilter : false;
    modifiedBy                  @title           : '{i18n>modifiedBy}'  @UI.HiddenFilter : false;

}

annotate dm.BusinessRoles with {
    Role @title : '{i18n>Role}';
};

annotate dm.EmployeeOrgUnitAssigment with {
    UnitID    @title : '{i18n>UnitID}';
    JobID     @title : '{i18n>JobID}';
    IsPrimary @title : '{i18n>IsPrimary}';
};

annotate dm.SalesResponsability with {
    SalesOrgID @title : '{i18n>SalesOrgID}';
};


/*
annotate dm.EmployeeLanguageCodeCollection with {
    ID @(
        title  : '{i18n>ID}',
        UI.Hidden : true,
        Common : {Text : {
            $value                 : Description,
            ![@UI.TextArrangement] : #TextOnly
        }}
    );
};
*/
