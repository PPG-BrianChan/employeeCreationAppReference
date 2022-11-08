const cds = require('@sap/cds');
const jwt_decode = require('jwt-decode');
const CircularJSON = require('circular-json');
const { executeHttpRequest, getDestination } = require('@sap-cloud-sdk/core');
const { ManageAPICalls } = require('./libs/manageAPICalls');
const { RemoteSystemDataMapping } = require('./libs/RemoteSystemDataMapping');
const destinationDataLake = {
    destinationName: 'DataLakeDestination'
};

module.exports = cds.service.impl(async function () {
    cds.env.features.fetch_csrf = true;

    let service = null;
    let c4c_odata = null;

    let businessUnit = null;
    const tenant = JSON.parse(process.env.VCAP_APPLICATION).organization_name;
   //const tenant = 'ClientLink-QA_org';

    const {
        EmpCreationForm,
        Job,
        OrgUnit,
        RoleCode,
        Roles,
        EmployeeUserPasswordPolicy,
        Country,
        Mapping,
        BusinessRoles,
        SalesResponsability,
        EmployeeOrgUnitAssigment,
        SalesTerritoryCollection,
        Language,
        DistributionChanelCode,
        DivisionCode,
        SalesOrgs,
        RemoteSystem,
        EmployeeIdentifier,
        Region,
        Subregion,
        Territories
    } = this.entities;

    this.after('READ', EmpCreationForm, each => {
        if (each.EmployeeIDExternal != null) {
            if (each.UserLocked) {
                each.unblockBtnEnabled = true;
                each.blockBtnEnabled = false;
            } else {
                each.unblockBtnEnabled = false;
                each.blockBtnEnabled = true;
            }
        } else {
            each.unblockBtnEnabled = false;
            each.blockBtnEnabled = false;
        }
    });

    const _calculateButtonAvailability = any => {
        if (any.EmployeeIDExternal != null && any.IsActiveEntity) {
            if (any.UserLocked) {
                any.unblockBtnEnabled = true;
                any.blockBtnEnabled = false;
            } else {
                any.unblockBtnEnabled = false;
                any.blockBtnEnabled = true;
            }
        } else {
            any.unblockBtnEnabled = false;
            any.blockBtnEnabled = false;
        }
    };

    const _calculateButtonAvailability2 = any => {
        if (any.UserLocked) {
            any.unblockBtnEnabled = true;
            any.blockBtnEnabled = false;
        } else {
            any.unblockBtnEnabled = false;
            any.blockBtnEnabled = true;
        }
    };

    this.after('each', 'EmpCreationForm', _calculateButtonAvailability);
    this.after('EDIT', 'EmpCreationForm', _calculateButtonAvailability);
    this.after('SAVE', 'EmpCreationForm', _calculateButtonAvailability2);

    this.before('SAVE', 'EmpCreationForm', async request => {
        debugger;
    })

    this.on('READ', SalesTerritoryCollection, async request => {

        const data = await _getData(request, 'SalesTerritoryCollection')
        return data;
    });

    this.on('READ', EmployeeUserPasswordPolicy, async request => {
        
        const data = await _getData(request, 'EmployeeUserPasswordPolicy')
        console.log("CHECK" + JSON.stringify(data))
        return data;
    });

    this.on('READ', Country, async request => {

        const data = await _getData(request, 'Country')
        return data;
    });

    this.on('READ', Language, async request => {
        
        const data = await _getData(request, 'Language')
        return data;
    });
    
    this.on('READ', RemoteSystem, async request => {

       // url: `RemoteSystem?$filter=BusinessUnit eq 'ac' and Tenant eq 'ClientLink-Dev_org'`
        const data = await _getData(request, 'RemoteSystem')
        return data;
    });

    this.on('READ', Job, async request => {
        
        const data = await _getData(request, 'Job')
        return data;
    });

    this.on('READ', RoleCode, request => service.tx(request).run(request.query));

    this.on('READ', OrgUnit, async request => {

        const data = await _getData(request, 'OrgUnit')
        return data;
    });

    this.on('READ', SalesOrgs, async request => {
     
        const data = await _getData(request, 'SalesOrgs')
        return data;
    });

    this.on('READ', DistributionChanelCode, async request => {

        const data = await _getData(request, 'DistributionChanelCode')
        return data;
    });

    this.on('READ', DivisionCode, async request => {

        const data = await _getData(request, 'DivisionCode')
        return data;
    });

    this.on('READ', Roles, async request => {

        const data = await _getData(request, 'Roles')
        return data;
    });

    this.on('READ', EmployeeIdentifier, async request => {

        const data = await _getData(request, 'EmployeeIdentifier')
        return data;
    });

    this.on('READ', Region, async request => {
        
        const data = await _getData(request, 'Region')
        return data;
    });

    this.on('READ', Subregion, async request => {

        const data = await _getData(request, 'Subregion')
        return data;
    });

    async function _getData(request, collectionName) {
       // var t = await getDestination('DataLakeDestination')
        let search = request._query.$search;    
        let system = request.headers.system;
        //console.log(search)
        let path = "";
        if (search != undefined) {
            path = `&$search=${search}`
        }

        let createRequestParameters = {
            method: 'get',
            url: `/${collectionName}?$filter=Source eq '${system}'${path}`
        };

        if(collectionName == 'RemoteSystem'){
            createRequestParameters.url = `RemoteSystem?$filter=BusinessUnit eq '${system}' and Tenant eq '${tenant}'`
        }

        const executedData = await executeHttpRequest(destinationDataLake, createRequestParameters);
        console.log(JSON.stringify(executedData.data.value))
        return executedData.data.value;
    }

    this.on('blockUser', EmpCreationForm, async request => {
        await ManageAPICalls.lockUser(request, EmpCreationForm, service);
    });

    this.on('unblockUser', EmpCreationForm, async request => {
        await ManageAPICalls.unlockUser(request, EmpCreationForm, service);
    });

    this.on('lockUsers', async request => {
        console.log("LOCKUSER" + CircularJSON.stringify(request))
        try{
            let idList = request.data.idsList;
            let idArray;
            let user = 'User';
            if(idList.indexOf(",") != -1){
                let idListWithoutComma = idList.slice(0,-1)
                idArray = idListWithoutComma.split(",")
                let user = 'Users';
            }else{
                idArray = idList.split(",")
            }

            for (let element of idArray){
                console.log("el"+element)
                const creationForm = await SELECT.one.from(EmpCreationForm).where({ ID : element});
                console.log("EXECUTED"+JSON.stringify(creationForm))

                const currentObjectID = creationForm.EmployeeUUID;
                const system = creationForm.System;
                const dest = ManageAPICalls._getDestination(system);
                const endPoint = `/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('${currentObjectID}')`;
                console.log("endPoint"+ endPoint)       

                const createRequestParameters = {
                    method: 'patch',
                    url: endPoint,
                    data: {
                        "UserLockedIndicator": true
                    },
                    headers: {
                        'content-type': 'application/json'
                    }
                }
                console.log("createRequestParameters"+ JSON.stringify(createRequestParameters))
                console.log("dest"+ dest)
                const executedData = await executeHttpRequest({destinationName: dest}, createRequestParameters, {
                    fetchCsrfToken: true
                });
                
                console.log("executedData" + CircularJSON.stringify(executedData))
                //await request.info('User locked');
                await UPDATE(EmpCreationForm).where({ ID : element }).with({ UserLocked: true });               
            }
            return {
                Code: "200",
                Message: `${user} locked`
            };
        }catch(error){
            console.log("ERROR_TEXT"+CircularJSON.stringify(error))
            let errorText;
            let errorCode;
            if(error != undefined && error.innererror != undefined && error.innererror.response != undefined){
                errorText = text + error.innererror.response.body.error.message.value;
                errorCode = error.innererror.response.status;
            }
            if(errorText && errorCode){
             /*   return {
                    Code: errorCode,
                    Message: errorText
                };*/
                request.reject(errorCode, errorText);
            }
           /* return {
                Code: "500",
                Message: "Error via locking users"
            };*/
            request.reject(500, "Error via unlocking users");
        }

        //await ManageAPICalls.lockUser(request, idArray, EmpCreationForm);
    });

    this.on('unlockUsers', async request => {
        console.log("UNLOCKUSER" + CircularJSON.stringify(request))
        try{
            let idList = request.data.idsList;
            let idArray;
            let user = 'User';
            if(idList.indexOf(",") != -1){
                let idListWithoutComma = idList.slice(0,-1)
                idArray = idListWithoutComma.split(",")
                user = 'Users';
            }else{
                idArray = idList.split(",")
            }
            
            for (let element of idArray){
                console.log("el"+element)
                const creationForm = await SELECT.one.from(EmpCreationForm).where({ ID : element});
                console.log("EXECUTED"+JSON.stringify(creationForm))

                const currentObjectID = creationForm.EmployeeUUID;
                const system = creationForm.System;
                const dest = ManageAPICalls._getDestination(system);
                const endPoint = `/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('${currentObjectID}')`;
                console.log("endPoint"+ endPoint)       

                const createRequestParameters = {
                    method: 'patch',
                    url: endPoint,
                    data: {
                        "UserLockedIndicator": false
                    },
                    headers: {
                        'content-type': 'application/json'
                    }
                }
                console.log("createRequestParameters"+ JSON.stringify(createRequestParameters))
                console.log("dest"+ dest)
                const executedData = await executeHttpRequest({destinationName: dest}, createRequestParameters, {
                    fetchCsrfToken: true
                });
                
                console.log("executedData" + CircularJSON.stringify(executedData))
                //await request.info('User locked');
                await UPDATE(EmpCreationForm).where({ ID : element }).with({ UserLocked: false });               
            }
            return {
                Code: "200",
                Message: `${user} unlocked`
            };
        }catch(error){
            console.log("ERROR_TEXT"+CircularJSON.stringify(error));
            let errorText;
            let errorCode;
            if(error != undefined && error.innererror != undefined && error.innererror.response != undefined){
                errorText = text + error.innererror.response.body.error.message.value;
                errorCode = error.innererror.response.status;
            }
            if(errorText && errorCode){
               /* return {
                    Code: errorCode,
                    Message: errorText
                };*/
                request.reject(errorCode, errorText);
            }
           /* return {
                Code: "500",
                Message: "Error via unlocking users"
            };*/
            request.reject(500, "Error via unlocking users");
        }
        //await ManageAPICalls.unlockUser(request, EmpCreationForm, service);
    });

    this.before('NEW', EmpCreationForm, async request => {
        const token = request.headers.authorization;

        let decode = null;

        try {
            decode = jwt_decode(token);
        } catch (error) {
            decode = null;
        }
        request.data.IsSystemAC = request.headers.system === 'ac'; 
        request.data.Email = decode ? decode.email : 'unknown';
        request.data.FirstName = decode ? decode.given_name : 'unknown';
        request.data.LastName = decode ? decode.family_name : 'unknown';

        if (request.user.is('Tester')) {
            request.data.HideFirstPanel = false;
            request.data.IsNotTesterUser = true;
        } else {
            request.data.IsNotTesterUser = false;
            request.data.HideFirstPanel = true;
        }
        const today = new Date().toISOString().slice(0, 10);
        request.data.ValidatyStartDate = today;
        request.data.Language_Code = 'EN';
        request.data.UserPasswordPolicy_Code = 'S_BUSINESS_USER_WITHOUT_PASSWORD';
    });

    this.before('SAVE', EmpCreationForm, async request => {
        for (const element of request.data.To_BusinessRoles) {
            if (element.Role_Code == null) {
                request.reject(400, 'Business Role is mandatory.');
            }
        }

        if (request.headers.system !== 'ac' && !request.data.EmployeeIdentifier_Code) {
            request.reject(400, 'Employee Identifier is mandatory for non-AC systems');
        }

        if (request.data.To_OrgUnits.length == 0) {
            request.reject(400, 'Organizational Units Assignment must have at least one record.');
        }

        let numberOfPrimary = 0;
        for (const element of request.data.To_OrgUnits) {
            if (element.UnitID_Code == null) {
                request.reject(400, 'Unit ID is mandatory.');
            }
            if (element.JobID_Code == null) {
                request.reject(400, 'Job ID is mandatory.');
            }
            if (element.IsPrimary) {
                numberOfPrimary += 1;
            }
        }

        if (numberOfPrimary > 1) {
            request.reject(400, 'Only one org unit assignment must be primary.');
        }

        for (const element of request.data.To_SalesResponsobilities) {
            if (element.SalesOrgID_Code == null) {
                request.reject(400, 'Sales Organisation ID is mandatory.');
            }
        }
    });

    this.after('CREATE', EmpCreationForm, async (data, request) => {
        await ManageAPICalls.createEmployee(
            request,
            service,
            EmpCreationForm,
            BusinessRoles,
            SalesResponsability,
            EmployeeOrgUnitAssigment,
            Territories,
            Mapping
        );
    });

    this.before('SAVE', EmpCreationForm, async request => {
        await ManageAPICalls.updateEmployee(
            request,
            service,
            EmpCreationForm,
            BusinessRoles,
            SalesResponsability,
            EmployeeOrgUnitAssigment,
            Territories,
            Mapping
        );
    });

    this.before('PATCH', BusinessRoles, async request => {
        request.data.IsUpdate = true;
    });

    this.before('PATCH', SalesResponsability, async request => {
        request.data.IsUpdate = true;
    });

    this.before('PATCH', Territories, async request => {
        request.data.IsUpdate = true;
    });

    this.before('PATCH', EmployeeOrgUnitAssigment, async request => {
        request.data.IsUpdate = true;
    });

    this.before('NEW', Mapping, async req => {
        const tx = cds.tx();
        const selectEmployeeCreationFormDraftQuery = SELECT.one.from(EmpCreationForm.drafts).where({
            ID: req.data.To_CreationForm_ID
        });
        const employeeFormDraft = await tx.run(selectEmployeeCreationFormDraftQuery);

        req.data.RemoteObjectID = employeeFormDraft.UserLogin;
    });

    this.before('NEW', SalesResponsability, async req => {
        req.data.DistributionChanelCode_Code = '01';
        req.data.DivisionCode_Code = 'TR';
    });

    this.before('PATCH', Mapping, async request => {
        request.data.IsUpdate = true;
    });

    this.before('PATCH', EmpCreationForm, async req => {
        req.data.refreshCodeList = false;

        if ('System' in req.data && req.data.System) {
            _setSystem(req.data.System);
            req.data.IsSystemAC = req.data.System === 'ac';
        }

        if ('UserLogin' in req.data) {
            
            const tx = cds.tx();

            const selectMappingsQuery = SELECT.from(Mapping.drafts).where({
                To_CreationForm_ID: req.data.ID
            });
            const mappings = await tx.run(selectMappingsQuery);

            if (mappings.length > 0) {
                const updateRemoteObjectIDQuery = UPDATE(Mapping.drafts)
                    .set({
                        RemoteObjectID: req.data.UserLogin
                    })
                    .where({
                        To_CreationForm_ID: req.data.ID
                    });

                try {
                    await tx.run(updateRemoteObjectIDQuery);
                    await tx.commit();
                } catch (error) {
                    await tx.rollback(error);
                }
            }
        }
    });

    async function _setSystem(system) {
        let destinationName = '';
        switch (system) {
            case 'ac':
                service = await cds.connect.to('c4c_user_ac');
                c4c_odata = await cds.connect.to('c4c_odata_ac');
                destinationName = 'c4c_user_ac';
                break;
            case 'auto':
                service = await cds.connect.to('c4c_user_auto');
                c4c_odata = await cds.connect.to('c4c_odata_auto');
                destinationName = 'c4c_user_auto';
                break;
            case 'aerospace':
                service = await cds.connect.to('c4c_user_aerospace');
                c4c_odata = await cds.connect.to('c4c_odata_aerospace');
                destinationName = 'c4c_user_aerospace';
                break;
            default:
                service = await cds.connect.to('c4c_user_ac');
                c4c_odata = await cds.connect.to('c4c_odata_ac');
                destinationName = 'c4c_user_ac';
                break;
        }
        return destinationName;
    }
});
