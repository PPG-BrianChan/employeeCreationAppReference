class ManageAPICalls {
  static errorHandling(request, error, text) {
    let errorText = error;
    let errorCode = 400;
    if(error.innererror != undefined && error.innererror.response != undefined){
    errorText = text + error.innererror.response.body.error.message.value;
    errorCode = error.innererror.response.status;
    }
    if(errorCode >= 400 && errorCode < 500){
        request.info(errorCode,errorText);
    }else if(errorCode >= 500){
        request.reject(errorCode,errorText);
    }
  }

  static getObjectIDFromURI(el){
    let metadata;
    if(el.$metadata != undefined){
        metadata = el.$metadata;
    }else if(el.__metadata != undefined){
        metadata = el.__metadata;
    }
    const uri = metadata.uri;
    const index = uri.indexOf("(");
    return uri.substr(index);  
  }

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
      const errorText = 'User locking error: ';
      ManageAPICalls.errorHandling(request, e, errorText);
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
      const errorText = 'User unlocking error: ';
      ManageAPICalls.errorHandling(request, e, errorText);
    }
  };

  static createEmpData(request){
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
      LanguageCode: request.data.Language_Code,
      CountryCode: request.data.Country_Code,
      MobilePhoneNumber: request.data.MobilePhone,
      UserValidityStartDate: `${request.data.ValidatyStartDate}T00:00:00`,
      UserValidityEndDate: `${END_DATE}T00:00:00`,
      Email: request.data.Email,
      UserPasswordPolicyCode: request.data.UserPasswordPolicy_Code,
      UserLockedIndicator: false
    };

    const system = request.data.System;

    if (system === 'ac') {
      if (orgName === 'ClientLink-Dev_org') {
        empInst.ZSalesRepElig_KUT = request.data.SalesReportingEligible;
      } else {
        empInst.Z_SalesRepElig_KUT = request.data.SalesReportingEligible;
      }
    } else if (system === 'auto') {
      empInst.Z_SalesReportingEligible_KUT = request.data.SalesReportingEligible;
      empInst.Z_EmployeeIdentifier_KUT = request.data.EmployeeIdentifier_Code;
      empInst.Region_KUT = request.data.Region_Code;
      empInst.Subregion_KUT = request.data.Subregion_Code;
    } else if (system === 'aerospace') {
      empInst.Salesreportingeligible_KUT = request.data.SalesReportingEligible;
    }

    if (request.data.UserPasswordPolicy_Code == null) {
      empInst.UserPasswordPolicyCode = 'S_BUSINESS_USER_WITHOUT_PASSWORD';
    }
    let arr = request.data.To_BusinessRoles;
    for (const element of arr) {
      const newRoleInst = {};
      newRoleInst.UserID = request.data.UserLogin;
      newRoleInst.BusinessRoleID = element.Role_Code;
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
      newOrgInst.JobID = element.JobID_Code;
      newOrgInst.StartDate = `${request.data.ValidatyStartDate}T00:00:00`;
      newOrgInst.EndDate = `${END_DATE}T00:00:00`;
      orgAssigment.push(newOrgInst);
    }
    arr = request.data.To_SalesResponsobilities;
    for (const element of arr) {
      const newSalesRespInst = {};
      newSalesRespInst.SalesOrganisationID = element.SalesOrgID_Code;
      newSalesRespInst.DistributionChannelCode = element.DistributionChanelCode_Code;
      newSalesRespInst.DivisionCode = element.DivisionCode_Code;
      newSalesRespInst.MainIndicator = element.MainIndicator;
      salesResp.push(newSalesRespInst);
    }

    empInst.EmployeeUserBusinessRoleAssignment = businessRoles;
    empInst.EmployeeSalesResponsibility = salesResp;
    empInst.EmployeeOrganisationalUnitAssignment = orgAssigment;

    return empInst;
  }

  static async createEmployee(request, service, EmpCreationForm, BusinessRoles, SalesResponsability, EmployeeOrgUnitAssigment, Territories, Mapping) {
    const END_DATE = "9999-12-31";
    const empInst = ManageAPICalls.createEmpData(request);
    console.log("EMP_INST" + JSON.stringify(empInst));
    let executedRes;
    try {
      executedRes = await service.tx(request).post('/EmployeeCollection', empInst);
    } catch (e) {
      const errorText = 'Employee creation error: ';
      ManageAPICalls.errorHandling(request, e, errorText);
    }

    if(executedRes != undefined){
        const empID = executedRes.EmployeeID; // '1283302';  //
        const businessPartnerID = executedRes.BusinessPartnerID; // '8000004299';//
        const UUID = executedRes.ObjectID;
        const UUIDwithHyphen = executedRes.UUID;

        try {
            var path = `/EmployeeCollection('${UUID}')/EmployeeUserBusinessRoleAssignment`;
            var res = await service.tx(request).get(path);
            for (const element of request.data.To_BusinessRoles) {
                var resEl = res.find(el => el.BusinessRoleID == element.Role_Code);
                var objID = ManageAPICalls.getObjectIDFromURI(resEl);
                const updatedRecord = await UPDATE(BusinessRoles)
                .where({ To_CreationForm_ID: request.data.ID, ID: element.ID })
                .with({ ObjectID: objID, IsUpdate: false });
            }
        } catch (e) {
            const errorText = 'Employee mapping business roles error: ';
            ManageAPICalls.errorHandling(request, e, errorText);
        }

        try {
            var path = `/EmployeeCollection('${UUID}')/EmployeeSalesResponsibility`;
            var res = await service.tx(request).get(path);
            for (const element of request.data.To_SalesResponsobilities){
                const resEl = res.find(el => el.SalesOrganisationID == element.SalesOrgID_Code && 
                                            el.DistributionChannelCode == element.DistributionChanelCode_Code && 
                                            el.DivisionCode == element.DivisionCode_Code && 
                                            el.MainIndicator == element.MainIndicator);
                const objID = ManageAPICalls.getObjectIDFromURI(resEl);
                const updatedRecord = await UPDATE(SalesResponsability)
                .where({To_CreationForm_ID:request.data.ID, ID : element.ID})
                .with({ObjectID: objID, IsUpdate:false })
            } 
        } catch (e) {
            const errorText = 'Employee mapping sales responsobilities error: ';
            ManageAPICalls.errorHandling(request, e, errorText);
        }

        try {
            var path = `/EmployeeCollection('${UUID}')/EmployeeOrganisationalUnitAssignment`;
            var res = await service.tx(request).get(path);
            for (const element of request.data.To_OrgUnits){
                var resEl = res.find(el => el.OrgUnitID == element.UnitID_Code && 
                                        el.JobID == element.JobID_Code);
                var objID = ManageAPICalls.getObjectIDFromURI(resEl);   
                const updatedRecord = await UPDATE(EmployeeOrgUnitAssigment)
                .where({To_CreationForm_ID:request.data.ID, ID : element.ID})
                .with({ObjectID: objID, IsUpdate:false })
            } 
        } catch (e) {
            const errorText = 'Employee mapping org unit assignment error: ';
            ManageAPICalls.errorHandling(request, e, errorText);
        }

        try{
            for (const element of request.data.To_Territories) {
                const newTerrInst = {};
                newTerrInst.TerritoryId = element.SalesTerritory_Code;
                newTerrInst.EmployeeID = empID;
                newTerrInst.StartDate = `${request.data.ValidatyStartDate}T00:00:00`;
                newTerrInst.EndDate = `${END_DATE}T00:00:00`;
                newTerrInst.PartyRole = '46';
                const query = `/SalesTerritoryCollection?$filter=Id eq '${element.SalesTerritory_Code}'&$select=ObjectID`;

                const terData = await service.tx(request).get(query);
                const currentObjectID = terData[0].ObjectID;
                const endPoint = `/SalesTerritoryCollection('${currentObjectID}')/SalesTerritoryTeam`;
                const resTer = await service.tx(request).post(endPoint, newTerrInst);
                const objID = ManageAPICalls.getObjectIDFromURI(resTer);
                const updatedRecord = await UPDATE(Territories)
                .where({ To_CreationForm_ID: request.data.ID, ID: element.ID })
                .with({ ObjectID: objID, IsUpdate: false, TerritoryObjectID: currentObjectID });
            }
        }catch(e){
            var errorText = 'Territory creation error: ';
            this.errorHandling(request, e, errorText);
        }
        try{
            for (const element of request.data.To_Mappings) {
            const newMappingInst = {};
            newMappingInst.LocalObjectID = businessPartnerID;
            newMappingInst.RemoteObjectID = element.RemoteObjectID;
            newMappingInst.RemoteIdentifierDefiningSchemeCode = '3';
            newMappingInst.RemoteBusinessSystemID = element.RemoteSystemID_Code;
            const resObjMapping = await service.tx(request).post('/ObjectIdentifierMappingCollection', newMappingInst);
            const objID = ManageAPICalls.getObjectIDFromURI(resObjMapping);  
            const updatedMapping = await UPDATE(Mapping)
                .where({ To_CreationForm_ID: request.data.ID, ID: element.ID })
                .with({ ObjectID: objID, IsUpdate: false });
            }
        }catch(e){
            var errorText = 'Mapping creation error: ';
            this.errorHandling(request, e, errorText);
        }
        const updatedRecord = await UPDATE(EmpCreationForm).where({ ID: request.data.ID }).with({
            EmployeeIDExternal: empID,
            EmployeeIDInternal: request.data.ID,
            EmployeeUUID: UUID,
            BusinessPartnerID: businessPartnerID,
            EmployeeUUIDWithHyphen: UUIDwithHyphen,
            HideFirstPanel: true,
            IsNotTesterUser: true,
            IsSystemAC: request.data.System === 'ac',
            HideSecondPanel: false,
            UserLocked: false,
            ValidatyStartDate : request.data.ValidatyStartDate
        });
        request.data.EmployeeIDExternal = empID;
        request.data.EmployeeIDInternal = request.data.ID;
        request.data.blockBtnEnabled = true;
        request.data.unblockBtnEnabled = false;
        request.data.IsSystemAC = request.data.System === 'ac';
        request.data.HideFirstPanel = true;
        request.data.IsNotTesterUser = true;
        request.data.HideSecondPanel = false;
        request.data.BusinessPartnerID = businessPartnerID;
        request.data.EmployeeUUIDWithHyphen = UUIDwithHyphen;
        request.data.UserLocked = false;
    }
  }

  static async updateEmployee(request, service, EmpCreationForm, BusinessRoles, SalesResponsability, EmployeeOrgUnitAssigment, Territories, Mapping) {
    const END_DATE = '9999-12-31';
    var today = new Date().toISOString().slice(0, 10);
    const orgName = JSON.parse(process.env.VCAP_APPLICATION).organization_name;
    if(request.data.ValidatyStartDate == null) request.data.ValidatyStartDate = today;
    if (request.data.EmployeeIDExternal != null) {
      request.data.blockBtnEnabled = true;

    try{
        var newRoleInst = {};
        newRoleInst.UserPasswordPolicyCode = request.data.UserPasswordPolicy_Code;
        const system = request.data.System;

        if (system === 'ac') {
            if (orgName === 'ClientLink-Dev_org') {
                newRoleInst.ZSalesRepElig_KUT = request.data.SalesReportingEligible;
            } else {
                newRoleInst.Z_SalesRepElig_KUT = request.data.SalesReportingEligible;
            }
        } else if (system === 'auto') {
            newRoleInst.Z_SalesReportingEligible_KUT = request.data.SalesReportingEligible;
        } else if (system === 'aerospace') {
            newRoleInst.Salesreportingeligible_KUT = request.data.SalesReportingEligible;
        }

        var new_path = "/EmployeeCollection('"+ request.data.EmployeeUUID +"')";
        var resofPATCH = await service.tx(request).patch(new_path,newRoleInst);
    }catch(e){
        var errorText = 'Employee update error: ';
        ManageAPICalls.errorHandling(request, e, errorText);
    }

      // --------------------------------Business Roles  ---------------------
      // ------------------DELETE------------------
      try {
        var path = "/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeUserBusinessRoleAssignment";
        var res = await service.tx(request).get(path);
        var arr = request.data.To_BusinessRoles;
        for (const elem of res){
            var uri_del = elem.$metadata.uri;
            var index_del = uri_del.indexOf("(");
            var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
            if(resEl == undefined){
                var uri = elem.$metadata.uri;
                var index = uri.indexOf("(");
                var new_path = "/EmployeeUserBusinessRoleAssignmentCollection" + uri_del.substr(index_del);
                var resofDel = await service.tx(request).delete(new_path);     
            }          
        }
      } catch (e) {
        const errorText = 'Employee update error: ';
        ManageAPICalls.errorHandling(request, e, errorText);
      }
      for (const element of request.data.To_BusinessRoles) {
        //-------------------------CREATE/UPDATE--------------------
        if((element.IsUpdate && element.ObjectID != null) || element.ObjectID == null){
            try{
                var newRoleInst = {};
                newRoleInst.UserID = request.data.UserLogin.toUpperCase();
                newRoleInst.BusinessRoleID = element.Role_Code;
                if(element.ObjectID != null){
                    var path = "/EmployeeUserBusinessRoleAssignmentCollection" + element.ObjectID;
                    var resofDel = await service.tx(request).delete(path);     
                }
                var new_path = "/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeUserBusinessRoleAssignment";
                console.log("NEW_ROLE" + JSON.stringify(newRoleInst));
                var resofPOST = await service.tx(request).post(new_path,newRoleInst);     
                var objID = ManageAPICalls.getObjectIDFromURI(resofPOST);  
                element.ObjectID =  objID;
            }catch(e){
                var errorText = 'Employee update error: ';
                ManageAPICalls.errorHandling(request, e, errorText);
            }
        }
        element.IsUpdate = false;
      }

      //--------------------------------Org Unit Assignment ---------------------
        //------------------DELETE------------------
        try{           
            var path = "/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeOrganisationalUnitAssignment";
            var res = await service.tx(request).get(path);
            var arr = request.data.To_OrgUnits;
            for (const elem of res){
                var uri_del = elem.$metadata.uri;
                var index_del = uri_del.indexOf("(");
                var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
                if(resEl == undefined){
                    var uri = elem.$metadata.uri;
                    var index = uri.indexOf("(");
                    var new_path = "/EmployeeOrganisationalUnitAssignmentCollection" + uri_del.substr(index_del);
                    var resofDel = await service.tx(request).delete(new_path);     
                }          
            }
        }catch(e){
            var errorText = 'Employee update error: ';
            ManageAPICalls.errorHandling(request, e, errorText);
        }
        for (const element of request.data.To_OrgUnits) {               
            //-------------------------CREATE/UPDATE--------------------
            if((element.IsUpdate && element.ObjectID != null) || element.ObjectID == null){
                try{
                    var newOrgInst = {};
                    if(element.IsPrimary){
                        newOrgInst.RoleCode = "219";
                    }else{
                        newOrgInst.RoleCode = "222";
                    }
                    newOrgInst.OrgUnitID = element.UnitID_Code;           
                    newOrgInst.JobID = element.JobID_Code;
                    newOrgInst.StartDate = request.data.ValidatyStartDate + "T00:00:00";
                    newOrgInst.EndDate = END_DATE + "T00:00:00";
                    if(element.ObjectID != null){
                        var path = "/EmployeeOrganisationalUnitAssignmentCollection" + element.ObjectID;
                        var resofDel = await service.tx(request).delete(path);     
                    }
                    var new_path = "/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeOrganisationalUnitAssignment";
                    var resofPOST = await service.tx(request).post(new_path,newOrgInst);     
                    var objID = ManageAPICalls.getObjectIDFromURI(resofPOST);  
                    element.ObjectID =  objID;
                }catch(e){
                    var errorText = 'Employee update error: ';
                    ManageAPICalls.errorHandling(request, e, errorText);
                }
            }
            element.IsUpdate = false;
        }
      // --------------------------------Sales responsobility ---------------------
      //------------------DELETE------------------
      try{           
        var path = "/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeSalesResponsibility";
        var res = await service.tx(request).get(path);
        var arr = request.data.To_SalesResponsobilities;
        for (const elem of res){
            var uri_del = elem.$metadata.uri;
            var index_del = uri_del.indexOf("(");
            var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
            if(resEl == undefined){
                var uri = elem.$metadata.uri;
                var index = uri.indexOf("(");
                var new_path = "/EmployeeSalesResponsibilityCollection" + uri_del.substr(index_del);
                var resofDel = await service.tx(request).delete(new_path);     
            }          
        }
    }catch(e){
        var errorText = 'Employee update error: ';
        ManageAPICalls.errorHandling(request, e, errorText);
    }
    for (const element of request.data.To_SalesResponsobilities) {               
        //-------------------------CREATE/UPDATE--------------------
        if((element.IsUpdate && element.ObjectID != null) || element.ObjectID == null){
            try{
                var newSalesRespInst = {};
                newSalesRespInst.SalesOrganisationID = element.SalesOrgID_Code;
                newSalesRespInst.DistributionChannelCode = element.DistributionChanelCode_Code;
                newSalesRespInst.DivisionCode = element.DivisionCode_Code;
                newSalesRespInst.MainIndicator = element.MainIndicator;
                if(element.ObjectID != null){
                    var path = "/EmployeeSalesResponsibilityCollection" + element.ObjectID;
                    var resofDel = await service.tx(request).delete(path);   
                }  
                var new_path = "/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeSalesResponsibility";
                var resofPOST = await service.tx(request).post(new_path,newSalesRespInst);     
                var objID = ManageAPICalls.getObjectIDFromURI(resofPOST);  
                element.ObjectID =  objID;
            }catch(e){
                var errorText = 'Employee update error: ';
                ManageAPICalls.errorHandling(request, e, errorText);
            }
        }
        element.IsUpdate = false;
    }
      // --------------------------------Territories ---------------------
     //------------------DELETE------------------
     try{           
        var path = "/SalesTerritoryTeamCollection?$top=50&$filter=EmployeeID eq '" + request.data.EmployeeIDExternal + "'";
        var res = await service.tx(request).get(path);
        var arr = request.data.To_Territories;
        for (const elem of res){
            var uri_del = elem.$metadata.uri;
            var index_del = uri_del.indexOf("(");
            var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
            if(resEl == undefined){
                var uri = elem.$metadata.uri;
                var index = uri.indexOf("(");
                var new_path = "/SalesTerritoryTeamCollection" + uri_del.substr(index_del);
                var resofDel = await service.tx(request).delete(new_path);     
            }          
        }
    }catch(e){
        var errorText = 'Employee update error: ';
        ManageAPICalls.errorHandling(request, e, errorText);
    }
    for (const element of request.data.To_Territories) {               
        //-------------------------CREATE/UPDATE--------------------
        if((element.IsUpdate && element.ObjectID != null) || element.ObjectID == null){
            try{
                var newTerrInst = {};
                newTerrInst.TerritoryId = element.SalesTerritory_Code;
                newTerrInst.EmployeeID = request.data.EmployeeIDExternal;
                newTerrInst.StartDate = request.data.ValidatyStartDate + "T00:00:00";
                newTerrInst.EndDate = END_DATE + "T00:00:00";
                newTerrInst.PartyRole = "46";
                if(element.ObjectID != null){
                    var path = "/SalesTerritoryTeamCollection" + element.ObjectID;
                    var resofDel = await service.tx(request).delete(path);   
                }                       
                var query = "/SalesTerritoryCollection?$filter=Id eq '" + element.SalesTerritory_Code + "'&$select=ObjectID";                       
                var terData = await service.tx(request).get(query);
                var currentObjectID = terData[0].ObjectID;
                var endPoint = "/SalesTerritoryCollection('" + currentObjectID + "')/SalesTerritoryTeam";
                var resTer = await service.tx(request).post(endPoint,newTerrInst);
                var objID = ManageAPICalls.getObjectIDFromURI(resTer);     
                element.ObjectID =  objID;
                element.TerritoryObjectID =  currentObjectID;
            }catch(e){
                var errorText = 'Employee update error: ';
                ManageAPICalls.errorHandling(request, e, errorText);
            }
        }
        element.IsUpdate = false;
    }
      // --------------------------------Mapping ---------------------
      //------------------DELETE------------------
      try{           
        var path = "/ObjectIdentifierMappingCollection?$filter=LocalObjectUUID eq guid'" + request.data.EmployeeUUIDWithHyphen + "'";
        var res = await service.tx(request).get(path);
        var arr = request.data.To_Mappings;
        for (const elem of res){
            var uri_del = elem.$metadata.uri;
            var index_del = uri_del.indexOf("(");
            var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
            if(resEl == undefined){
                var uri = elem.$metadata.uri;
                var index = uri.indexOf("(");
                var new_path = "/ObjectIdentifierMappingCollection" + uri_del.substr(index_del);
                var resofDel = await service.tx(request).delete(new_path);     
            }          
        }
    }catch(e){
        var errorText = 'Employee update error: ';
        ManageAPICalls.errorHandling(request, e, errorText);
    }
    for (const element of request.data.To_Mappings) {               
        //-------------------------CREATE/UPDATE--------------------
        if((element.IsUpdate && element.ObjectID != null) || element.ObjectID == null){
            try{
                var newMappingInst = {};
                newMappingInst.LocalObjectID = request.data.BusinessPartnerID;
                newMappingInst.RemoteObjectID = element.RemoteObjectID;
                newMappingInst.RemoteIdentifierDefiningSchemeCode = "3";
                newMappingInst.RemoteBusinessSystemID = element.RemoteSystemID_Code;
                if(element.ObjectID != null){
                    var path = "/ObjectIdentifierMappingCollection" + element.ObjectID;
                    var resofDel = await service.tx(request).delete(path);         
                }                 
                var resObjMapping = await service.tx(request).post("/ObjectIdentifierMappingCollection",newMappingInst);       
                var objID = ManageAPICalls.getObjectIDFromURI(resObjMapping);     
                element.ObjectID = objID; 
            }catch(e){
                var errorText = 'Employee update error: ';
                ManageAPICalls.errorHandling(request, e, errorText);
            }
        }
        element.IsUpdate = false;
    }
    }
  }
}

module.exports = { ManageAPICalls };
