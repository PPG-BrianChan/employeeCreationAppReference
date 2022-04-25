const cds = require('@sap/cds');
const jwt_decode = require('jwt-decode');
const { ManageAPICalls } = require('./libs/manageAPICalls');

module.exports = cds.service.impl(async function () {
  cds.env.features.fetch_csrf = true;
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
    Territories
  } = this.entities;
  const service = await cds.connect.to('employeeanduser');
  const c4c_odata = await cds.connect.to('rolesAPI');

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

  this.on('READ', SalesTerritoryCollection, async request => {
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = await service.tx(request).run(request.query);
      const result = res.filter(element => element.ID.startsWith(search));
      return result;
    }
    return service.tx(request).run(request.query);
  });

  this.on('READ', EmployeeUserPasswordPolicy, async request => {
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = await service.tx(request).run(request.query);
      const result = res.filter(element => element.ID.startsWith(search));
      return result;
    }
    return service.tx(request).run(request.query);
  });

  this.on('READ', Country, async request => {
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = await service.tx(request).run(request.query);
      const result = res.filter(element => element.ID.startsWith(search));
      return result;
    }
    return service.tx(request).run(request.query);
  });

  this.on('READ', Language, async request => {
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = await service.tx(request).run(request.query);
      const result = res.filter(element => element.ID.startsWith(search));
      return result;
    }
    return service.tx(request).run(request.query);
  });

  this.on('READ', RemoteSystem, async request => {
    const systemObj = [
      { ID: 'TANGRAM', Description: 'TANGRAM' },
      { ID: 'NONSAP', Description: 'NONSAP' },
      { ID: 'DALI', Description: 'DALI' },
      { ID: 'INTERLINK', Description: 'INTERLINK' },
      { ID: 'Q15', Description: 'Q15' },
      { ID: 'VANTAGEPOINT', Description: 'VANTAGEPOINT' },
      { ID: 'SAP S/4 UAT', Description: 'VSAP S/4 UAT' }
    ];
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = systemObj;
      const result = res.filter(element => element.ID.startsWith(search));
      return result;
    }
    return systemObj;
  });

  this.on('READ', Job, async request => {
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = await service.tx(request).run(request.query);
      const result = res.filter(element => element.ID.startsWith(search));
      return result;
    }
    return service.tx(request).run(request.query);
  });

  this.on('READ', RoleCode, request => service.tx(request).run(request.query));

  this.on('READ', OrgUnit, async request => {
    let skip = request._query.$skip;
    const top = 2000;
    if (skip != 0) {
      skip = top;
    }
    const query = `/OrganisationalUnitCollection?$expand=OrganisationalUnitNameAndAddress&$format=json&$top=${top}&$skip=${skip}`;
    const executedRes = await service.tx(request).get(query);
    const orgUnits = [];
    executedRes.forEach(element => {
      if (element.MarkAsDeleted == false) {
        const proxyInst = {};
        proxyInst.Code = element.OrganisationalUnitID;
        proxyInst.Description = element.OrganisationalUnitNameAndAddress[0].Name;
        orgUnits.push(proxyInst);
      }
    });
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = orgUnits;
      const result = res.filter(element => element.Code.startsWith(search));
      return result;
    }
    return orgUnits;
  });

  this.on('READ', SalesOrgs, async request => {
    let skip = request._query.$skip;
    const top = 2000;
    if (skip != 0) {
      skip = top;
    }
    const query = `/OrganisationalUnitCollection?$expand=OrganisationalUnitFunctions,OrganisationalUnitNameAndAddress&$format=json&$top=${top}&$skip=${skip}`;
    const executedRes = await service.tx(request).get(query);
    const orgUnits = [];
    executedRes.forEach(element => {
      if (element.MarkAsDeleted == false && element.OrganisationalUnitFunctions[0].SalesOrganisationIndicator) {
        const proxyInst = {};
        proxyInst.Code = element.OrganisationalUnitID;
        proxyInst.Description = element.OrganisationalUnitNameAndAddress[0].Name;
        proxyInst.SalesOrgIndicator = element.OrganisationalUnitFunctions[0].SalesOrganisationIndicator;
        orgUnits.push(proxyInst);
      }
    });
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = orgUnits;
      const result = res.filter(element => element.Code.startsWith(search));
      return result;
    }
    return orgUnits;
  });

  this.on('READ', DistributionChanelCode, async request => {
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = await service.tx(request).run(request.query);
      const result = res.filter(element => element.ID.startsWith(search));
      return result;
    }
    return service.tx(request).run(request.query);
  });

  this.on('READ', DivisionCode, async request => {
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = await service.tx(request).run(request.query);
      const result = res.filter(element => element.ID.startsWith(search));
      return result;
    }
    return service.tx(request).run(request.query);
  });

  this.on('READ', Roles, async request => {
    const skip = request._query.$skip;
    const top = request._query.$top;
    const query = `/RPCCABUSINESS_ROLEQueryResults?$select=CROOT_ID_CONTENT,CDESCRIPTION_NAME&$format=json&$skip=${skip}&$top=${top}`;

    const e = await c4c_odata.tx(request).get(query);
    let search = request._query.$search;
    if (search != undefined) {
      search = search.slice(1, search.length - 1);
      const res = e.d.results;
      const result = res.filter(element => element.CROOT_ID_CONTENT.startsWith(search));
      return result;
    }
    return e.d.results;
  });

  this.on('blockUser', EmpCreationForm, async request => {
    await ManageAPICalls.lockUser(request, EmpCreationForm, service);
  });

  this.on('unblockUser', EmpCreationForm, async request => {
    await ManageAPICalls.unlockUser(request, EmpCreationForm, service);
  });

  this.before('NEW', EmpCreationForm, async request => {
    const token = request.headers.authorization;
    const decode = jwt_decode(token);
    request.data.Email = decode.email;
    request.data.FirstName = decode.given_name;
    request.data.LastName = decode.family_name;
    if (request.user.is('Tester')) {
      request.data.HideFirstPanel = false;
      request.data.IsNotTesterUser = true;
    } else {
      request.data.IsNotTesterUser = false;
      request.data.HideFirstPanel = true;
    }
  });

  this.before('SAVE', EmpCreationForm, async request => {
    for (const element of request.data.To_BusinessRoles) {
      if (element.Role_CROOT_ID_CONTENT == null) {
        request.reject(400, 'Business Role is mandatory.');
      }
    }

    let numberOfPrimary = 0;
    for (const element of request.data.To_OrgUnits) {
      if (element.UnitID_Code == null) {
        request.reject(400, 'Unit ID is mandatory.');
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
    const selectEmployeeCreationFormDraftQuery = SELECT.one
      .from(EmpCreationForm.drafts)
      .where({ 
        ID: req.data.To_CreationForm_ID 
      });
    const employeeFormDraft = await tx.run(selectEmployeeCreationFormDraftQuery);

    req.data.RemoteObjectID = employeeFormDraft.UserLogin;
  });

  this.before('PATCH', Mapping, async request => {
    request.data.IsUpdate = true;
  });

  this.before('PATCH', EmpCreationForm, async (req, next) => {
    if ('UserPasswordPolicy_ID' in req.data) {
      const { UserPasswordPolicy_ID } = req.data;
      let identifierBoolean = true;
      const password = '';
      if (UserPasswordPolicy_ID === 'S_BUSINESS_USER') {
        identifierBoolean = false;
      } else {
        identifierBoolean = true;
      }
      req.data.identifierBooleanPassword = identifierBoolean;
      req.data.UserPassword = password;
    }

    const tx = cds.tx();
    
    const selectMappingsQuery = SELECT
      .from(Mapping.drafts)
      .where({
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
  });
});
