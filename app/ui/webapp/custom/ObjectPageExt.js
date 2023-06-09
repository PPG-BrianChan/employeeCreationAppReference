sap.ui.define([],
    function (){
        "use strict";
        return {
            lockButtonClick: function () {
                const oModel = this._view.getModel(),
                    oBPobject = this._view.getBindingContext().getObject(),
                    sBusinessPartnerID = oBPobject.ID;
                if (oBPobject.BusinessPartnerID) {
                    const oContext = oModel.bindContext("/lockUsers(...)");
                    oContext.setParameter('idsList', sBusinessPartnerID);
                    oContext.execute().then(
                        response => {
                            sap.m.MessageToast.show("Users locked");
                            this._view.getBindingContext().refresh();
                        },
                        error => {
                            sap.m.MessageBox.error(error.message);
                        });
                }
            },

            unlockButtonClick: function () {
                const oModel = this._view.getModel(),
                    oBPobject = this._view.getBindingContext().getObject(),
                    sBusinessPartnerID = oBPobject.ID;
                if (oBPobject.BusinessPartnerID) {
                    const oContext = oModel.bindContext("/unlockUsers(...)");
                    oContext.setParameter('idsList', sBusinessPartnerID);
                    oContext.execute().then(
                        response => {
                            sap.m.MessageToast.show("Users unlocked");
                            this._view.getBindingContext().refresh();
                        },
                        error => {
                            sap.m.MessageBox.error(error.message);
                        });
                }
            }
        };
    });
    