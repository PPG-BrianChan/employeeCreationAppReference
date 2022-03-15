sap.ui.define([],
    function (){
        "use strict";
        return {
            ButtonClick: function(oEvent) {
                alert('ButtonClick');
                this._view.byId("ppg.ui::EmpCreationFormList--fe::FilterBar::EmpCreationForm")._createConditionModel();
            }
        };
    });
    