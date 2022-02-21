const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
    cds.env.features.fetch_csrf = true;
	const { EmpCreationForm, Job, OrgUnit, RoleCode, Roles, EmployeeUserPasswordPolicy, Country, 
        SalesTerritoryCollection, Language, DistributionChanelCode, DivisionCode, SalesOrgs, RemoteSystem} = this.entities;
	const service = await cds.connect.to('employeeanduser');
    const c4c_odata = await cds.connect.to('rolesAPI');

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

    this.on('CREATE', EmpCreationForm,async request => {
        
        var empInst = {};
        var businessRoles = [];
        var salesResp = [];
        var orgAssigment = [];
        empInst.UserID = request.data.UserLogin;
        empInst.EmployeeValidityStartDate = request.data.ValidatyStartDate + "T00:00:00";
        empInst.EmployeeValidityEndDate = request.data.ValidatyEndDate + "T00:00:00";
        empInst.FirstName = request.data.FirstName;
        empInst.LastName = request.data.LastName;
        empInst.LanguageCode = request.data.Language_ID;
        empInst.CountryCode = request.data.Country_ID;
        empInst.MobilePhoneNumber = request.data.MobilePhone;
        empInst.UserValidityStartDate = request.data.ValidatyStartDate + "T00:00:00";
        empInst.UserValidityEndDate = request.data.ValidatyEndDate + "T00:00:00";
        empInst.Email = request.data.Email;
        empInst.UserPasswordPolicyCode = request.data.UserPasswordPolicy_ID;
        if (empInst.UserPasswordPolicy_ID == "") empInst.data.UserPasswordPolicyCode = "S_BUSINESS_USER_WITHOUT_PASSWORD";
        var arr = request.data.To_BusinessRoles
        arr.forEach(element => {
            var newRoleInst = {};
            newRoleInst.UserID = request.data.UserLogin;
            newRoleInst.BusinessRoleID = element.Role_CROOT_ID_CONTENT;
            businessRoles.push(newRoleInst);
        })
        arr = request.data.To_OrgUnits
        arr.forEach(element => {
            var newOrgInst = {};
            newOrgInst.RoleCode = element.RoleCode_Code;
            newOrgInst.OrgUnitID = element.UnitID_Code;           
            newOrgInst.JobID = element.JobID_ID;
            newOrgInst.StartDate = request.data.ValidatyStartDate + "T00:00:00";
            newOrgInst.EndDate = request.data.ValidatyEndDate + "T00:00:00";
            orgAssigment.push(newOrgInst);
        })
        arr = request.data.To_SalesResponsobilities
        arr.forEach(element => {
            var newSalesRespInst = {};
            newSalesRespInst.SalesOrganisationID = element.SalesOrgID_Code;
            newSalesRespInst.DistributionChannelCode = element.DistributionChanelCode_ID;
            newSalesRespInst.DivisionCode = element.DivisionCode_ID;
            newSalesRespInst.MainIndicator = element.MainIndicator;
            newSalesRespInst.SalesTerritoryID = element.SalesTerritory_ID;
            newSalesRespInst.ObjectID = element.ObjectID;
            salesResp.push(newSalesRespInst);
        })
        empInst.EmployeeUserBusinessRoleAssignment = businessRoles;
        empInst.EmployeeSalesResponsibility = salesResp;
        empInst.EmployeeOrganisationalUnitAssignment = orgAssigment;
        try{
           var executedRes = await service.tx(request).post("/EmployeeCollection",empInst);
           var empID = executedRes.EmployeeID;//'1283302';   
           var buPaID = executedRes.BusinessPartnerID;// '8000004299';
           for (const element of salesResp) {
                var newTerrInst = {};
                newTerrInst.TerritoryId = element.SalesTerritoryID;
                newTerrInst.EmployeeID = empID;
                newTerrInst.StartDate = request.data.ValidatyStartDate + "T00:00:00";
                newTerrInst.EndDate = request.data.ValidatyEndDate + "T00:00:00";
                var query = "/SalesTerritoryCollection?$filter=Id eq '" + element.SalesTerritoryID + "'&$select=ObjectID";
                var terData = await service.tx(request).get(query);
                var currentObjectID = terData[0].ObjectID;
                var endPoint = "/SalesTerritoryCollection('" + currentObjectID + "')/SalesTerritoryTeam";
                var resTer = await service.tx(request).post(endPoint,newTerrInst);
                var q = 0;
            }
            arr = request.data.To_Mappings;
            await arr.forEach((element, index) => {
                setTimeout (async() => {
                var newMappingInst = {};
                newMappingInst.LocalObjectID = buPaID;
                newMappingInst.RemoteObjectID = element.RemoteObjectID;
                newMappingInst.RemoteIdentifierDefiningSchemeCode = "3";
                newMappingInst.RemoteBusinessSystemID = element.RemoteSystemID_ID;
                var resObjMapping = await service.tx(request).post("/ObjectIdentifierMappingCollection",newMappingInst);
                }, index * 2000);
                
            })
        }catch(e){
            var error = e.innererror.response.body.error.message.value;
            request.reject(e.innererror.response.status, error);
        }    
    })
});