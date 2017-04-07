/*
 * 03/07/2010 IOAN KB 3026355
 * added opener grid panel for refresh after edit
 */
/*
 * This file goes together with ab-mo-common.js
 */
var controller = View.createController('ctrl_abMoGrEditEm',{
	
	openerPanel: null,
	 
	quest : null,
	
	afterInitialDataFetch: function(){
		this.form_abMoGroupEditEm.refresh(View.getOpenerView().restriction);
		if(View.getOpenerView().parameters){
			if(View.getOpenerView().parameters.openerPanel){
				this.openerPanel = View.getOpenerView().parameters.openerPanel;
			}
		}
		// createCheckbox_vacant_rooms() is in ab-mo-common.js
		createCheckbox_vacant_rooms(this.form_abMoGroupEditEm, "group");
	},
	
	form_abMoGroupEditEm_afterRefresh:function(){
		this.add_move_questions(this.form_abMoGroupEditEm);
		this.panel_abMoEditMoAssets_eq.refresh(this.form_abMoGroupEditEm.restriction);
		this.panel_abMoEditMoAssets_ta.refresh(this.form_abMoGroupEditEm.restriction);
		checkVacancyRoomsButton(this.form_abMoGroupEditEm.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
	},
	
	form_abMoGroupEditEm_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    }, 

    form_abMoGroupEditEm_onSaveButton : function() {
		if (this.form_abMoGroupEditEm.save()) {
			//kb 3033875 add call 'updateAssociatedServiceRequestStatus' logic syc assignment.
			// change parameter to mo and mo_id.
			var form = this.form_abMoGroupEditEm;
			var mo_id = form.getFieldValue('mo.mo_id');
            var project_id = form.getFieldValue('mo.project_id');
			var status = form.getFieldValue('mo.status');
			try { 

                Workflow.callMethod('AbMoveManagement-MoveService-updateAssociatedServiceRequestStatus', 'project', project_id);

				if("Approved-Cancelled"==status){
					Workflow.callMethod('AbMoveManagement-MoveService-onProcessDeleteRmpctRecord', 'mo', mo_id);
				}
			} catch (e) {
				Workflow.handleError(e);
				return false;
			}
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
