using EmployeeCreationService as service from '../../srv/EmployeeCreationSrv';
using from '../scp.layouts';
using from '../../db/schema';


annotate service.EmpCreationForm with @(
    UI.Facets : [
        {
            $Type : 'UI.CollectionFacet',
            ID : 'BasicInfo',
            Label : '{i18n>BasicInfo}',
            Facets : [
                {
                    $Type : 'UI.ReferenceFacet',
                    Target : '@UI.FieldGroup#BasicInfo',
                },
            ],
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>OrgUnits}',
            ID : 'i18nOrgUnits',
            Target : 'To_OrgUnits/@UI.LineItem#i18nOrgUnits',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>SalesResp}',
            ID : 'i18nSalesResp',
            Target : 'To_SalesResponsobilities/@UI.LineItem#i18nSalesResp',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>BusinessRoles}',
            ID : 'i18nBusinessRoles',
            Target : 'To_BusinessRoles/@UI.LineItem#i18nBusinessRoles',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Mapping}',
            ID : 'i18nMapping',
            Target : 'To_Mappings/@UI.LineItem#i18nMapping',
        },
        {
            $Type : 'UI.CollectionFacet',
            ID : 'AdminData',
            Label : '{i18n>AdminData}',
            Facets : [
                {
                    $Type : 'UI.ReferenceFacet',
                    Target : '@UI.FieldGroup#CreationDetailsFG',
                    Label : '{i18n>CreationDetails}',
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Target : '@UI.FieldGroup#ModificationDetailsFG',
                    Label : '{i18n>ModificationDetails}',
                },
            ],
        }
    ]
);





annotate service.EmployeeOrgUnitAssigment with @(
    UI.LineItem #i18nOrgUnits : [
        {
            $Type : 'UI.DataField',
            Value : UnitID_Code,
            Label : '{i18n>UnitID}',
        },
        {
            $Type : 'UI.DataField',
            Value : JobID_ID,
            Label : '{i18n>JobID}',
        }
        ]
);
annotate service.SalesResponsability with @(
    UI.LineItem #i18nSalesResp : [
        {
            $Type : 'UI.DataField',
            Value : SalesOrgID_Code,
            Label : '{i18n>SalesOrgID}',
        },{
            $Type : 'UI.DataField',
            Value : SalesTerritory_ID,
            Label : '{i18n>SalesTerritory}',
        },{
            $Type : 'UI.DataField',
            Value : DistributionChanelCode_ID,
            Label : '{i18n>DistributionChanelCode}',
        },{
            $Type : 'UI.DataField',
            Value : DivisionCode_ID,
            Label : '{i18n>DivisionCode}',
        },{
            $Type : 'UI.DataField',
            Value : MainIndicator,
            Label : '{i18n>MainIndicator}',
        },]
);
annotate service.BusinessRoles with @(
    UI.LineItem #i18nBusinessRoles : [
        {
            $Type : 'UI.DataField',
            Value : Role_CROOT_ID_CONTENT,
            Label : '{i18n>Role}',
        },]
);

annotate service.Mapping with @(
    UI.LineItem #i18nMapping : [
        {
            $Type : 'UI.DataField',
            Value : RemoteObjectID,
            Label : '{i18n>RemoteObjectID}',
        },
        {
            $Type : 'UI.DataField',
            Value : RemoteSystemID_ID,
            Label : '{i18n>RemoteSystemID}',
        },]
);
annotate service.EmpCreationForm with @(
    UI.HeaderInfo : {
        $Type : 'UI.HeaderInfoType',
        TypeName : '{i18n>EmployeeForm}',
        TypeNamePlural : '{i18n>EmployeeForms}',
        Title : {
            $Type : 'UI.DataField',
            Value : '{i18n>EmployeeForm}',
        },
        TypeImageUrl : 'sap-icon://employee'
    }
);
