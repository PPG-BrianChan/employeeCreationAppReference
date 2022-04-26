class ManageAPICalls {
  static async lockUser(request, EmpCreationForm, service) {
    try {
      const { ID } = request.params[0];
      const creationForm = await SELECT.one.from(EmpCreationForm).where({ ID });
      const c4cID = creationForm.EmployeeIDExternal;
      const data = {
        UserLockedIndicator: true
      };
      const query = `/EmployeeCollection?$filter=EmployeeID eq '${c4cID}'&$select=ObjectID`;
      const empData = await service.tx(request).get(query);
      const currentObjectID = empData[0].ObjectID;
      const endPoint = `/EmployeeCollection('${currentObjectID}')`;
      await service.tx(request).patch(endPoint, data);
      request.info('User locked');
      await UPDATE(EmpCreationForm).where({ ID }).with({ UserLocked: true });
    } catch (e) {
      const error = `User locking error: ${e.innererror.response.body.error.message.value}`;
      request.reject(400, error);
    }
  };

  static async unlockUser(request, EmpCreationForm, service) {
    try {
      const { ID } = request.params[0];
      const creationForm = await SELECT.one.from(EmpCreationForm).where({ ID });
      const c4cID = creationForm.EmployeeIDExternal;
      const data = {
        UserLockedIndicator: false
      };
      const query = `/EmployeeCollection?$filter=EmployeeID eq '${c4cID}'&$select=ObjectID`;
      const empData = await service.tx(request).get(query);
      const currentObjectID = empData[0].ObjectID;
      const endPoint = `/EmployeeCollection('${currentObjectID}')`;
      const resTer = await service.tx(request).patch(endPoint, data);
      request.info('User unlocked');
      const updatedRecord = await UPDATE(EmpCreationForm).where({ ID }).with({ UserLocked: false });
    } catch (e) {
      const error = `User unlocking error: ${e.innererror.response.body.error.message.value}`;
      request.reject(400, error);
    }
  };

  static async createEmployee(request, service, EmpCreationForm, BusinessRoles, SalesResponsability, EmployeeOrgUnitAssigment, Territories, Mapping) {
    const END_DATE = '9999-12-31';
    const businessRoles = [];
    const salesResp = [];
    const orgAssigment = [];
    const today = new Date().toISOString().slice(0, 10);
    const orgName = JSON.parse(process.env.VCAP_APPLICATION).organization_name;
    if (request.data.ValidatyStartDate == null) {
      request.data.ValidatyStartDate = today;
    }
    const empInst = {
      UserID: request.data.UserLogin,
      EmployeeValidityStartDate: `${request.data.ValidatyStartDate}T00:00:00`,
      EmployeeValidityEndDate: `${END_DATE}T00:00:00`,
      FirstName: request.data.FirstName,
      LastName: request.data.LastName,
      LanguageCode: request.data.Language_ID,
      CountryCode: request.data.Country_ID,
      MobilePhoneNumber: request.data.MobilePhone,
      UserValidityStartDate: `${request.data.ValidatyStartDate}T00:00:00`,
      UserValidityEndDate: `${END_DATE}T00:00:00`,
      Email: request.data.Email,
      UserPasswordPolicyCode: request.data.UserPasswordPolicy_ID,
      UserLockedIndicator: false
    };
    if ( orgName === "ClientLink-Dev_org") {
        empInst.ZSalesRepElig_KUT = request.data.SalesReportingEligible; //update dev specific field
    } else {
        empInst.Z_SalesRepElig_KUT = request.data.SalesReportingEligible;
    }
    if (request.data.UserPasswordPolicy_ID == null) {
      empInst.UserPasswordPolicyCode = 'S_BUSINESS_USER_WITHOUT_PASSWORD';
    }
    let arr = request.data.To_BusinessRoles;
    for (const element of arr) {
      const newRoleInst = {};
      newRoleInst.UserID = request.data.UserLogin;
      newRoleInst.BusinessRoleID = element.Role_CROOT_ID_CONTENT;
      businessRoles.push(newRoleInst);
    }
    arr = request.data.To_OrgUnits;
    for (const element of arr) {
      const newOrgInst = {};
      if (element.IsPrimary) {
        newOrgInst.RoleCode = '219';
      } else {
        newOrgInst.RoleCode = '222';
      }
      newOrgInst.OrgUnitID = element.UnitID_Code;
      newOrgInst.JobID = element.JobID_ID;
      newOrgInst.StartDate = `${request.data.ValidatyStartDate}T00:00:00`;
      newOrgInst.EndDate = `${END_DATE}T00:00:00`;
      orgAssigment.push(newOrgInst);
    }
    arr = request.data.To_SalesResponsobilities;
    for (const element of arr) {
      const newSalesRespInst = {};
      newSalesRespInst.SalesOrganisationID = element.SalesOrgID_Code;
      newSalesRespInst.DistributionChannelCode = element.DistributionChanelCode_ID;
      newSalesRespInst.DivisionCode = element.DivisionCode_ID;
      newSalesRespInst.MainIndicator = element.MainIndicator;
      salesResp.push(newSalesRespInst);
    }

    empInst.EmployeeUserBusinessRoleAssignment = businessRoles;
    empInst.EmployeeSalesResponsibility = salesResp;
    empInst.EmployeeOrganisationalUnitAssignment = orgAssigment;

    try {
      var executedRes = await service.tx(request).post('/EmployeeCollection', empInst);
    } catch (e) {
      var error = `Employee creation error: ${e.innererror.response.body.error.message.value}`;
      request.reject(400, error);
    }
    try {
      const empID = executedRes.EmployeeID; // '1283302';  //
      const businessPartnerID = executedRes.BusinessPartnerID; // '8000004299';//
      const UUID = executedRes.ObjectID;
      const UUIDwithHyphen = executedRes.UUID;

      try {
        var path = `/EmployeeCollection('${UUID}')/EmployeeUserBusinessRoleAssignment`;
        var res = await service.tx(request).get(path);
        for (const element of request.data.To_BusinessRoles) {
          var resEl = res.find(el => el.BusinessRoleID == element.Role_CROOT_ID_CONTENT);
          var { uri } = resEl.$metadata;
          var index = uri.indexOf('(');
          var objID = uri.substr(index);
          const updatedRecord = await UPDATE(BusinessRoles)
            .where({ To_CreationForm_ID: request.data.ID, ID: element.ID })
            .with({ ObjectID: objID, IsUpdate: false });
        }
      } catch (e) {
        var error = `Employee mapping business roles error: ${e.innererror.response.body.error.message.value}`;
        request.info(error);
      }

      try {
        var path = `/EmployeeCollection('${UUID}')/EmployeeSalesResponsibility`;
        var res = await service.tx(request).get(path);
        for (const element of salesResp) {
          var resEl = res.find(
            el =>
              el.SalesOrganisationID == element.SalesOrganisationID &&
              el.DistributionChannelCode == element.DistributionChannelCode &&
              el.DivisionCode == element.DivisionCode &&
              el.MainIndicator == element.MainIndicator
          );
          var { uri } = resEl.$metadata;
          var index = uri.indexOf('(');
          var objID = uri.substr(index);
          const updatedRecord = await UPDATE(SalesResponsability)
            .where({ To_CreationForm_ID: request.data.ID, ID: element.ID })
            .with({ ObjectID: objID, IsUpdate: false });
        }
      } catch (e) {
        var error = `Employee mapping sales responsobilities error: ${e.innererror.response.body.error.message.value}`;
        request.reject(400, error);
      }

      try {
        var path = `/EmployeeCollection('${UUID}')/EmployeeOrganisationalUnitAssignment`;
        var res = await service.tx(request).get(path);
        for (const element of orgAssigment) {
          var resEl = res.find(el => el.OrgUnitID == element.OrgUnitID && el.JobID == element.JobID);
          var { uri } = resEl.$metadata;
          var index = uri.indexOf('(');
          var objID = uri.substr(index);
          const updatedRecord = await UPDATE(EmployeeOrgUnitAssigment)
            .where({ To_CreationForm_ID: request.data.ID, ID: element.ID })
            .with({ ObjectID: objID, IsUpdate: false });
        }
      } catch (e) {
        var error = `Employee mapping org unit assignment error: ${e.innererror.response.body.error.message.value}`;
        request.reject(400, error);
      }

      for (const element of request.data.To_Territories) {
        const newTerrInst = {};
        newTerrInst.TerritoryId = element.SalesTerritory_ID;
        newTerrInst.EmployeeID = empID;
        newTerrInst.StartDate = `${request.data.ValidatyStartDate}T00:00:00`;
        newTerrInst.EndDate = `${END_DATE}T00:00:00`;
        newTerrInst.PartyRole = '46';
        const query = `/SalesTerritoryCollection?$filter=Id eq '${element.SalesTerritory_ID}'&$select=ObjectID`;

        const terData = await service.tx(request).get(query);
        const currentObjectID = terData[0].ObjectID;
        const endPoint = `/SalesTerritoryCollection('${currentObjectID}')/SalesTerritoryTeam`;
        const resTer = await service.tx(request).post(endPoint, newTerrInst);
        var { uri } = resTer.__metadata;
        var index = uri.indexOf('(');
        var objID = uri.substr(index);
        const updatedRecord = await UPDATE(Territories)
          .where({ To_CreationForm_ID: request.data.ID, ID: element.ID })
          .with({ ObjectID: objID, IsUpdate: false, TerritoryObjectID: currentObjectID });
        const q = 0;
      }
      for (const element of request.data.To_Mappings) {
        const newMappingInst = {};
        newMappingInst.LocalObjectID = businessPartnerID;
        newMappingInst.RemoteObjectID = element.RemoteObjectID;
        newMappingInst.RemoteIdentifierDefiningSchemeCode = '3';
        newMappingInst.RemoteBusinessSystemID = element.RemoteSystemID_ID;
        const resObjMapping = await service.tx(request).post('/ObjectIdentifierMappingCollection', newMappingInst);
        var { uri } = resObjMapping.__metadata;
        var index = uri.indexOf('(');
        var objID = uri.substr(index);
        const updatedRecord = await UPDATE(Mapping)
          .where({ To_CreationForm_ID: request.data.ID, ID: element.ID })
          .with({ ObjectID: objID, IsUpdate: false });
      }
      const updatedRecord = await UPDATE(EmpCreationForm).where({ ID: request.data.ID }).with({
        EmployeeIDExternal: empID,
        EmployeeIDInternal: request.data.ID,
        EmployeeUUID: UUID,
        BusinessPartnerID: businessPartnerID,
        EmployeeUUIDWithHyphen: UUIDwithHyphen,
        HideFirstPanel: true,
        IsNotTesterUser: true,
        HideSecondPanel: false,
        UserLocked: false
      });
      request.data.EmployeeIDExternal = empID;
      request.data.EmployeeIDInternal = request.data.ID;
      request.data.blockBtnEnabled = true;
      request.data.unblockBtnEnabled = false;
      request.data.HideFirstPanel = true;
      request.data.IsNotTesterUser = true;
      request.data.HideSecondPanel = false;
      request.data.BusinessPartnerID = businessPartnerID;
      request.data.EmployeeUUIDWithHyphen = UUIDwithHyphen;
      request.data.UserLocked = false;
    } catch (e) {
      var error = `Mapping creation error: ${e.innererror.response.body.error.message.value}`;
      request.reject(400, error);
    }
  };

  static async updateEmployee(request, service, EmpCreationForm, BusinessRoles, SalesResponsability, EmployeeOrgUnitAssigment, Territories, Mapping) {
    const END_DATE = '9999-12-31';
    if (request.data.EmployeeIDExternal != null) {
      request.data.blockBtnEnabled = true;

      // --------------------------------Business Roles  ---------------------
      // ------------------DELETE------------------
      try {
        var path = `/EmployeeCollection('${request.data.EmployeeUUID}')/EmployeeUserBusinessRoleAssignment`;
        var res = await service.tx(request).get(path);
        var arr = request.data.To_BusinessRoles;
        for (const elem of res) {
          var uri_del = elem.$metadata.uri;
          var index_del = uri_del.indexOf('(');
          var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
          if (resEl == undefined) {
            var { uri } = elem.$metadata;
            var index = uri.indexOf('(');
            var new_path = `/EmployeeUserBusinessRoleAssignmentCollection${uri_del.substr(index_del)}`;
            var resofDel = await service.tx(request).delete(new_path);
          }
        }
      } catch (e) {
        var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
        request.reject(400, error);
      }
      for (const element of request.data.To_BusinessRoles) {
        // -------------------------UPDATE--------------------
        if (element.IsUpdate && element.ObjectID != null) {
          try {
            var newRoleInst = {};
            newRoleInst.UserID = request.data.UserLogin.toUpperCase();
            newRoleInst.BusinessRoleID = element.Role_CROOT_ID_CONTENT;
            var path = `/EmployeeUserBusinessRoleAssignmentCollection${element.ObjectID}`;
            var resofDel = await service.tx(request).delete(path);
            var new_path = `/EmployeeCollection('${request.data.EmployeeUUID}')/EmployeeUserBusinessRoleAssignment`;
            var resofPOST = await service.tx(request).post(new_path, newRoleInst);
            var { uri } = resofPOST.__metadata;
            var index = uri.indexOf('(');
            var objID = uri.substr(index);
            element.ObjectID = objID;
          } catch (e) {
            var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
            request.reject(400, error);
          }
        }
        // --------------------------CREATE------------------
        if (element.ObjectID == null) {
          try {
            var newRoleInst = {};
            newRoleInst.UserID = request.data.UserLogin.toUpperCase(); // "QW2";
            newRoleInst.BusinessRoleID = element.Role_CROOT_ID_CONTENT;
            var path = `/EmployeeCollection('${request.data.EmployeeUUID}')/EmployeeUserBusinessRoleAssignment`;
            var resofPOST = await service.tx(request).post(path, newRoleInst);
            var { uri } = resofPOST.__metadata;
            var index = uri.indexOf('(');
            var objID = uri.substr(index);
            element.ObjectID = objID;
          } catch (e) {
            var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
            request.reject(400, error);
          }
        }
        element.IsUpdate = false;
      }

      // --------------------------------Org Unit Assignment ---------------------
      // ------------------DELETE------------------
      try {
        var path = `/EmployeeCollection('${request.data.EmployeeUUID}')/EmployeeOrganisationalUnitAssignment`;
        var res = await service.tx(request).get(path);
        var arr = request.data.To_OrgUnits;
        for (const elem of res) {
          var uri_del = elem.$metadata.uri;
          var index_del = uri_del.indexOf('(');
          var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
          if (resEl == undefined) {
            var { uri } = elem.$metadata;
            var index = uri.indexOf('(');
            var new_path = `/EmployeeOrganisationalUnitAssignmentCollection${uri_del.substr(index_del)}`;
            var resofDel = await service.tx(request).delete(new_path);
          }
        }
      } catch (e) {
        var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
        request.reject(400, error);
      }
      for (const element of request.data.To_OrgUnits) {
        // -------------------------UPDATE--------------------
        if (element.IsUpdate && element.ObjectID != null) {
          try {
            var newOrgInst = {};
            if (element.IsPrimary) {
              newOrgInst.RoleCode = '219';
            } else {
              newOrgInst.RoleCode = '222';
            }
            newOrgInst.OrgUnitID = element.UnitID_Code;
            newOrgInst.JobID = element.JobID_ID;
            newOrgInst.StartDate = `${request.data.ValidatyStartDate}T00:00:00`;
            newOrgInst.EndDate = `${END_DATE}T00:00:00`;
            var path = `/EmployeeOrganisationalUnitAssignmentCollection${element.ObjectID}`;
            var resofDel = await service.tx(request).delete(path);
            var new_path = `/EmployeeCollection('${request.data.EmployeeUUID}')/EmployeeOrganisationalUnitAssignment`;
            var resofPOST = await service.tx(request).post(new_path, newOrgInst);
            var { uri } = resofPOST.__metadata;
            var index = uri.indexOf('(');
            var objID = uri.substr(index);
            element.ObjectID = objID;
          } catch (e) {
            var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
            request.reject(400, error);
          }
        }
        // --------------------------CREATE------------------
        if (element.ObjectID == null) {
          try {
            var newOrgInst = {};
            if (element.IsPrimary) {
              newOrgInst.RoleCode = '219';
            } else {
              newOrgInst.RoleCode = '222';
            }
            newOrgInst.OrgUnitID = element.UnitID_Code;
            newOrgInst.JobID = element.JobID_ID;
            newOrgInst.StartDate = `${request.data.ValidatyStartDate}T00:00:00`;
            newOrgInst.EndDate = `${END_DATE}T00:00:00`;
            var path = `/EmployeeCollection('${request.data.EmployeeUUID}')/EmployeeOrganisationalUnitAssignment`;
            var resofPOST = await service.tx(request).post(path, newOrgInst);
            var { uri } = resofPOST.__metadata;
            var index = uri.indexOf('(');
            var objID = uri.substr(index);
            element.ObjectID = objID;
          } catch (e) {
            var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
            request.reject(400, error);
          }
        }
        element.IsUpdate = false;
      }
      // --------------------------------Sales responsobility ---------------------
      // ------------------DELETE------------------
      try {
        var path = `/EmployeeCollection('${request.data.EmployeeUUID}')/EmployeeSalesResponsibility`;
        var res = await service.tx(request).get(path);
        var arr = request.data.To_SalesResponsobilities;
        for (const elem of res) {
          var uri_del = elem.$metadata.uri;
          var index_del = uri_del.indexOf('(');
          var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
          if (resEl == undefined) {
            var { uri } = elem.$metadata;
            var index = uri.indexOf('(');
            var new_path = `/EmployeeSalesResponsibilityCollection${uri_del.substr(index_del)}`;
            var resofDel = await service.tx(request).delete(new_path);
          }
        }
      } catch (e) {
        var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
        request.reject(400, error);
      }
      for (const element of request.data.To_SalesResponsobilities) {
        // -------------------------UPDATE--------------------
        if (element.IsUpdate && element.ObjectID != null) {
          try {
            var newSalesRespInst = {};
            newSalesRespInst.SalesOrganisationID = element.SalesOrgID_Code;
            newSalesRespInst.DistributionChannelCode = element.DistributionChanelCode_ID;
            newSalesRespInst.DivisionCode = element.DivisionCode_ID;
            newSalesRespInst.MainIndicator = element.MainIndicator;
            var path = `/EmployeeSalesResponsibilityCollection${element.ObjectID}`;
            var resofDel = await service.tx(request).delete(path);
            var new_path = `/EmployeeCollection('${request.data.EmployeeUUID}')/EmployeeSalesResponsibility`;
            var resofPOST = await service.tx(request).post(new_path, newSalesRespInst);
            var { uri } = resofPOST.__metadata;
            var index = uri.indexOf('(');
            var objID = uri.substr(index);
            element.ObjectID = objID;
          } catch (e) {
            var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
            request.reject(400, error);
          }
        }
        // --------------------------CREATE------------------
        if (element.ObjectID == null) {
          try {
            var newSalesRespInst = {};
            newSalesRespInst.SalesOrganisationID = element.SalesOrgID_Code;
            newSalesRespInst.DistributionChannelCode = element.DistributionChanelCode_ID;
            newSalesRespInst.DivisionCode = element.DivisionCode_ID;
            newSalesRespInst.MainIndicator = element.MainIndicator;
            var path = `/EmployeeCollection('${request.data.EmployeeUUID}')/EmployeeSalesResponsibility`;
            var resofPOST = await service.tx(request).post(path, newSalesRespInst);
            var { uri } = resofPOST.__metadata;
            var index = uri.indexOf('(');
            var objID = uri.substr(index);
            element.ObjectID = objID;
          } catch (e) {
            var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
            request.reject(400, error);
          }
        }
        element.IsUpdate = false;
      }
      // --------------------------------Territories ---------------------
      // ------------------DELETE------------------
      try {
        var path = `/SalesTerritoryTeamCollection?$top=50&$filter=EmployeeID eq '${request.data.EmployeeIDExternal}'`;
        var res = await service.tx(request).get(path);
        var arr = request.data.To_Territories;
        for (const elem of res) {
          var uri_del = elem.$metadata.uri;
          var index_del = uri_del.indexOf('(');
          var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
          if (resEl == undefined) {
            var { uri } = elem.$metadata;
            var index = uri.indexOf('(');
            var new_path = `/SalesTerritoryTeamCollection${uri_del.substr(index_del)}`;
            var resofDel = await service.tx(request).delete(new_path);
          }
        }
      } catch (e) {
        var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
        request.reject(400, error);
      }
      for (const element of request.data.To_Territories) {
        // -------------------------UPDATE--------------------
        if (element.IsUpdate && element.ObjectID != null) {
          try {
            var newTerrInst = {};
            newTerrInst.TerritoryId = element.SalesTerritory_ID;
            newTerrInst.EmployeeID = request.data.EmployeeIDExternal;
            newTerrInst.StartDate = `${request.data.ValidatyStartDate}T00:00:00`;
            newTerrInst.EndDate = `${END_DATE}T00:00:00`;
            newTerrInst.PartyRole = '46';
            var path = `/SalesTerritoryTeamCollection${element.ObjectID}`;
            var resofDel = await service.tx(request).delete(path);
            var query = `/SalesTerritoryCollection?$filter=Id eq '${element.SalesTerritory_ID}'&$select=ObjectID`;
            var terData = await service.tx(request).get(query);
            var currentObjectID = terData[0].ObjectID;
            var endPoint = `/SalesTerritoryCollection('${currentObjectID}')/SalesTerritoryTeam`;
            var resTer = await service.tx(request).post(endPoint, newTerrInst);
            var { uri } = resTer.__metadata;
            var index = uri.indexOf('(');
            var objID = uri.substr(index);
            element.ObjectID = objID;
            element.TerritoryObjectID = currentObjectID;
          } catch (e) {
            var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
            request.reject(400, error);
          }
        }
        // --------------------------CREATE------------------
        if (element.ObjectID == null) {
          try {
            var newTerrInst = {};
            newTerrInst.TerritoryId = element.SalesTerritory_ID;
            newTerrInst.EmployeeID = request.data.EmployeeIDExternal;
            newTerrInst.StartDate = `${request.data.ValidatyStartDate}T00:00:00`;
            newTerrInst.EndDate = `${END_DATE}T00:00:00`;
            newTerrInst.PartyRole = '46';
            var query = `/SalesTerritoryCollection?$filter=Id eq '${element.SalesTerritory_ID}'&$select=ObjectID`;
            var terData = await service.tx(request).get(query);
            var currentObjectID = terData[0].ObjectID;
            var endPoint = `/SalesTerritoryCollection('${currentObjectID}')/SalesTerritoryTeam`;
            var resTer = await service.tx(request).post(endPoint, newTerrInst);
            var { uri } = resTer.__metadata;
            var index = uri.indexOf('(');
            var objID = uri.substr(index);
            element.ObjectID = objID;
            element.TerritoryObjectID = currentObjectID;
          } catch (e) {
            var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
            request.reject(400, error);
          }
        }
        element.IsUpdate = false;
      }
      // --------------------------------Mapping ---------------------
      // ------------------DELETE------------------
      try {
        var path = `/ObjectIdentifierMappingCollection?$filter=LocalObjectUUID eq guid'${request.data.EmployeeUUIDWithHyphen}'`;
        var res = await service.tx(request).get(path);
        var arr = request.data.To_Mappings;
        for (const elem of res) {
          var uri_del = elem.$metadata.uri;
          var index_del = uri_del.indexOf('(');
          var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
          if (resEl == undefined) {
            var { uri } = elem.$metadata;
            var index = uri.indexOf('(');
            var new_path = `/ObjectIdentifierMappingCollection${uri_del.substr(index_del)}`;
            var resofDel = await service.tx(request).delete(new_path);
          }
        }
      } catch (e) {
        var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
        request.reject(400, error);
      }
      for (const element of request.data.To_Mappings) {
        // -------------------------UPDATE--------------------
        if (element.IsUpdate && element.ObjectID != null) {
          try {
            var newMappingInst = {};
            newMappingInst.LocalObjectID = request.data.BusinessPartnerID;
            newMappingInst.RemoteObjectID = element.RemoteObjectID;
            newMappingInst.RemoteIdentifierDefiningSchemeCode = '3';
            newMappingInst.RemoteBusinessSystemID = element.RemoteSystemID_ID;
            var path = `/ObjectIdentifierMappingCollection${element.ObjectID}`;
            var resofDel = await service.tx(request).delete(path);
            var resObjMapping = await service.tx(request).post('/ObjectIdentifierMappingCollection', newMappingInst);
            var { uri } = resObjMapping.__metadata;
            var index = uri.indexOf('(');
            var objID = uri.substr(index);
            element.ObjectID = objID;
          } catch (e) {
            var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
            request.reject(400, error);
          }
        }
        // --------------------------CREATE------------------
        if (element.ObjectID == null) {
          try {
            var newMappingInst = {};
            newMappingInst.LocalObjectID = request.data.BusinessPartnerID;
            newMappingInst.RemoteObjectID = element.RemoteObjectID;
            newMappingInst.RemoteIdentifierDefiningSchemeCode = '3';
            newMappingInst.RemoteBusinessSystemID = element.RemoteSystemID_ID;
            var resObjMapping = await service.tx(request).post('/ObjectIdentifierMappingCollection', newMappingInst);
            var { uri } = resObjMapping.__metadata;
            var index = uri.indexOf('(');
            var objID = uri.substr(index);
            element.ObjectID = objID;
          } catch (e) {
            var error = `Employee update error: ${e.innererror.response.body.error.message.value}`;
            request.reject(400, error);
          }
        }
        element.IsUpdate = false;
      }
    }
  }
}

module.exports = { ManageAPICalls };
