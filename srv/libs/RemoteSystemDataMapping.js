const _tenant = {
  DEV: 'ClientLink-Dev_org',
  UAT: 'ClientLink-QA_org',
  PRODUCTION: 'ClientLink-Prod_org'
};

const _businessUnit = {
  AC: 'ac',
  AUTO: 'auto',
  AEROSPACE: 'aerospace'
};

const _getRemoteSystemsProperties = async () => {
  return [{
      tenant: _tenant.DEV,
      businessUnit: _businessUnit.AC,
      data: [
        { ID: 'TANGRAM', Description: 'TANGRAM' },
        { ID: 'NONSAP', Description: 'NONSAP' },
        { ID: 'DALI', Description: 'DALI' },
        { ID: 'INTERLINK', Description: 'INTERLINK' },
        { ID: 'Q15', Description: 'Q15' },
        { ID: 'VANTAGEPOINT', Description: 'VANTAGEPOINT' },
        { ID: 'SAP S/4 UAT', Description: 'VSAP S/4 UAT' }
      ]
    }, {
      tenant: _tenant.UAT,
      businessUnit: _businessUnit.AC,
      data: [
        { ID: 'TANGRAM', Description: 'TANGRAM' },
        { ID: 'NONSAP', Description: 'NONSAP' },
        { ID: 'DALI', Description: 'DALI' },
        { ID: 'INTERLINK', Description: 'INTERLINK' },
        { ID: 'Q15', Description: 'Q15' },
        { ID: 'VANTAGEPOINT', Description: 'VANTAGEPOINT' },
        { ID: 'SAP S/4 UAT', Description: 'VSAP S/4 UAT' }
      ]        
    }, {
      tenant: _tenant.PRODUCTION,
      businessUnit: _businessUnit.AC,
      data: [
        { ID: 'TANGRAM', Description: 'TANGRAM' },
        { ID: 'NONSAP', Description: 'NONSAP' },
        { ID: 'DALI', Description: 'DALI' },
        { ID: 'INTERLINK', Description: 'INTERLINK' },
        { ID: 'Q15', Description: 'Q15' },
        { ID: 'VANTAGEPOINT', Description: 'VANTAGEPOINT' },
        { ID: 'SAP S/4 UAT', Description: 'VSAP S/4 UAT' }
      ]        
    }, {
      tenant: _tenant.DEV,
      businessUnit: _businessUnit.AUTO,
      data: [
        { ID: 'FOCUS', Description: 'FOCUS' },
        { ID: 'SNOW', Description: 'SNOW' },
        { ID: 'PAYMETRIC', Description: 'PAYMETRIC' }
      ]        
    }, {
      tenant: _tenant.UAT,
      businessUnit: _businessUnit.AUTO,
      data: [
        { ID: 'FOCUS', Description: 'FOCUS' },
        { ID: 'SNOW', Description: 'SNOW' },
        { ID: 'PAYMETRIC', Description: 'PAYMETRIC' }
      ]        
    }, {
      tenant: _tenant.PRODUCTION,
      businessUnit: _businessUnit.AUTO,
      data: [
        { ID: 'FOCUS', Description: 'FOCUS' },
        { ID: 'SNOW', Description: 'SNOW' },
        { ID: 'PAYMETRIC', Description: 'PAYMETRIC' }
      ]        
    }, {
      tenant: _tenant.DEV,
      businessUnit: _businessUnit.AEROSPACE,
      data: [
        { ID: 'QT100', Description: 'QT100' },
        { ID: 'NONSAP', Description: 'NONSAP' },
        { ID: 'ECC100', Description: 'ECC100' },
        { ID: 'SERVICENOW', Description: 'SERVICENOW' },
        { ID: 'SAPERP_SCM', Description: 'SAPERP_SCM' },
        { ID: 'LASERFISH', Description: 'LASERFISH' },
        { ID: 'E100211', Description: 'E100211' },
        { ID: 'PAYMETRIC', Description: 'PAYMETRIC' }
      ]
    }, {
      tenant: _tenant.UAT,
      businessUnit: _businessUnit.AEROSPACE,
      data: [
        { ID: 'QT100', Description: 'QT100' },
        { ID: 'OT100', Description: 'OT100' },
        { ID: 'SERVICENOW', Description: 'SERVICENOW' },
        { ID: 'SAPERP_SCM', Description: 'SAPERP_SCM' },
        { ID: 'LASERFISH', Description: 'LASERFISH' },
        { ID: 'E100211', Description: 'E100211' },
        { ID: 'E100211_MARKETING', Description: 'E100211_MARKETING' },
        { ID: 'PAYMETRIC', Description: 'PAYMETRIC' }
      ]
    }, {
      tenant: _tenant.PRODUCTION,
      businessUnit: _businessUnit.AEROSPACE,
      data: [
        { ID: 'QP100', Description: 'QP100' },
        { ID: 'SERVICENOW', Description: 'SERVICENOW' },
        { ID: 'LASERFISH', Description: 'LASERFISH' },
        { ID: 'PAYMETRIC', Description: 'PAYMETRIC' }
      ]        
    }];
}

class RemoteSystemDataMapping {

  static async getData(businessUnit, tenant) {    
    const systemsProperties = await _getRemoteSystemsProperties();
    const systemProperties = systemsProperties.find(property => property.businessUnit === businessUnit && property.tenant === tenant);
    return systemProperties.data;
  }

};

module.exports = { RemoteSystemDataMapping };