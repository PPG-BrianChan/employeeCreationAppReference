using EmployeeCreationService as scp from '../srv/EmployeeCreationSrv';

//
// annotatios that control the fiori layout
//

annotate scp.EmpCreationForm with @UI : {

  HeaderInfo                        : {
    $Type          : 'UI.HeaderInfoType',
    TypeName       : '{i18n>EmployeeForm}',
    TypeNamePlural : '{i18n>EmployeeForms}',
    Title          : {
      $Type : 'UI.DataField',
      Value : '{i18n>EmployeeForm}',
    },
    TypeImageUrl   : 'sap-icon://employee'
  },

  PresentationVariant               : {
    Text           : 'Default',
    Visualizations : ['@UI.LineItem'],
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : ID,
      Descending : true
    }]
  },

  SelectionFields                   : [
    EmployeeIDExternal,
    BusinessPartnerID,
    Email,
    MobilePhone,
    UserLogin,
    'To_BusinessRoles/Role_Code',
    'To_OrgUnits/UnitID_Code',
    'To_OrgUnits/JobID_Code',
    'To_SalesResponsobilities/SalesOrgID_Code',
    createdAt,
    createdBy
  ],

  LineItem                          : [
    {
      $Type : 'UI.DataField',
      Value : EmployeeIDExternal
    },
    {
      $Type : 'UI.DataField',
      Value : BusinessPartnerID
    },
    {
      $Type : 'UI.DataField',
      Value : Email,
    },
    {
      $Type : 'UI.DataField',
      Value : MobilePhone
    },
    {
      $Type : 'UI.DataField',
      Value : UserLogin
    }
  ],

  HeaderFacets                      : [{
    $Type  : 'UI.ReferenceFacet',
    Target : '@UI.FieldGroup#HeaderGroup',
    Label  : '{i18n>Identifications}'
  }, ],

  Facets                            : [
    {
      $Type  : 'UI.CollectionFacet',
      Label  : '{i18n>BasicInfo}',
      ID     : 'i18nBasicInfo',
      Facets : [
        {
          $Type         : 'UI.ReferenceFacet',
          Target        : '@UI.FieldGroup#BasicInfoTester',
          ![@UI.Hidden] : IsNotTesterUser
        },
        {
          $Type         : 'UI.ReferenceFacet',
          Target        : '@UI.FieldGroup#BasicInfo',
          ![@UI.Hidden] : HideFirstPanel
        },
        {
          $Type         : 'UI.ReferenceFacet',
          Target        : '@UI.FieldGroup#BasicInfo2',
          ![@UI.Hidden] : HideSecondPanel
        }
      ]
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>OrgUnits}',
      ID     : 'i18nOrgUnits',
      Target : 'To_OrgUnits/@UI.LineItem#i18nOrgUnits',
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>SalesResp}',
      ID     : 'i18nSalesResp',
      Target : 'To_SalesResponsobilities/@UI.LineItem#i18nSalesResp',

    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'i18nTerritories',
      Target : 'To_Territories/@UI.LineItem#i18nTerritories',
      Label  : '{i18n>Territories}',
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>BusinessRoles}',
      ID     : 'i18nBusinessRoles',
      Target : 'To_BusinessRoles/@UI.LineItem#i18nBusinessRoles',
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Mapping}',
      ID     : 'i18nMapping',
      Target : 'To_Mappings/@UI.LineItem#i18nMapping',
    },
    {
      $Type  : 'UI.CollectionFacet',
      ID     : 'AdminData',
      Label  : '{i18n>AdminData}',
      Facets : [
        {
          $Type  : 'UI.ReferenceFacet',
          Target : '@UI.FieldGroup#CreationDetailsFG',
          Label  : '{i18n>CreationDetails}',
        },
        {
          $Type  : 'UI.ReferenceFacet',
          Target : '@UI.FieldGroup#ModificationDetailsFG',
          Label  : '{i18n>ModificationDetails}',
        },
      ],
    }
  ],

  FieldGroup #HeaderGroup           : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {
        $Type : 'UI.DataField',
        Value : BusinessPartnerID
      },
      {
        $Type : 'UI.DataField',
        Value : EmployeeIDExternal
      },
      {
        $Type : 'UI.DataField',
        Value : UserLogin
      },
      {
        $Type : 'UI.DataField',
        Value : UserLocked
      },
      {
        $Type : 'UI.DataField',
        Value : System
      }
    ]
  },

  FieldGroup #BasicInfo             : {
    $Type : 'UI.FieldGroupType',

    Data  : [
      {
        $Type                     : 'UI.DataField',
        Value                     : UserLogin
      },
      {
        $Type : 'UI.DataField',
        Value : FirstName
      },
      {
        $Type : 'UI.DataField',
        Value : LastName
      },
      {
        $Type : 'UI.DataField',
        Value : Email,
      },
      {
        $Type : 'UI.DataField',
        Value : MobilePhone
      },
      {
        $Type : 'UI.DataField',
        Value : Country_Code
      },
      {
        $Type : 'UI.DataField',
        Value : Language_Code
      },
      {
        $Type : 'UI.DataField',
        Value : ValidatyStartDate
      },
      {
        $Type                     : 'UI.DataField',
        Value                     : UserPasswordPolicy_Code,
      },
      {
        $Type : 'UI.DataField',
        Value : SalesReportingEligible
      },
      {
        $Type : 'UI.DataField',
        Value : EmployeeIdentifier_Code,
        @UI.Hidden : IsSystemAC
      },
      {
        $Type : 'UI.DataField',
        Value : Region_Code,
        @UI.Hidden : IsSystemAC
      },
      {
        $Type : 'UI.DataField',
        Value : Subregion_Code,
        @UI.Hidden : IsSystemAC
      }
    ]
  },

  FieldGroup #BasicInfo2            : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {
        $Type                   : 'UI.DataField',
        Value                   : UserLogin,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : FirstName,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : LastName,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : Email,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : MobilePhone,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : Country_Code,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : Language_Code,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : ValidatyStartDate,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : UserPasswordPolicy_Code
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : SalesReportingEligible
      },
      {
        $Type : 'UI.DataField',
        Value : EmployeeIdentifier_Code,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type : 'UI.DataField',
        Value : Region_Code,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type : 'UI.DataField',
        Value : Subregion_Code,
        ![@Common.FieldControl] : #ReadOnly,
        @UI.Hidden : IsSystemAC
      }
    ]
  },

  FieldGroup #BasicInfoTester       : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {
        $Type : 'UI.DataField',
        Value : UserLogin
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : FirstName,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : LastName,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type                   : 'UI.DataField',
        Value                   : Email,
        ![@Common.FieldControl] : #ReadOnly
      },
      {
        $Type : 'UI.DataField',
        Value : MobilePhone
      },
      {
        $Type : 'UI.DataField',
        Value : Country_Code
      },
      {
        $Type : 'UI.DataField',
        Value : Language_Code
      },
      {
        $Type : 'UI.DataField',
        Value : ValidatyStartDate
      },
      {
        $Type : 'UI.DataField',
        Value : UserPasswordPolicy_Code
      },
      {
        $Type : 'UI.DataField',
        Value : SalesReportingEligible
      },
      {
        $Type : 'UI.DataField',
        Value : EmployeeIdentifier_Code,
        @UI.Hidden : IsSystemAC
      },
      {
        $Type : 'UI.DataField',
        Value : Region_Code,
        @UI.Hidden : IsSystemAC
      },
      {
        $Type : 'UI.DataField',
        Value : Subregion_Code,
        @UI.Hidden : IsSystemAC
      }
    ]
  },

  FieldGroup #CreationDetailsFG     : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {
        $Type : 'UI.DataField',
        Value : createdAt
      },
      {
        $Type : 'UI.DataField',
        Value : createdBy
      }
    ]
  },

  FieldGroup #ModificationDetailsFG : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {
        $Type : 'UI.DataField',
        Value : modifiedAt
      },
      {
        $Type : 'UI.DataField',
        Value : modifiedBy
      }
    ]
  }
};

annotate scp.EmployeeOrgUnitAssigment with @(UI.LineItem #i18nOrgUnits : [
  {
    $Type : 'UI.DataField',
    Value : UnitID_Code,
    Label : '{i18n>UnitID}',
  },
  {
    $Type : 'UI.DataField',
    Value : JobID_Code,
    Label : '{i18n>JobID}',
  },
  {
    $Type : 'UI.DataField',
    Value : IsPrimary,
    Label : '{i18n>IsPrimary}',
  }
]);

annotate scp.SalesResponsability with @(UI.LineItem #i18nSalesResp : [
  {
    $Type : 'UI.DataField',
    Value : SalesOrgID_Code,
    Label : '{i18n>SalesOrgID}',
  },
  {
    $Type : 'UI.DataField',
    Value : DistributionChanelCode_Code,
    Label : '{i18n>DistributionChanelCode}',
  },
  {
    $Type : 'UI.DataField',
    Value : DivisionCode_Code,
    Label : '{i18n>DivisionCode}',
  },
  {
    $Type : 'UI.DataField',
    Value : MainIndicator,
    Label : '{i18n>MainIndicator}',
  },
]);

annotate scp.Territories with @(UI.LineItem #i18nTerritories : [{
  $Type : 'UI.DataField',
  Value : SalesTerritory_Code,
  Label : '{i18n>SalesTerritory}',
}]);

annotate scp.BusinessRoles with @(UI.LineItem #i18nBusinessRoles : [{
  $Type : 'UI.DataField',
  Value : Role_Code,
  Label : '{i18n>Role}',
}, ]);

annotate scp.Mapping with @(UI.LineItem #i18nMapping : [
  {
    $Type : 'UI.DataField',
    Value : RemoteObjectID,
    Label : '{i18n>RemoteObjectID}',
  },
  {
    $Type : 'UI.DataField',
    Value : RemoteSystemID_Code,
    Label : '{i18n>RemoteSystemID}',
  },
]);

annotate scp.Mapping with {
  RemoteObjectID @readonly;
};
