const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
	const { Job, OrgUnit, RoleCode, Roles, EmployeeUserPasswordPolicy, Country, Language, DistributionChanelCode, DivisionCode} = this.entities;
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

    this.on('READ', OrgUnit, request => {
		return service.tx(request).run(request.query);
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
});