const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
    cds.env.features.fetch_csrf = true;
	const { EmpCreationForm, Job, OrgUnit, RoleCode, Roles, EmployeeUserPasswordPolicy, Country, Language, DistributionChanelCode, DivisionCode, SalesOrgs, RemoteSystem} = this.entities;
	const service = await cds.connect.to('employeeanduser');
    const c4c_odata = await cds.connect.to('rolesAPI');

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
		var systemObj = [{ID:"TANGRAM", Description: "TANGRAM"},{ID:"NONSAP", Description: "NONSAP"},
        {ID:"DALI", Description: "DALI"},{ID:"INTERLINK", Description: "INTERLINK"},{ID:"T15",Description:"T15"}]
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
        if(skip != 0 ){
            skip = top
        }
        var query = `/OrganisationalUnitCollection?$expand=OrganisationalUnitNameAndAddress&$format=json&$top=`+top+'&$skip='+skip;
		var executedRes = await service.tx(request).get(query);
        var result = [];
        executedRes.forEach((element) => {
            if(element.MarkAsDeleted == false) {
                var proxyInst = {};
                proxyInst.Code = element.OrganisationalUnitID;
                proxyInst.Description = element.OrganisationalUnitNameAndAddress[0].Name;
                result.push(proxyInst);
            }
        });
        return result;
	});

    this.on('READ', SalesOrgs,async request => {
        var skip = request._query.$skip;
        var top = 2000;
        if(skip != 0 ){
            skip = top
        }
        var query = `/OrganisationalUnitCollection?$expand=OrganisationalUnitFunctions,OrganisationalUnitNameAndAddress&$format=json&$top=`+top+'&$skip='+skip;
		var executedRes = await service.tx(request).get(query);
        var result = [];
        executedRes.forEach((element) => {
            if(element.MarkAsDeleted == false && element.OrganisationalUnitFunctions[0].SalesOrganisationIndicator) {
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

    this.on('READ', Roles,  async request => {
        var skip = request._query.$skip;
        var top = request._query.$top;
        var query = `/RPCCABUSINESS_ROLEQueryResults?$select=CROOT_ID_CONTENT,CDESCRIPTION_NAME&$format=json&$skip=`+skip+`&$top=`+top;
        
        var e = await c4c_odata.tx(request).get(query);       
        return e.d.results;
	});

    this.after('CREATE', EmpCreationForm, async request => {
        var empInst = {};
        var businessRoles = [];
        var salesResp = [];
        var orgAssigment = [];
        empInst.UserID = request.UserLogin;
        empInst.EmployeeValidityStartDate = request.ValidatyStartDate + "T00:00:00";
        empInst.EmployeeValidityEndDate = request.ValidatyEndDate + "T00:00:00";
        empInst.FirstName = request.FirstName;
        empInst.LastName = request.LastName;
        empInst.LanguageCode = request.Language_ID;
        empInst.CountryCode = request.Country_ID;
        empInst.MobilePhoneNumber = request.MobilePhone;
        empInst.UserValidityStartDate = request.ValidatyStartDate + "T00:00:00";
        empInst.UserValidityEndDate = request.ValidatyEndDate + "T00:00:00";
        empInst.Email = request.Email;
        empInst.UserPasswordPolicyCode = request.UserPasswordPolicy_ID;
        if (empInst.UserPasswordPolicy_ID == "") empInst.UserPasswordPolicyCode = "S_BUSINESS_USER_WITHOUT_PASSWORD";
        var arr = request.To_BusinessRoles
        arr.forEach(element => {
            var newRoleInst = {};
            newRoleInst.UserID = request.UserLogin;
            newRoleInst.BusinessRoleID = element.Role_CROOT_ID_CONTENT;
            businessRoles.push(newRoleInst);
        })
        arr = request.To_OrgUnits
        arr.forEach(element => {
            var newOrgInst = {};
            newOrgInst.RoleCode = element.RoleCode_Code;
            newOrgInst.OrgUnitID = element.UnitID_Code;           
            newOrgInst.JobID = element.JobID_ID;
            newOrgInst.StartDate = request.ValidatyStartDate + "T00:00:00";
            newOrgInst.EndDate = request.ValidatyEndDate + "T00:00:00";
            orgAssigment.push(newOrgInst);
        })
        arr = request.To_SalesResponsobilities
        arr.forEach(element => {
            var newSalesRespInst = {};
            newSalesRespInst.SalesOrganisationID = element.SalesOrgID_Code;
            newSalesRespInst.DistributionChannelCode = element.DistributionChanelCode_ID;
            newSalesRespInst.DivisionCode = element.DivisionCode_ID;
            newSalesRespInst.MainIndicator = element.MainIndicator;
            salesResp.push(newSalesRespInst);
        })
        empInst.EmployeeUserBusinessRoleAssignment = businessRoles;
        empInst.EmployeeSalesResponsibility = salesResp;
        empInst.EmployeeOrganisationalUnitAssignment = orgAssigment;
        var executedRes = await service.tx(request).post("/EmployeeCollection",empInst);
        var buPaID = executedRes.BusinessPartnerID;
        arr = request.To_Mappings;
        var te = [];
        arr.forEach(async element => {
            var newMappingInst = {};
            newMappingInst.LocalObjectID = buPaID;
            newMappingInst.RemoteObjectID = element.RemoteObjectID;
            newMappingInst.RemoteIdentifierDefiningSchemeCode = "3";
            newMappingInst.RemoteBusinessSystemID = element.RemoteSystemID_ID;
            te.push(newMappingInst);
        })
        var qqq = await service.tx(request).post("/ObjectIdentifierMappingCollection",te);
            var e = 0;
    })
});