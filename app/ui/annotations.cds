using EmployeeCreationService as service from '../../srv/EmployeeCreationSrv';
using from '../scp.layouts';
using from '../../db/schema';

annotate service.EmpCreationForm with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : EmployeeIDExternal,
        },
        {
            $Type : 'UI.DataField',
            Value : BusinessPartnerID,
        },
        {
            $Type : 'UI.DataField',
            Value : Email,
        },
        {
            $Type : 'UI.DataField',
            Value : MobilePhone,
        },
        {
            $Type : 'UI.DataField',
            Value : UserLogin,
        },
        {
            $Type : 'UI.DataField',
            Value : UserLocked,
        }
    ]
);


annotate service.EmpCreationForm with @(
    Common.SideEffects #PriceChanged : {
        SourceProperties : [
            UserLogin
        ],
        TargetEntities : [
            To_Mappings
        ]
    }
);