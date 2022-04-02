using EmployeeCreationService as scp from '../srv/EmployeeCreationSrv';
using { sap.employee as e } from '../db/schema';


//
// annotations that control the behavior of fields and actions
//

annotate scp.EmpCreationForm {
   // FirstName @readonly : ;
   /* UserLogin @readonly;
    FirstName @mandatory;
    LastName  @mandatory;
    Email     @mandatory;
    Country   @mandatory;
    Language  @mandatory;
    UserPasswordPolicy @mandatory;
    ValidatyStartDate @mandatory;
    ValidatyEndDate @mandatory;*/
 /*   Language @Common.ValueListWithFixedValues : true;  
            @(
        Common : {
            Text      : {
                $value                 : 'fese',
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList : {
                SearchSupported : true,
                CollectionPath  : 'Language',
                Parameters      : [
                    {
                        $Type             : 'Common.ValueListParameterInOut',
                        LocalDataProperty : Language_ID,
                        ValueListProperty : 'ID'
                    },
                    {
                        $Type             : 'Common.ValueListParameterInOut',
                        LocalDataProperty : Description,
                        ValueListProperty : 'Text'
                    }
                ]
            }
        }
    );*/
    Language @Common.ValueListWithFixedValues : true;  
    Language @Common.ValueList: {
        CollectionPath : 'Language',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: Language_ID, 
                ValueListProperty: 'ID'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };
    Country @Common.ValueListWithFixedValues : true;  
    Country @Common.ValueList: {
        CollectionPath : 'Country',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: Country_ID, 
                ValueListProperty: 'ID'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };
    UserPasswordPolicy @Common.ValueListWithFixedValues : true;  
    UserPasswordPolicy @Common.ValueList: {
        CollectionPath : 'EmployeeUserPasswordPolicy',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: UserPasswordPolicy_ID, 
                ValueListProperty: 'ID'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };
};


annotate scp.EmployeeOrgUnitAssigment {
    JobID @Common.ValueListWithFixedValues : true;  
    JobID @Common.ValueList: {
        CollectionPath : 'Job',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: JobID_ID, 
                ValueListProperty: 'ID'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };/*
    RoleCode @Common.ValueListWithFixedValues : true;  
    RoleCode @Common.ValueList: {
        CollectionPath : 'RoleCode',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: RoleCode_Code, 
                ValueListProperty: 'ID'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };*/
    UnitID @Common.ValueListWithFixedValues : true;  
    UnitID @Common.ValueList: {
        CollectionPath : 'OrgUnit',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: UnitID_Code, 
                ValueListProperty: 'Code'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };
}

annotate scp.SalesResponsability with {
    DistributionChanelCode @Common.ValueListWithFixedValues : true;  
    DistributionChanelCode @Common.ValueList: {
        CollectionPath : 'DistributionChanelCode',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: DistributionChanelCode_ID, 
                ValueListProperty: 'ID'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };
    DivisionCode @Common.ValueListWithFixedValues : true;  
    DivisionCode @Common.ValueList: {
        CollectionPath : 'DivisionCode',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: DivisionCode_ID, 
                ValueListProperty: 'ID'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };
    SalesOrgID @Common.ValueListWithFixedValues : true;  
    SalesOrgID @Common : {
        Text            : SalesOrgID.Description,
        TextArrangement : #TextLast
    };
    SalesOrgID @Common.ValueList: {
        CollectionPath : 'SalesOrgs',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: SalesOrgID_Code, 
                ValueListProperty: 'Code'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };   
    
};

annotate scp.Territories with {
    SalesTerritory @Common.ValueListWithFixedValues : true;
    SalesTerritory @Common.ValueList: {
        CollectionPath : 'SalesTerritoryCollection',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: SalesTerritory_ID, 
                ValueListProperty: 'ID'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };
};


annotate scp.BusinessRoles with {
    Role @Common.ValueListWithFixedValues;
    Role @Common.ValueList: {
        CollectionPath : 'Roles',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: Role_CROOT_ID_CONTENT, 
                ValueListProperty: 'CROOT_ID_CONTENT'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'CDESCRIPTION_NAME'},
            ]
    };
};

annotate scp.Mapping with {
    RemoteSystemID @Common.ValueListWithFixedValues;
    RemoteSystemID @Common.ValueList: {
        SearchSupported : true,
        CollectionPath : 'RemoteSystem',
        Parameters : [
            {   $Type: 'Common.ValueListParameterInOut',       
                LocalDataProperty: RemoteSystemID_ID, 
                ValueListProperty: 'ID'},  
            {   $Type: 'Common.ValueListParameterDisplayOnly', 
                ValueListProperty: 'Description'},
            ]
    };
};

annotate scp.EmpCreationForm actions {
    @(
        cds.odata.bindingparameter.name : '_it',
        Core.OperationAvailable : _it.unblockBtnEnabled,
        Common.SideEffects              : {
            TargetProperties : ['_it/*']
        }
    )
    unblockUser;  
    @(
        cds.odata.bindingparameter.name : '_it',
        Core.OperationAvailable : _it.blockBtnEnabled,
        Common.SideEffects              : {
            TargetProperties : ['_it/*']
        }
    )
    blockUser;  
}


annotate e.Roles with @cds.odata.valuelist;
annotate e.EmployeeLanguageCodeCollection with @cds.odata.valuelist;
annotate e.EmployeeCountryCodeCollection with @cds.odata.valuelist;
annotate e.EmployeeUserPasswordPolicyCodeCollection with @cds.odata.valuelist;
annotate e.JobDefinitionCollection with @cds.odata.valuelist;
annotate e.OrganisationalUnitCollection with @cds.odata.valuelist;
annotate e.EmployeeOrganisationalUnitAssignmentRoleCodeCollection with @cds.odata.valuelist;
annotate e.OrganisationalUnitDistributionChannelAndDivisionDistributionChannelCodeCollection with @cds.odata.valuelist;
annotate e.OrganisationalUnitDistributionChannelAndDivisionDivisionCodeCollection with @cds.odata.valuelist;

annotate scp.EmployeeOrgUnitAssigment with @assert.integrity: false;
annotate scp.SalesResponsability with @assert.integrity: false;
annotate scp.BusinessRoles with @assert.integrity: false;
annotate scp.Mapping with @assert.integrity: false;
annotate scp.Territories with @assert.integrity: false;
