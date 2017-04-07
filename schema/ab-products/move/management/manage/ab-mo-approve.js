var abMoveExamineCtrl = View.createController('abMoveExamineCtrl',{
});

function abMoveExamine_showHideForm(clickEvent, show){
	if(this.abMoveExamineCtrl.panel_abMoveApprove_form) {
		this.abMoveExamineCtrl.panel_abMoveApprove_form.loadView();
		var formContent = this.abMoveExamineCtrl.panel_abMoveApprove_form.contentView;
		if(formContent == null)
			return;
			
		if(show) {
			formContent.panels.get("panel_abMoveApproveForm").refresh(clickEvent.getRestriction());
			if(formContent.panels.get("panel_abMoveApproveForm_actions")){
				formContent.panels.get("panel_abMoveApproveForm_actions").refresh(clickEvent.getRestriction());
			}
			formContent.panels.get("panel_abMoEditMoAssets_eq").refresh(clickEvent.getRestriction());
			formContent.panels.get("panel_abMoEditMoAssets_ta").refresh(clickEvent.getRestriction());
		} else {
			formContent.panels.get("panel_abMoveApproveForm").show(false);
			if(formContent.panels.get("panel_abMoveApproveForm_actions")){
				formContent.panels.get("panel_abMoveApproveForm_actions").show(false);
			}
			formContent.panels.get("panel_abMoEditMoAssets_eq").show(false);
			formContent.panels.get("panel_abMoEditMoAssets_ta").show(false);
		}
	}
}

