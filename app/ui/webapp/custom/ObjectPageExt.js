sap.ui.define([],
    function (){
        "use strict";
        return {
            lockButtonClick: function () {
                const oModel = this._view.getModel(),
                    oBPobject = this._view.getBindingContext().getObject(),
                    sBusinessPartnerID = oBPobject.ID;
                if (oBPobject.BusinessPartnerID) {
                    var oContext = oModel.bindContext('/lockUsers(...)');
                    oContext.setParameter('idsList', sBusinessPartnerID);
                    oContext.execute();
                }
            },

            unlockButtonClick: function () {
                const oModel = this._view.getModel(),
                    oBPobject = this._view.getBindingContext().getObject(),
                    sBusinessPartnerID = oBPobject.ID;
                if (oBPobject.BusinessPartnerID) {
                    var oContext = oModel.bindContext('/unlockUsers(...)');
                    oContext.setParameter('idsList', sBusinessPartnerID);
                    oContext.execute();
                }
            }
        };
    });
    