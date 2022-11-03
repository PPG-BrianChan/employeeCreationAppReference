sap.ui.define([],
    function (){
        "use strict";
        return {
            ButtonClick: function() {
                var oFilterBar = this._view.byId("ppg.ui::EmpCreationFormList--fe::FilterBar::EmpCreationForm"),
                    oTable = this._view.byId("ppg.ui::EmpCreationFormList--fe::table::EmpCreationForm::LineItem-innerTable"),
                    oConditions = oFilterBar._oConditionModel.oData.conditions;
                for (var variable in oConditions) {
                    if(variable !== "$editState" && oConditions[variable].length !== 0){
                        oConditions[variable] = [];
                    }  
                }
                oFilterBar._oConditionModel.refresh();
                oFilterBar.setFilterConditions(null);
                oTable.setShowOverlay(true)
            },

            lockButtonClick: function () {
                const oTable = this._view.byId("ppg.ui::EmpCreationFormList--fe::table::EmpCreationForm::LineItem-innerTable"),
                    aSelectedItems = oTable.getSelectedItems(),
                    oModel = oTable.getModel();
                let sSelectedIds = '';
                aSelectedItems.forEach( selectedItem => {
                    let oBPobject = selectedItem.getBindingContext().getObject(),
                        sSelectedId = oBPobject.ID;
                    if (oBPobject.BusinessPartnnerID) 
                     sSelectedIds += sSelectedId + ',';
                });
                if (sSelectedIds.length > 0) {
                    var oContext = oModel.bindContext("/lockUsers(...)", null, {idList: sSelectedIds});
                    oContext.execute();
                }
            },

            unlockButtonClick: function () {
                const oTable = this._view.byId("ppg.ui::EmpCreationFormList--fe::table::EmpCreationForm::LineItem-innerTable"),
                    aSelectedItems = oTable.getSelectedItems(),
                    oModel = oTable.getModel();
                let sSelectedIds = '';
                aSelectedItems.forEach( selectedItem => {
                    let oBPobject = selectedItem.getBindingContext().getObject(),
                        sSelectedId = oBPobject.ID;
                    if (oBPobject.BusinessPartnnerID) 
                     sSelectedIds += sSelectedId + ',';
                });
                if (sSelectedIds.length > 0) {
                    var oContext = oModel.bindContext("/unlockUsers(...)", null, {idList: sSelectedIds});
                    oContext.execute();
                }
            }
        };
    });
    