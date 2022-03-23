const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    cds.env.features.fetch_csrf = true;
    const { EmpCreationForm, Job, OrgUnit, RoleCode, Roles, EmployeeUserPasswordPolicy, Country,
        SalesTerritoryCollection, Language, DistributionChanelCode, DivisionCode, SalesOrgs, RemoteSystem } = this.entities;
    const service = await cds.connect.to('employeeanduser');
    const c4c_odata = await cds.connect.to('rolesAPI');

    this.after('READ', EmpCreationForm, (each) => {
        if (each.EmployeeIDExternal != null) {
            each.unblockBtnEnabled = true;
            each.blockBtnEnabled = true;
        }
    });

    this.on('READ', SalesTerritoryCollection, request => {
        return service.tx(request).run(request.query);
    });

    this.on('READ', EmployeeUserPasswordPolicy, request => {
        return service.tx(request).run(request.query);
    });

    this.on('READ', Country, request => {
        return service.tx(request).run(request.query);
    });

    this.on('READ', Language, async request => {
        var res = await service.tx(request).run(request.query);
        return res;
    });

    this.on('READ', RemoteSystem, async request => {
        var systemObj = [{ ID: "TANGRAM", Description: "TANGRAM" }, { ID: "NONSAP", Description: "NONSAP" },
        { ID: "DALI", Description: "DALI" }, { ID: "INTERLINK", Description: "INTERLINK" }, { ID: "T15", Description: "T15" }]
        return systemObj;
    });

    this.on('READ', Job, request => {
        return service.tx(request).run(request.query);
    });

    this.on('READ', RoleCode, request => {
        return service.tx(request).run(request.query);
    });

    this.on('READ', OrgUnit, async request => {
        var skip = request._query.$skip;
        var top = 2000;
        if (skip != 0) {
            skip = top
        }
        var query = `/OrganisationalUnitCollection?$expand=OrganisationalUnitNameAndAddress&$format=json&$top=` + top + '&$skip=' + skip;
        var executedRes = await service.tx(request).get(query);
        var result = [];
        executedRes.forEach((element) => {
            if (element.MarkAsDeleted == false) {
                var proxyInst = {};
                proxyInst.Code = element.OrganisationalUnitID;
                proxyInst.Description = element.OrganisationalUnitNameAndAddress[0].Name;
                result.push(proxyInst);
            }
        });
        return result;
    });

    this.on('READ', SalesOrgs, async request => {
        var skip = request._query.$skip;
        var top = 2000;
        if (skip != 0) {
            skip = top
        }
        var query = `/OrganisationalUnitCollection?$expand=OrganisationalUnitFunctions,OrganisationalUnitNameAndAddress&$format=json&$top=` + top + '&$skip=' + skip;
        var executedRes = await service.tx(request).get(query);
        var result = [];
        executedRes.forEach((element) => {
            if (element.MarkAsDeleted == false && element.OrganisationalUnitFunctions[0].SalesOrganisationIndicator) {
                var proxyInst = {};
                proxyInst.Code = element.OrganisationalUnitID;
                proxyInst.Description = element.OrganisationalUnitNameAndAddress[0].Name;
                proxyInst.SalesOrgIndicator = element.OrganisationalUnitFunctions[0].SalesOrganisationIndicator;
                result.push(proxyInst);
            }
        });
        return result;
    });

    this.on('READ', DistributionChanelCode, request => {
        return service.tx(request).run(request.query);
    });

    this.on('READ', DivisionCode, request => {
        return service.tx(request).run(request.query);
    });

    this.on('READ', Roles, async request => {
        var skip = request._query.$skip;
        var top = request._query.$top;
        var query = `/RPCCABUSINESS_ROLEQueryResults?$select=CROOT_ID_CONTENT,CDESCRIPTION_NAME&$format=json&$skip=` + skip + `&$top=` + top;

        var e = await c4c_odata.tx(request).get(query);
        return e.d.results;
    });

    this.on('blockUser', EmpCreationForm, async (request) => {
        try {
            var ID = request.params[0].ID;
            let creationForm = await SELECT.one.from(EmpCreationForm).where({ ID: ID });
            var c4cID = creationForm.EmployeeIDExternal;
            var data = {
                "UserLockedIndicator": true
            }
            var query = "/EmployeeCollection?$filter=EmployeeID eq '" + c4cID + "'&$select=ObjectID";
            var empData = await service.tx(request).get(query);
            var currentObjectID = empData[0].ObjectID;
            var endPoint = "/EmployeeCollection('" + currentObjectID + "')";
            var resTer = await service.tx(request).patch(endPoint, data);
            request.info("User locked");
        } catch (e) {
            var error = "User locking error: " + e.innererror.response.body.error.message.value;
            request.reject(400, error);
        }
    })

    this.on('unblockUser', EmpCreationForm, async (request) => {
        try {
            var ID = request.params[0].ID;
            let creationForm = await SELECT.one.from(EmpCreationForm).where({ ID: ID });
            var c4cID = creationForm.EmployeeIDExternal;
            var data = {
                "UserLockedIndicator": false
            }
            var query = "/EmployeeCollection?$filter=EmployeeID eq '" + c4cID + "'&$select=ObjectID";
            var empData = await service.tx(request).get(query);
            var currentObjectID = empData[0].ObjectID;
            var endPoint = "/EmployeeCollection('" + currentObjectID + "')";
            var resTer = await service.tx(request).patch(endPoint, data);
            request.info("User unlocked");
        } catch (e) {
            var error = "User unlocking error: " + e.innererror.response.body.error.message.value;
            request.reject(400, error);
        }
    })

    this.before('CREATE', EmpCreationForm, async request => {

        for (const element of request.data.To_BusinessRoles) {
            if (element.Role_CROOT_ID_CONTENT == null) {
                request.reject(400, "Business Role is mandatory.");
            }
        }

        for (const element of request.data.To_OrgUnits) {
            if (element.UnitID_Code == null) {
                request.reject(400, "Unit ID is mandatory.");
            }
        }

        for (const element of request.data.To_SalesResponsobilities) {
            if (element.SalesOrgID_Code == null) {
                request.reject(400, "Sales Organisation ID is mandatory.");
            }
        }
    })

    this.after('CREATE', EmpCreationForm, async (data, request) => {

        var END_DATE = "9999-12-31";
        var businessRoles = [];
        var salesResp = [];
        var orgAssigment = [];
        var territories = [];
        var empInst = {
            "UserID": request.data.UserLogin,
            "EmployeeValidityStartDate": request.data.ValidatyStartDate + "T00:00:00",
            "EmployeeValidityEndDate": END_DATE + "T00:00:00",
            "FirstName": request.data.FirstName,
            "LastName": request.data.LastName,
            "LanguageCode": request.data.Language_ID,
            "CountryCode": request.data.Country_ID,
            "MobilePhoneNumber": request.data.MobilePhone,
            "UserValidityStartDate": request.data.ValidatyStartDate + "T00:00:00",
            "UserValidityEndDate": END_DATE + "T00:00:00",
            "Email": request.data.Email,
            "UserPasswordPolicyCode": request.data.UserPasswordPolicy_ID,
            "UserLockedIndicator": false
        };
        if (request.data.UserPasswordPolicy_ID == null) empInst.UserPasswordPolicyCode = "S_BUSINESS_USER_WITHOUT_PASSWORD";
        var arr = request.data.To_BusinessRoles
        for (const element of arr) {
            var newRoleInst = {};
            newRoleInst.UserID = request.data.UserLogin;
            newRoleInst.BusinessRoleID = element.Role_CROOT_ID_CONTENT;
            businessRoles.push(newRoleInst);
        }
        arr = request.data.To_OrgUnits
        for (const element of arr) {
            var newOrgInst = {};
            newOrgInst.RoleCode = "219";
            newOrgInst.OrgUnitID = element.UnitID_Code;
            newOrgInst.JobID = element.JobID_ID;
            newOrgInst.StartDate = request.data.ValidatyStartDate + "T00:00:00";
            newOrgInst.EndDate = END_DATE + "T00:00:00";
            orgAssigment.push(newOrgInst);
        }
        arr = request.data.To_SalesResponsobilities
        for (const element of arr) {
            var newSalesRespInst = {};

            newSalesRespInst.SalesOrganisationID = element.SalesOrgID_Code;
            newSalesRespInst.DistributionChannelCode = element.DistributionChanelCode_ID;
            newSalesRespInst.DivisionCode = element.DivisionCode_ID;
            newSalesRespInst.MainIndicator = element.MainIndicator;
            if (element.SalesTerritory_ID != null) {
                var territoryInst = {};
                territoryInst.SalesTerritoryID = element.SalesTerritory_ID;
                territories.push(territoryInst);
            }
            newSalesRespInst.ObjectID = element.ObjectID;
            salesResp.push(newSalesRespInst);
        }
        empInst.EmployeeUserBusinessRoleAssignment = businessRoles;
        empInst.EmployeeSalesResponsibility = salesResp;
        empInst.EmployeeOrganisationalUnitAssignment = orgAssigment;

        try {

            var executedRes = await service.tx(request).post("/EmployeeCollection", empInst);
        } catch (e) {
            var error = 'Employee creation error: ' + e.innererror.response.body.error.message.value;
            request.reject(400, error);
        }
        try {
            var empID = executedRes.EmployeeID;//'1283302';  //
            var buPaID = executedRes.BusinessPartnerID;//'8000004299';//
            for (const element of territories) {
                var newTerrInst = {};
                newTerrInst.TerritoryId = element.SalesTerritoryID;
                newTerrInst.EmployeeID = empID;
                newTerrInst.StartDate = request.data.ValidatyStartDate + "T00:00:00";
                newTerrInst.EndDate = END_DATE + "T00:00:00";
                newTerrInst.PartyRole = "46";
                var query = "/SalesTerritoryCollection?$filter=Id eq '" + element.SalesTerritoryID + "'&$select=ObjectID";

                var terData = await service.tx(request).get(query);
                var currentObjectID = terData[0].ObjectID;
                var endPoint = "/SalesTerritoryCollection('" + currentObjectID + "')/SalesTerritoryTeam";
                var resTer = await service.tx(request).post(endPoint, newTerrInst);
                var q = 0;
            }
            arr = request.data.To_Mappings;
            for (const element of arr) {
                var newMappingInst = {};
                newMappingInst.LocalObjectID = buPaID;
                newMappingInst.RemoteObjectID = element.RemoteObjectID;
                newMappingInst.RemoteIdentifierDefiningSchemeCode = "3";
                newMappingInst.RemoteBusinessSystemID = element.RemoteSystemID_ID;
                var resObjMapping = await service.tx(request).post("/ObjectIdentifierMappingCollection", newMappingInst);
            }
            let updatedRecord = await UPDATE(EmpCreationForm).where({ ID: request.data.ID }).with({ EmployeeIDExternal: empID, EmployeeIDInternal: request.data.ID })
            request.data.EmployeeIDExternal = empID;
            request.data.EmployeeIDInternal = request.data.ID;
            request.data.blockBtnEnabled = true;
            request.data.unblockBtnEnabled = true;
        } catch (e) {
            var error = "Mapping creation error: " + e.innererror.response.body.error.message.value;
            request.reject(400, error);
        }
    })

    this.before('PATCH', EmpCreationForm, async req => {
        if ('UserPasswordPolicy_ID' in req.data) {
            const { UserPasswordPolicy_ID } = req.data
            var identifierBoolean = true, password = '';
            if (UserPasswordPolicy_ID === 'S_BUSINESS_USER') identifierBoolean = false;
            else identifierBoolean = true;
            req.data.identifierBooleanPassword = identifierBoolean;
            req.data.UserPassword = password;
        }
    })
});