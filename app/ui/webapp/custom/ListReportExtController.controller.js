sap.ui.define([
    'sap/base/util/UriParameters'
  ], function (UriParameters) {
    'use strict';
  
    return {

      onAfterRendering: function () {
          const sSystem = this.getSystemParameterFromUrl();
          this.getView().getModel().changeHttpHeaders({system: sSystem});
      },
  
      getSystemParameterFromUrl: function () {
        const sHash = decodeURI(window.location.hash.split('?')[1]).replace(/%20/g, ' ');
        return UriParameters.fromQuery(sHash).get('System');
      }
  
    };
  
  });
  