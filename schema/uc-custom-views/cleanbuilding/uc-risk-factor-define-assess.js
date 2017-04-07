var riskAssessDefinitionController = View.createController('riskAssessDefinitionController', {
    riskFactorAssessment_grid_onNewRiskAssessment: function(){
        View.openDialog('uc-risk-factor-edit-assess.axvw', null, true, {
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
    
    riskFactorAssessment_grid_editRiskAssessment_onClick: function(row){
        var riskFactor = row.record['uc_env_risk_assess.assess_id'];
        var restriction = {'uc_env_risk_assess.assess_id': riskFactor};
        View.openDialog('uc-risk-factor-edit-factor.axvw', restriction, false, {
            width: 400,
            height: 200,
            closeButton: false
        });
    }
});