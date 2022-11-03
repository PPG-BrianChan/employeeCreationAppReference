sap.ui.define([],
    function (){
        "use strict";
        return {
            lockButtonClick: function () {
                const oModel = this._view.getModel(),
                    sBusinessPartnnerID = this._view.getBindingContext().getObject().BusinessPartnerID;
                if (sBusinessPartnnerID) {
                    const oContext = oModel.bindContext("/lockUsers(...)", null, {idList: sBusinessPartnnerID});
                    oContext.execute();
                }
            },

            unlockButtonClick: function () {
                const oModel = this._view.getModel(),
                    sBusinessPartnnerID = this._view.getBindingContext().getObject().BusinessPartnerID;
                if (sBusinessPartnnerID) {
                    const oContext = oModel.bindContext("/unlockUsers(...)", null, {idList: sBusinessPartnnerID});
                    oContext.execute();
                }
            }
        };
    });
    