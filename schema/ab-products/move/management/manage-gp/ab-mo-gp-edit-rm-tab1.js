/*
 * This file goes together with ab-mo-common.js
 */
var controller = View.createController('ctrl_abMoGrEditRm',{
	
	openerPanel: null,
	
	quest : null,
	
	afterInitialDataFetch: function(){
		this.form_abMoGroupEditRm.refresh(View.getOpenerView().restriction);
		if(View.getOpenerView().parameters){
			if(View.getOpenerView().parameters.openerPanel){
				this.openerPanel = View.getOpenerView().parameters.openerPanel;
			}
		}
		// createCheckbox_vacant_rooms() is in ab-mo-common.js
		createCheckbox_vacant_rooms(this.form_abMoGroupEditRm, "group");
	},
	
	form_abMoGroupEditRm_afterRefresh:function(){
		this.add_move_questions(this.form_abMoGroupEditRm);
		
		this.panel_abMoEditMoAssets_eq.refresh(this.form_abMoGroupEditRm.restriction);
		this.panel_abMoEditMoAssets_ta.refresh(this.form_abMoGroupEditRm.restriction);
		
		checkVacancyRoomsButton(this.form_abMoGroupEditRm.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
	},
	
	form_abMoGroupEditRm_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    }, 
	
    form_abMoGroupEditRm_onSaveButton : function() {
		if (this.form_abMoGroupEditRm.save()) {
			if(this.openerPanel != null){
				this.openerPanel.refresh();
			}
		}
    },
	
	add_move_questions : function(targetForm) {
		var mo_type = targetForm.getFieldValue('mo.mo_type');
		var q_id = 'Move Order - ' + mo_type;
		this.quest = new Ab.questionnaire.Quest(q_id, targetForm.id);		
	}
	
	
});
