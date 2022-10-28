using EmployeeCreationService as scp from '../srv/EmployeeCreationSrv';
using {sap.employee as e} from '../db/schema';

annotate scp.EmpCreationForm {
    UserLogin          @mandatory;
    UserPasswordPolicy @mandatory;
    Country            @mandatory;
    /*EmployeeIdentifier @mandatory;*/
    Language           @Common.ValueListWithFixedValues : true;
    Language           @Common.ValueList                : {
        CollectionPath : 'Language',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : Language_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    };
    Country            @Common.ValueListWithFixedValues : true;
    Country            @Common.ValueList                : {
        CollectionPath : 'Country',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : Country_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    };
    UserPasswordPolicy @Common.ValueListWithFixedValues : true;
    UserPasswordPolicy @Common.ValueList                : {
        CollectionPath : 'EmployeeUserPasswordPolicy',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : UserPasswordPolicy_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    };
    code               @Common.ValueListWithFixedValues : true;
    code               @Common.ValueList                : {
        CollectionPath : 'SystemType',
        Parameters     : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : code,
            ValueListProperty : 'code'
        }]
    };
    EmployeeIdentifier @Common.ValueListWithFixedValues;
    EmployeeIdentifier @Common.ValueList : {
        CollectionPath : 'EmployeeIdentifier',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : EmployeeIdentifier_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            }
        ]
    };
    Region @Common.ValueListWithFixedValues;
    Region @Common.ValueList : {
        CollectionPath : 'Region',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : Region_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            }
        ]
    };
    Subregion @Common.ValueListWithFixedValues;
    Subregion @Common.ValueList : {
        CollectionPath : 'Subregion',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : Subregion_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            }
        ]
    };
};


annotate scp.EmployeeOrgUnitAssigment {
    JobID  @Common.ValueListWithFixedValues : true;
    JobID  @Common.ValueList                : {
        CollectionPath : 'Job',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : JobID_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    }; /*
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
    UnitID @Common.ValueList                : {
        CollectionPath : 'OrgUnit',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : UnitID_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    };
}

annotate scp.SalesResponsability with {
    DistributionChanelCode @Common.ValueListWithFixedValues : true;
    DistributionChanelCode @Common.ValueList                : {
        CollectionPath : 'DistributionChanelCode',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : DistributionChanelCode_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    };
    DivisionCode           @Common.ValueListWithFixedValues : true;
    DivisionCode           @Common.ValueList                : {
        CollectionPath : 'DivisionCode',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : DivisionCode_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    };
    SalesOrgID             @Common.ValueListWithFixedValues : true;
    SalesOrgID             @Common                          : {
        Text            : SalesOrgID.Description,
        TextArrangement : #TextLast
    };
    SalesOrgID             @Common.ValueList                : {
        CollectionPath : 'SalesOrgs',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : SalesOrgID_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    };

};

annotate scp.Territories with {
    SalesTerritory @Common.ValueListWithFixedValues : true;
    SalesTerritory @Common.ValueList                : {
        CollectionPath : 'SalesTerritoryCollection',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : SalesTerritory_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    };
};


annotate scp.BusinessRoles with {
    Role @Common.ValueListWithFixedValues;
    Role @Common.ValueList : {
        CollectionPath : 'Roles',
        Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : Role_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    };
};

annotate scp.Mapping with {
    RemoteSystemID @Common.ValueListWithFixedValues;
    RemoteSystemID @Common.ValueList : {
        SearchSupported : true,
        CollectionPath  : 'RemoteSystem',
        Parameters      : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : RemoteSystemID_Code,
                ValueListProperty : 'Code'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'Description'
            },
        ]
    };
};

annotate scp.EmpCreationForm actions {
    @(
        cds.odata.bindingparameter.name : '_it',
        Core.OperationAvailable         : _it.unblockBtnEnabled,
        Common.SideEffects              : {TargetProperties : ['_it/*']}
    )
    unblockUser;
    @(
        cds.odata.bindingparameter.name : '_it',
        Core.OperationAvailable         : _it.blockBtnEnabled,
        Common.SideEffects              : {TargetProperties : ['_it/*']}
    )
    blockUser;
}


annotate e.EmployeeIdentifier with @cds.odata.valuelist;
annotate e.Region with @cds.odata.valuelist;
annotate e.Subregion with @cds.odata.valuelist;
annotate e.Roles with @cds.odata.valuelist;
annotate e.EmployeeLanguageCodeCollection with @cds.odata.valuelist;
annotate e.EmployeeCountryCodeCollection with @cds.odata.valuelist;
annotate e.EmployeeUserPasswordPolicyCodeCollection with @cds.odata.valuelist;
annotate e.JobDefinitionCollection with @cds.odata.valuelist;
annotate e.OrganisationalUnitCollection with @cds.odata.valuelist;
annotate e.EmployeeOrganisationalUnitAssignmentRoleCodeCollection with @cds.odata.valuelist;
annotate e.OrganisationalUnitDistributionChannelAndDivisionDistributionChannelCodeCollection with @cds.odata.valuelist;
annotate e.OrganisationalUnitDistributionChannelAndDivisionDivisionCodeCollection with @cds.odata.valuelist;
annotate scp.EmpCreationForm with @assert.integrity : false;
annotate scp.EmployeeIdentifier with @assert.integrity : false;
annotate scp.Region with @assert.integrity : false;
annotate scp.Subregion with @assert.integrity : false;
annotate scp.EmployeeOrgUnitAssigment with @assert.integrity : false;
annotate scp.SalesResponsability with @assert.integrity : false;
annotate scp.BusinessRoles with @assert.integrity : false;
annotate scp.Mapping with @assert.integrity : false;
annotate scp.Territories with @assert.integrity : false;
