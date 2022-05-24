sap.ui.define([
  'sap/base/util/UriParameters'
], function (UriParameters) {
  'use strict';

  return {
    
    onPageReady: function () {
      const oContext = this.getView().getBindingContext();
      
      if (!oContext) {
        setTimeout(this.onPageReady.bind(this), 500);
      } else {
        setTimeout(this.setSystemFromUrlParamters, 500, oContext);
      }
    },

    setSystemFromUrlParamters: function (oContext) {
      const sHash = decodeURI(window.location.hash.split('?')[1]).replace(/%20/g, ' ');
      const sSystem = UriParameters.fromQuery(sHash).get('System');
      
      oContext.setProperty('System', sSystem);
    }

  };

});
