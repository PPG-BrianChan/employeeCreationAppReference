namespace sap.employee;

using { cuid, managed, temporal, sap, sap.common.CodeList } from '@sap/cds/common';
using { employeeanduser as external} from '../srv/external/employeeanduser.csn';
using { jobdefinition as extjob } from '../srv/external/jobdefinition.csn';
using { organisationalunit as extunit } from '../srv/external/organisationalunit.csn';
using { salesterritory as extterritory } from '../srv/external/salesterritory.csn';

entity EmpCreationForm : cuid, managed {
    System: String;
    EmployeeUUID : String;
    EmployeeUUIDWithHyphen : String;
    BusinessPartnerID : String;
    EmployeeIDInternal : String;
    EmployeeIDExternal : String;
    UserLocked : Boolean;
    UserLogin : String;
    SalesReportingEligible: Boolean;
    FirstName : String;
    LastName : String;
    Email : String;
    MobilePhone : String;
    Country : Association to one EmployeeCountryCodeCollection;
    Language : Association to one EmployeeLanguageCodeCollection;
    ValidatyStartDate : Date;
    ValidatyEndDate : Date;
    EmployeeIdentifier : Association to one EmployeeIdentifier;
    Region : Association to one Region;
    Subregion : Association to one Subregion;
    UserPasswordPolicy : Association to one EmployeeUserPasswordPolicyCodeCollection;
    To_OrgUnits : Composition of many EmployeeOrgUnitAssigment on To_OrgUnits.To_CreationForm = $self;
    To_SalesResponsobilities : Composition of many SalesResponsability on To_SalesResponsobilities.To_CreationForm = $self;
    To_BusinessRoles : Composition of many BusinessRoles on To_BusinessRoles.To_CreationForm = $self;
    To_Mappings : Composition of many Mapping on To_Mappings.To_CreationForm = $self;
    To_Territories : Composition of many Territories on To_Territories.To_CreationForm = $self;

    virtual blockBtnEnabled : Boolean default false;
    virtual unblockBtnEnabled : Boolean default false;
    refreshCodeList : Boolean;
    HideFirstPanel : Boolean;
    HideSecondPanel : Boolean default true;
    IsNotTesterUser : Boolean;
}

entity EmployeeOrgUnitAssigment:cuid {
    To_CreationForm : Association to one EmpCreationForm;
    UnitID : Association to one OrgUnit;
    RoleCode : Association to one EmployeeOrgaUnitAssignmentRoleCodeCollection;
    JobID : Association to one JobDefinitionCollection;
    ObjectID : String;
    IsUpdate : Boolean;
    IsPrimary : Boolean;
};

entity SalesResponsability:cuid {
    To_CreationForm : Association to one EmpCreationForm;
    SalesOrgID : Association to one SalesOrgs;
    DistributionChanelCode : Association to one OrganisationalUnitDistributionChannelAndDivisionDistributionChannelCodeCollection;
    DivisionCode : Association to one OrganisationalUnitDistributionChannelAndDivisionDivisionCodeCollection;
    MainIndicator : Boolean;
    ObjectID : String;
    IsUpdate : Boolean;
};

entity Territories:cuid {
    To_CreationForm : Association to one EmpCreationForm;
    SalesTerritory : Association to one SalesTerritoryCollection;
    ObjectID : String;
    IsUpdate : Boolean;
    TerritoryObjectID : String;
}

entity BusinessRoles:cuid {
    To_CreationForm : Association to one EmpCreationForm;
    Role : Association to one Roles;
    ObjectID : String;
    IsUpdate : Boolean;
    IsDelete : Boolean;
}

entity Mapping:cuid {
    To_CreationForm : Association to one EmpCreationForm;
    RemoteObjectID : String;
    RemoteSystemID : Association to one RemoteSystem;
    ObjectID : String;
    IsUpdate : Boolean;
}


entity EmployeeLanguageCodeCollection as projection on external.EmployeeLanguageCodeCollection{
    key Code, Description
};

entity EmployeeCountryCodeCollection as projection on external.EmployeeCountryCodeCollection {
    key Code, Description
};

entity EmployeeUserPasswordPolicyCodeCollection as projection on external.EmployeeUserPasswordPolicyCodeCollection {
    key Code, Description
};

entity JobDefinitionCollection as projection on extjob.JobDefinitionCollection {
    key JobID, JobName
};
/*
entity OrganisationalUnitNameAndAddressCollection as projection on extunit.OrganisationalUnitNameAndAddressCollection {
    key OrganisationalUnitID as ID, Name as Description
};*/

entity OrganisationalUnitCollection as projection on extunit.OrganisationalUnitCollection{
   key OrganisationalUnitID as ID,
    MarkAsDeleted,
    OrganisationalUnitNameAndAddress as To_Names : redirected to OrganisationalUnitNameAndAddressCollection,
    OrganisationalUnitFunctions as To_Functions: redirected to extunit.OrganisationalUnitFunctionsCollection
};

entity SalesOrgs: cuid {
    key Code : String;
    Description : String;
    SalesOrgIndicator : Boolean;
};

entity OrgUnit: cuid {
    key Code : String;
    Description : String;
};

entity OrganisationalUnitNameAndAddressCollection as projection on extunit.OrganisationalUnitNameAndAddressCollection {
    OrganisationalUnitID,
    Name
};

entity OrganisationalUnitFunctionsCollection as projection on extunit.OrganisationalUnitFunctionsCollection {
    OrganisationalUnitID,
    SalesOrganisationIndicator
};


entity EmployeeOrganisationalUnitAssignmentRoleCodeCollection as projection on external.EmployeeOrganisationalUnitAssignmentRoleCodeCollection {
    key Code as ID, Description
};

entity EmployeeOrgaUnitAssignmentRoleCodeCollection {
    key Code : String;
    Description : String;
};

entity OrganisationalUnitDistributionChannelAndDivisionDistributionChannelCodeCollection as projection on extunit.OrganisationalUnitDistributionChannelAndDivisionDistributionChannelCodeCollection {
    key Code, Description
};

entity OrganisationalUnitDistributionChannelAndDivisionDivisionCodeCollection as projection on extunit.OrganisationalUnitDistributionChannelAndDivisionDivisionCodeCollection {
    key Code, Description
};

entity SalesTerritoryCollection as projection on extterritory.SalesTerritoryCollection {
    key Id, Name
}

entity Roles {
    key CROOT_ID_CONTENT : String;
    CDESCRIPTION_NAME : String;
};

entity RemoteSystem {
    key ID : String;
    Description : String;
}

entity TargetSystem {
    key ID : String;
    Description : String;
}

entity EmployeeIdentifier {
    key Code : String;
    Description : String;
}

entity Region {
    key Code : String;
    Description : String;
}

entity Subregion {
    key Code : String;
    Description : String;
}