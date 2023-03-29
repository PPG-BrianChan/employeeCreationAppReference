const CircularJSON = require('circular-json');
const { executeHttpRequest } = require('@sap-cloud-sdk/core');
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

  static async _errorHandlingLockAndUnlock(request, error, text) {
    let errorText;
    let errorCode;
    if(error != undefined && error.innererror != undefined && error.innererror.response != undefined){
        errorText = text + error.innererror.response.body.error.message.value;
        errorCode = error.innererror.response.status;
    }
    if(errorText && errorCode){
        request.reject(errorCode, errorText);
    }

    request.reject(500, text);
  }

  static _convertIdStringToArray(request) {
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
    return {user: user, idArray: idArray}
  }

  static async makeRequestForLockingOrUnlocking(EmpCreationForm, requestParams, lockIndicator) {

    for (let element of requestParams.idArray){

        const creationForm = await SELECT.one.from(EmpCreationForm).where({ ID : element});

        const currentObjectID = creationForm.EmployeeUUID;
        const dest = ManageAPICalls._getDestination(creationForm.System);
        
        const createRequestParameters = {
            method: 'patch',
            url: `/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('${currentObjectID}')`,
            data: {
                "UserLockedIndicator": lockIndicator
            },
            headers: {
                'content-type': 'application/json'
            }
        }

        await executeHttpRequest({destinationName: dest}, createRequestParameters, {
            fetchCsrfToken: true
        });
          
        await ManageAPICalls._updateEmployeeAfterLockingOrUnlocking(EmpCreationForm, element, lockIndicator)              
    }
  }

  static async _updateEmployeeAfterLockingOrUnlocking(EmpCreationForm, id, lockIndicator) {
    await UPDATE(EmpCreationForm).where({ ID : id }).with({ UserLocked: lockIndicator });
  }

  static _getDestination(system) {
    let destinationName = '';
    switch (system) {
        case 'ac':
            destinationName = 'c4c_ac';
            break;
        case 'auto':
            destinationName = 'c4c_auto';
            break;
        case 'aerospace':
            destinationName = 'c4c_aerospace';
            break;
    }
    return destinationName;
  }

  static getObjectIDFromURI(el){
    console.log("ELEMENT" + JSON.stringify(el));
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
      executedRes = await service.tx(request).post('/sap/c4c/odata/v1/c4codataapi/EmployeeCollection', empInst);
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
            var path = `/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('${UUID}')/EmployeeUserBusinessRoleAssignment`;
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
            var path = `/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('${UUID}')/EmployeeSalesResponsibility`;
            var res = await service.tx(request).get(path);
            console.log("ELEMENT_SR" + JSON.stringify(request.data.To_SalesResponsobilities));
            console.log("ELEMENT_RES" + JSON.stringify(res));
            for (const element of request.data.To_SalesResponsobilities){
                
                let mainIndicator = false;
                if(element.MainIndicator == null){
                    mainIndicator = false;
                }else{
                    mainIndicator = element.MainIndicator;
                }
                
                const resEl = res.find(el => el.SalesOrganisationID == element.SalesOrgID_Code && 
                                            el.DistributionChannelCode == element.DistributionChanelCode_Code && 
                                            el.DivisionCode == element.DivisionCode_Code && 
                                            el.MainIndicator == mainIndicator);
                console.log("ELEMENT_S" + JSON.stringify(element));
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
            var path = `/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('${UUID}')/EmployeeOrganisationalUnitAssignment`;
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
                const query = `/sap/c4c/odata/v1/c4codataapi/SalesTerritoryCollection?$filter=Id eq '${element.SalesTerritory_Code}'&$select=ObjectID`;

                const terData = await service.tx(request).get(query);
                const currentObjectID = terData[0].ObjectID;
                const endPoint = `/sap/c4c/odata/v1/c4codataapi/SalesTerritoryCollection('${currentObjectID}')/SalesTerritoryTeam`;
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
            const resObjMapping = await service.tx(request).post('/sap/c4c/odata/v1/c4codataapi/ObjectIdentifierMappingCollection', newMappingInst);
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

        var new_path = "/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('"+ request.data.EmployeeUUID +"')";
        var resofPATCH = await service.tx(request).patch(new_path,newRoleInst);
    }catch(e){
        var errorText = 'Employee update error: ';
        ManageAPICalls.errorHandling(request, e, errorText);
    }

      // --------------------------------Business Roles  ---------------------
      // ------------------DELETE------------------
      try {
        var path = "/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeUserBusinessRoleAssignment";
        var res = await service.tx(request).get(path);
        var arr = request.data.To_BusinessRoles;
        for (const elem of res){
            var uri_del = elem.$metadata.uri;
            var index_del = uri_del.indexOf("(");
            var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
            if(resEl == undefined){
                var uri = elem.$metadata.uri;
                var index = uri.indexOf("(");
                var new_path = "/sap/c4c/odata/v1/c4codataapi/EmployeeUserBusinessRoleAssignmentCollection" + uri_del.substr(index_del);
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
                    var path = "/sap/c4c/odata/v1/c4codataapi/EmployeeUserBusinessRoleAssignmentCollection" + element.ObjectID;
                    var resofDel = await service.tx(request).delete(path);     
                }
                var new_path = "/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeUserBusinessRoleAssignment";
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
            var path = "/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeOrganisationalUnitAssignment";
            var res = await service.tx(request).get(path);
            var arr = request.data.To_OrgUnits;
            for (const elem of res){
                var uri_del = elem.$metadata.uri;
                var index_del = uri_del.indexOf("(");
                var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
                if(resEl == undefined){
                    var uri = elem.$metadata.uri;
                    var index = uri.indexOf("(");
                    var new_path = "/sap/c4c/odata/v1/c4codataapi/EmployeeOrganisationalUnitAssignmentCollection" + uri_del.substr(index_del);
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
                        var path = "/sap/c4c/odata/v1/c4codataapi/EmployeeOrganisationalUnitAssignmentCollection" + element.ObjectID;
                        var resofDel = await service.tx(request).delete(path);     
                    }
                    var new_path = "/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeOrganisationalUnitAssignment";
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
      // --------------------------------Sales responsibility ---------------------
      //------------------DELETE------------------
      try{           
        var path = "/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeSalesResponsibility";
        var res = await service.tx(request).get(path);
        var arr = request.data.To_SalesResponsobilities;
        for (const elem of res){
            var uri_del = elem.$metadata.uri;
            var index_del = uri_del.indexOf("(");
            var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
            if(resEl == undefined){
                var uri = elem.$metadata.uri;
                var index = uri.indexOf("(");
                var new_path = "/sap/c4c/odata/v1/c4codataapi/EmployeeSalesResponsibilityCollection" + uri_del.substr(index_del);
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
                    var path = "/sap/c4c/odata/v1/c4codataapi/EmployeeSalesResponsibilityCollection" + element.ObjectID;
                    var resofDel = await service.tx(request).delete(path);   
                }  
                var new_path = "/sap/c4c/odata/v1/c4codataapi/EmployeeCollection('"+ request.data.EmployeeUUID +"')/EmployeeSalesResponsibility";
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
        var path = "/sap/c4c/odata/v1/c4codataapi/SalesTerritoryTeamCollection?$top=50&$filter=EmployeeID eq '" + request.data.EmployeeIDExternal + "'";
        var res = await service.tx(request).get(path);
        var arr = request.data.To_Territories;
        for (const elem of res){
            var uri_del = elem.$metadata.uri;
            var index_del = uri_del.indexOf("(");
            var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
            if(resEl == undefined){
                var uri = elem.$metadata.uri;
                var index = uri.indexOf("(");
                var new_path = "/sap/c4c/odata/v1/c4codataapi/SalesTerritoryTeamCollection" + uri_del.substr(index_del);
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
                    var path = "/sap/c4c/odata/v1/c4codataapi/SalesTerritoryTeamCollection" + element.ObjectID;
                    var resofDel = await service.tx(request).delete(path);   
                }                       
                var query = "/sap/c4c/odata/v1/c4codataapi/SalesTerritoryCollection?$filter=Id eq '" + element.SalesTerritory_Code + "'&$select=ObjectID";                       
                var terData = await service.tx(request).get(query);
                var currentObjectID = terData[0].ObjectID;
                var endPoint = "/sap/c4c/odata/v1/c4codataapi/SalesTerritoryCollection('" + currentObjectID + "')/SalesTerritoryTeam";
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
        var path = "/sap/c4c/odata/v1/c4codataapi/ObjectIdentifierMappingCollection?$filter=LocalObjectUUID eq guid'" + request.data.EmployeeUUIDWithHyphen + "'";
        var res = await service.tx(request).get(path);
        var arr = request.data.To_Mappings;
        for (const elem of res){
            var uri_del = elem.$metadata.uri;
            var index_del = uri_del.indexOf("(");
            var resEl = arr.find(el => el.ObjectID == uri_del.substr(index_del));
            if(resEl == undefined){
                var uri = elem.$metadata.uri;
                var index = uri.indexOf("(");
                var new_path = "/sap/c4c/odata/v1/c4codataapi/ObjectIdentifierMappingCollection" + uri_del.substr(index_del);
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
                    var path = "/sap/c4c/odata/v1/c4codataapi/ObjectIdentifierMappingCollection" + element.ObjectID;
                    var resofDel = await service.tx(request).delete(path);         
                }                 
                var resObjMapping = await service.tx(request).post("/sap/c4c/odata/v1/c4codataapi/ObjectIdentifierMappingCollection",newMappingInst);       
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
