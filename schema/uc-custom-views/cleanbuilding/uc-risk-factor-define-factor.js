var riskFactorDefinitionController = View.createController('riskFactorDefinitionController', {
    riskFactors_grid_onNewRiskFactor: function(){
        View.openDialog('uc-risk-factor-edit-factor.axvw', null, true, {
            width: 400,
            height: 200,
            closeButton: false,
            afterViewLoad: function(dialogView){
                var form = dialogView.panels.get('riskFactors_form');
                if(form){
                    form.actions.get('delete').show(false);
                }
            }
        });
    },
    
    riskFactors_grid_editRiskFactor_onClick: function(row){
        var riskFactor = row.record['uc_env_factor.factor_id'];
        var restriction = {'uc_env_factor.factor_id': riskFactor};
        View.openDialog('uc-risk-factor-edit-factor.axvw', restriction, false, {
            width: 400,
            height: 200,
            closeButton: false
        });
    },
    
    riskFactorLevels_grid_onNewRiskFactorLevel: function(){
        var parentFactorId = this.riskFactorLevels_grid.restriction['uc_env_factor.factor_id'];
        View.openDialog('uc-risk-factor-edit-level.axvw', null, true, {
            width: 400,
            height: 200,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                var form = dialogView.panels.get('riskFactorLevels_form');
                if(form){
                    form.actions.get('delete').show(false);
                    form.setFieldValue('uc_env_factor_level.factor_id', parentFactorId);
                }
            }
        });
    },
    
    riskFactorLevels_grid_editRiskFactorLevel_onClick: function(row){
        var riskFactorLevel = row.record['uc_env_factor_level.level_id'];
        var restriction = {'uc_env_factor_level.level_id': riskFactorLevel};
        View.openDialog('uc-risk-factor-edit-level.axvw', restriction, false, {
            width: 400,
            height: 200,
            closeButton: false
        });
    }
});