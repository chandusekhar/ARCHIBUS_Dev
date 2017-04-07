/*
brg-ims-fnstd.js

aso 12.23.2009 -add function brgImsFnstd_detailsPanel_afterRefresh() 
				- refresh the brgImsFnstd_finishesPanel and brgImsFnstd_subsPanel properly when user click on the add new button from the left panel

*/
var cntrl = View.createController('cntrl', {
	primaryKeyRecord: null,
	
	programgroupGrid_onAddgroups: function() {
	

		var formId = 'programgroupGrid'
		var ds = this.programgroupGrid.dataSourceId
		var title = 'Program Groups'
		var targetFieldNames  = ['em_programgroup.program_group','em_programgroup.em_id']
		var selectTableName = 'programgroup'
		var selectFieldNames = ['programgroup.program_group', this.emForm.getFieldValue('em.em_id')]
		var visibleFieldNames =  ['programgroup.program_group', 'programgroup.description']
 		var restriction =  "not exists (select 1 from em_programgroup e where e.program_group=programgroup.program_group and e.em_id='" + this.emForm.getFieldValue('em.em_id') + "')"
		var actionListener = null
		var applyFilter= null
		var showIndex= null
		var workflowRuleId= null
		var width= null
		var height= null
		var selectValueType= null
		var recordLimit= null
		var sortValues= null
		
		//this.selectValue(null, title, targetFieldNames, selectTableName, selectFieldNames, visibleFieldNames)
		
		 //View.openDialog('brg-ims-ms-finishes.axvw', restriction, false, {width: 800, height: 600, closeButton: true });
		multiselectValue(formId, ds, title, targetFieldNames, selectTableName, selectFieldNames, visibleFieldNames,restriction) 
                        //  , actionListener, applyFilter, showIndex, workflowRuleId, width, height,selectValueType, recordLimit, sortValues)
	},
	
	emGrid_onAddems: function() {
	

		var formId = 'emGrid'
		var ds = this.emGrid.dataSourceId
		var title = 'Employees'
		var targetFieldNames  = ['em_programgroup.em_id','em_programgroup.program_group']
		var selectTableName = 'em'
		var selectFieldNames = ['em.em_id', this.programgroupForm.getFieldValue('programgroup.program_group')]
		var visibleFieldNames =  ['em.em_id', 'em.name_first', 'em.name_last']
 		var restriction =  "exists (select 1 from afm_users u where u.email=em.email and u.role_name='UC-PMOADMIN') and not exists (select 1 from em_programgroup e where e.em_Id=em.em_Id and e.program_group='" + this.programgroupForm.getFieldValue('em_programgroup.program_group') + "')"
		var actionListener = null
		var applyFilter= null
		var showIndex= null
		var workflowRuleId= null
		var width= null
		var height= null
		var selectValueType= null
		var recordLimit= null
		var sortValues= null
		
		//this.selectValue(null, title, targetFieldNames, selectTableName, selectFieldNames, visibleFieldNames)
		
		 //View.openDialog('brg-ims-ms-finishes.axvw', restriction, false, {width: 800, height: 600, closeButton: true });
		multiselectValue(formId, ds, title, targetFieldNames, selectTableName, selectFieldNames, visibleFieldNames,restriction) 
                        //  , actionListener, applyFilter, showIndex, workflowRuleId, width, height,selectValueType, recordLimit, sortValues)
	}
	
	
});
		