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

            }
        };
    });
    