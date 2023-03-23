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
        const mData = oContext.getObject();
        if (!mData) {
          setTimeout(this.onPageReady.bind(this), 500);
        } else {
          if (!mData.System) {
            const sSystem = this.getSystemParameterFromUrl();
            oContext.getModel().changeHttpHeaders({system: sSystem});
            oContext.setProperty('System', sSystem);
          }else{
            //Insertion:Upon refresh, Http Headers have to be passed in again
            const headerSystem = oContext.getModel().getHttpHeaders().system
            if(headerSystem === undefined){
              oContext.getModel().changeHttpHeaders({system: mData.System});
            }
          }
        }
      }
      
    },

    getSystemParameterFromUrl: function () {
      const sHash = decodeURI(window.location.hash.split('?')[1]).replace(/%20/g, ' ');
      return UriParameters.fromQuery(sHash).get('System');
    }

  };

});
