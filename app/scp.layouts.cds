    using EmployeeCreationService as scp from '../srv/EmployeeCreationSrv';

//
// annotatios that control the fiori layout
//

annotate scp.EmpCreationForm with @UI : {

    HeaderInfo: {
        $Type          : 'UI.HeaderInfoType',
        TypeName       : '{i18n>EmployeeForm}',
        TypeNamePlural : '{i18n>EmployeeForms}',
        ImageUrl       : 'https://cdn-user-icons.flaticon.com/63946/63946481/1644314752529.svg?token=exp=1644315652~hmac=c973723ac91b7fc016438713a945d633',
        Title          : {  Value: '{i18n>EmployeeForm}'  }
    },

    PresentationVariant : {
        Text           : 'Default',
        Visualizations : ['@UI.LineItem'],
        SortOrder      : [{
            $Type       : 'Common.SortOrderType',
            Property   : ID,
            Descending : true
        }]
    },

    SelectionFields  : [
        EmployeeIDExternal,
        EmployeeIDInternal,
        Email,
        MobilePhone,
        UserLogin,
        'To_BusinessRoles/Role_CROOT_ID_CONTENT',
        'To_OrgUnits/UnitID_ID',
        'To_OrgUnits/JobID_ID',
        'To_SalesResponsobilities/SalesOrgID_ID',
        createdAt,
        createdBy
    ],

    LineItem: [
        {   $Type: 'UI.DataField', Value: EmployeeIDExternal },
        {   $Type: 'UI.DataField', Value: EmployeeIDInternal        },
        {   $Type: 'UI.DataField', Value: Email,          },
        {   $Type: 'UI.DataField', Value: MobilePhone   },
        {   $Type: 'UI.DataField', Value: UserLogin  }
    ],

    HeaderFacets: [
        {   $Type : 'UI.ReferenceFacet',  Target: '@UI.FieldGroup#HeaderGroup',
            Label : '{i18n>Identifications}'
        },
    ],    

    Facets: [
        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'BasicInfo',
            Label  : '{i18n>BasicInfo}',
            Facets : [
                {  $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#BasicInfo'},
            ]
        },
        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'AdminData',
            Label  : '{i18n>AdminData}',
            Facets : [
                { $Type  : 'UI.ReferenceFacet', Target : '@UI.FieldGroup#CreationDetailsFG',    Label  : '{i18n>CreationDetails}'   },
                { $Type  : 'UI.ReferenceFacet', Target : '@UI.FieldGroup#ModificationDetailsFG',Label  : '{i18n>ModificationDetails}'},
            ]
        }
    ],

    FieldGroup #HeaderGroup: {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {   $Type : 'UI.DataField', Value : EmployeeIDInternal   },
            {   $Type : 'UI.DataField', Value : EmployeeIDExternal },
            {   $Type : 'UI.DataField', Value : UserLogin }
        ]
    },
    
    FieldGroup #BasicInfo: {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {   $Type : 'UI.DataField', Value : UserLogin                      },
            {   $Type : 'UI.DataField', Value : FirstName                      },
            {   $Type : 'UI.DataField', Value : LastName                       },
            {   $Type : 'UI.DataField', Value : Email                          },
            {   $Type : 'UI.DataField', Value : MobilePhone                    },
            {   $Type : 'UI.DataField', Value : Country_ID                     },
            {   $Type : 'UI.DataField', Value : Language_ID                    },
            {   $Type : 'UI.DataField', Value : ValidatyStartDate              },
            {   $Type : 'UI.DataField', Value : UserPasswordPolicy_ID          }
        ]
    },

    FieldGroup #CreationDetailsFG: {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {   $Type : 'UI.DataField', Value : createdAt   },
            {   $Type : 'UI.DataField', Value : createdBy   }
        ]
    },

    FieldGroup #ModificationDetailsFG          : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {   $Type : 'UI.DataField', Value : modifiedAt  },
            {   $Type : 'UI.DataField', Value : modifiedBy  }
        ]
    }
};


