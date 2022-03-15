sap.ui.define([],
    function (){
        "use strict";
        return {
            ButtonClick: function() {
                var oFilterBar = this._view.byId("ppg.ui::EmpCreationFormList--fe::FilterBar::EmpCreationForm"),
                    oConditions = oFilterBar._oConditionModel.oData.conditions;
                for (var variable in oConditions) {
                    if(variable !== "$editState" && oConditions[variable].length !== 0){
                        oConditions[variable] = [];
                    }  
                }
                oFilterBar._oConditionModel.refresh();
            }
        };
    });
    