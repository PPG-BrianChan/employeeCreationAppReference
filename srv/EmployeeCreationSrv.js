const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
	const { EmpCreationForm, Job, OrgUnit, RoleCode, Roles, EmployeeUserPasswordPolicy, Country, Language, DistributionChanelCode, DivisionCode, SalesOrgs} = this.entities;
	const service = await cds.connect.to('employeeanduser');
    const c4c_odata = await cds.connect.to('rolesAPI');

    this.on('READ', EmployeeUserPasswordPolicy, request => {
		return service.tx(request).run(request.query);
	});
    
    this.on('READ', Country, request => {
		return service.tx(request).run(request.query);
	});

    this.on('READ', Language, request => {
		return service.tx(request).run(request.query);
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

    this.after('CREATE', EmpCreationForm, request => {
        var empInst = {};
        var businessRoles = {};
        empInst.UserId = request.UserLogin;
        empInst.EmployeeValidityStartDate = request.ValidatyStartDate + "T00:00:00";
        empInst.EmployeeValidityEndDate = request.ValidatyEndDate + "T00:00:00";
        empInst.FirstName = request.FirstName;
        empInst.LastName = request.LastName;
        empInst.LanguageCode = request.Language_ID;
        empInst.CountryCode = request.Country_ID;
        empInst.MobilePhoneNumber = request.MobilePhone;
        empInst.UserValidityStartDate = request.ValidatyStartDate;
        empInst.UserValidityEndDate = request.ValidatyEndDate;
        empInst.Email = request.Email;
        empInst.UserPasswordPolicyCode = request.UserPasswordPolicy_ID;
        if (empInst.UserPasswordPolicy_ID == "") empInst.UserPasswordPolicyCode = "S_BUSINESS_USER_WITHOUT_PASSWORD";
        var arr = request.To_BusinessRoles
        arr.forEach(element => {
            var newRoleInst = {};
            newRoleInst.UserId = request.UserLogin;
            newRoleInst.BusinessRoleId = element.Role_CROOT_ID_CONTENT;
            businessRoles.push(newRoleInst);
        })
        empInst.businessRoles = businessRoles;
var t = 0;
    })
});