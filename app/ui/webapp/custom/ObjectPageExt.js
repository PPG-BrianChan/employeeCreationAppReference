sap.ui.define([],
    function (){
        "use strict";
        return {
            lockButtonClick: function () {
                const oModel = this._view.getModel(),
                    oBPobject = this._view.getBindingContext().getObject(),
                    sBusinessPartnnerID = oBPobject.ID;
                if (oBPobject.BusinessPartnnerID) {
                    const oContext = oModel.bindContext("/lockUsers(...)", null, {idList: sBusinessPartnnerID});
                    oContext.execute();
                }
            },

            unlockButtonClick: function () {
                const oModel = this._view.getModel(),
                    oBPobject = this._view.getBindingContext().getObject(),
                    sBusinessPartnnerID = oBPobject.ID;
                if (oBPobject.BusinessPartnnerID) {
                    const oContext = oModel.bindContext("/unlockUsers(...)", null, {idList: sBusinessPartnnerID});
                    oContext.execute();
                }
            }
        };
    });
    