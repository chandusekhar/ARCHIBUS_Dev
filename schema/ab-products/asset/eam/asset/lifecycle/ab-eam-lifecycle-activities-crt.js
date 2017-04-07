var abEamLifecycleActivitiesCrtController = View.createController('abEamLifecycleActivitiesCrtController', {
	
	assetType: null,
	
	assetId: null,
	
	afterViewLoad: function(){
		this.abEamLifecycleActivitiesCrt_form.addEventListener('afterGetData', this.afterGetDataEvent, this);
	},
	
	afterInitialDataFetch: function(){
		this.abEamLifecycleCrtActivitiesRefresh.refresh();
	},
	
	refreshView: function(){
		if(valueExistsNotEmpty(this.assetType) && valueExistsNotEmpty(this.assetId)){
			var restriction = new Ab.view.Restriction();
			if (this.assetType == 'bl') {
				restriction.addClause('activity_log.bl_id', this.assetId, '=');
				restriction.addClause('activity_log.bl_id', null, 'IS NOT NULL', 'AND', false);
			} else if (this.assetType == 'property') {
				restriction.addClause('activity_log.pr_id', this.assetId, '=');
				restriction.addClause('activity_log.pr_id', null, 'IS NOT NULL', 'AND', false);
			} else if (this.assetType == 'eq') {
				restriction.addClause('activity_log.eq_id', this.assetId, '=');
				restriction.addClause('activity_log.eq_id', null, 'IS NOT NULL', 'AND', false);
			} else if (this.assetType == 'ta') {
				restriction.addClause('activity_log.ta_id', this.assetId, '=');
				restriction.addClause('activity_log.ta_id', null, 'IS NOT NULL', 'AND', false);
			}
			this.abEamLifecycleActivitiesCrt_form.refresh(restriction);
		}
	},
	
	getInputParameters: function(){
		var restriction = null;
		
		if(valueExists(this.view.restriction)){
			restriction = this.view.restriction;
		}
		
		if(valueExists(this.view.getParentTab()) 
				&& valueExists(this.view.getParentTab().restriction)){
			restriction = this.view.getParentTab().restriction;
		}
		
		if(valueExists(this.view.getOpenerView()) 
				&& valueExists(this.view.getOpenerView().restriction)){
			restriction = this.view.getOpenerView().restriction;
		}
		
		if(valueExists(restriction)){
			var typeClause = restriction.findClause('bl.asset_type');
			if(typeClause){
				this.assetType = typeClause.value;
			}
			var idClause = restriction.findClause('bl.asset_id');
			if(idClause){
				this.assetId = idClause.value;
			}
		}
	},
	
	abEamLifecycleCrtActivitiesRefresh_afterRefresh: function(){
		this.getInputParameters();
		this.refreshView();
	},
	
	afterGetDataEvent: function(panel, dataSet){
		// localize activity types
		// KB3049792 - oracle add '(no value)' when no value is returned 
		for(var i = 0; i< dataSet.rowValues.length; i++){
			dataSet.rowValues[i].l = ((valueExistsNotEmpty(dataSet.rowValues[i].n) && "(no value)" != dataSet.rowValues[i].n) ? getMessage('labelActivityType_' + dataSet.rowValues[i].n) : getMessage('labelActivityType_empty'));
		}
	},
	
	onDrillDownEvent: function(assetType, assetId, activityType){
		var drillDownByActivityType = {
				'project_action': {'bl': 'ab-eam-lifecycle-proj-action.axvw', 'property': 'ab-eam-lifecycle-proj-action.axvw', 'eq':'ab-eam-lifecycle-proj-action.axvw', 'ta': 'ab-eam-lifecycle-proj-action.axvw'},
				'assessment': {'bl': 'ab-eam-lifecycle-assessment.axvw', 'property': 'ab-eam-lifecycle-assessment.axvw', 'eq':'ab-eam-lifecycle-assessment.axvw', 'ta': 'ab-eam-lifecycle-assessment.axvw'},
				'sustainability_assessment': {'bl': 'ab-eam-lifecycle-sust-assessment.axvw', 'property': 'ab-eam-lifecycle-sust-assessment.axvw', 'eq':'ab-eam-lifecycle-sust-assessment.axvw', 'ta': 'ab-eam-lifecycle-sust-assessment.axvw'},
				'commissioning': {'bl': 'ab-eam-lifecycle-commissioning.axvw', 'property': 'ab-eam-lifecycle-commissioning.axvw', 'eq':'ab-eam-lifecycle-commissioning.axvw', 'ta': 'ab-eam-lifecycle-commissioning.axvw'},
				'moves': {'bl': '', 'property': '', 'eq':'ab-eam-lifecycle-mo-eq.axvw', 'ta': 'ab-eam-lifecycle-mo-ta.axvw'},
				'survey': {'bl': '', 'property': '', 'eq':'ab-eam-lifecycle-eq-audit.axvw', 'ta': 'ab-eam-lifecycle-ta-audit.axvw'},
				'work_request': {'bl': 'ab-eam-lifecycle-wr.axvw', 'property': '', 'eq':'ab-eam-lifecycle-wr.axvw', 'ta': ''},
				'owner_transaction': {'bl': 'ab-eam-lifecycle-ot-bl.axvw', 'property': 'ab-eam-lifecycle-ot-pr.axvw', 'eq':'', 'ta': ''},
				'waste_out': {'bl': 'ab-eam-lifecycle-waste-out.axvw', 'property': 'ab-eam-lifecycle-waste-out.axvw', 'eq':'ab-eam-lifecycle-waste-out.axvw', 'ta': ''},
				'sd_furniture': {'bl': 'ab-eam-lifecycle-sd-action.axvw', 'property': 'ab-eam-lifecycle-sd-action.axvw', 'eq':'ab-eam-lifecycle-sd-action.axvw', 'ta': 'ab-eam-lifecycle-sd-action.axvw'},
				'sd_group_move': {'bl': 'ab-eam-lifecycle-sd-action.axvw', 'property': 'ab-eam-lifecycle-sd-action.axvw', 'eq':'ab-eam-lifecycle-sd-action.axvw', 'ta': 'ab-eam-lifecycle-sd-action.axvw'},
				'sd_individual_move': {'bl': 'ab-eam-lifecycle-sd-action.axvw', 'property': 'ab-eam-lifecycle-sd-action.axvw', 'eq':'ab-eam-lifecycle-sd-action.axvw', 'ta': 'ab-eam-lifecycle-sd-action.axvw'},
				'other': {'bl': 'ab-eam-lifecycle-other-action.axvw', 'property': 'ab-eam-lifecycle-other-action.axvw', 'eq':'ab-eam-lifecycle-other-action.axvw', 'ta': 'ab-eam-lifecycle-other-action.axvw'}
		};
		if(activityType == ''){// other
			activityType = 'other';
		}
		
		var drillDownView = drillDownByActivityType[activityType][assetType];
		if (valueExistsNotEmpty(drillDownView)){
			var restriction = this.getDrillDownRestriction(assetType, assetId, activityType);
			
			View.getOpenerView().openDialog(drillDownView, restriction, false, {
				width: 1024,
				height:800,
				closeButton: true
			});
		}
	},
	
	getDrillDownRestriction: function(assetType, assetId, activityType){
		var fieldNameByType = {'bl': 'bl_id', 'property': 'pr_id', 'eq': 'eq_id', 'ta': 'ta_id'};
		var restriction = new Ab.view.Restriction();
		if(activityType == 'project_action' || activityType == 'assessment' 
			|| activityType == 'sustainability_assessment' || activityType == 'commissioning' || activityType == 'other'){
			restriction.addClause('activity_log.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('activity_log.status', ['COMPLETED', 'COMPLETED-V', 'CLOSED'], 'NOT IN');
		} else if (activityType == 'moves'){
			if(assetType == 'eq'){
				restriction.addClause('mo_eq.' + fieldNameByType[assetType], assetId, '=');
			}else if (assetType == 'ta'){
				restriction.addClause('mo_ta.' + fieldNameByType[assetType], assetId, '=');
			}
		}else if (activityType == 'survey'){
			if(assetType == 'eq'){
				restriction.addClause('eq_audit.' + fieldNameByType[assetType], assetId, '=');
			}else if (assetType == 'ta'){
				restriction.addClause('ta_audit.' + fieldNameByType[assetType], assetId, '=');
			}
		} else if (activityType == 'work_request'){
			restriction.addClause('wrhwr.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('wrhwr.status', ['R','Rev','A','AA','I','HP','HA','HL'], 'IN');
		} else if (activityType == 'owner_transaction'){
			restriction.addClause('ot.' + fieldNameByType[assetType], assetId, '=');
		} else if (activityType == 'waste_out'){
			restriction.addClause('waste_out.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('waste_out.status', ['A', 'S'], 'IN');
		} else if (activityType == 'sd_furniture') {
            restriction.addClause('activity_log.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('activity_log.activity_type', 'SERVICE DESK - FURNITURE', '=');
		} else if (activityType == 'sd_group_move') {
            restriction.addClause('activity_log.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('activity_log.activity_type', 'SERVICE DESK - GROUP MOVE', '=');
		} else if (activityType == 'sd_individual_move') {
            restriction.addClause('activity_log.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('activity_log.activity_type', 'SERVICE DESK - INDIVIDUAL MOVE', '=');
		}
		return restriction;
	}
});

/**
 * On drill down event
 * @param context command context
 */
function onDrillDown(context){
	var restriction = context.restriction;
	var activityTypeClause = restriction.findClause('activity_log.activity_type');
	if(activityTypeClause){
		var activityType = activityTypeClause.value;
		var controller = View.controllers.get('abEamLifecycleActivitiesCrtController');
		controller.onDrillDownEvent(controller.assetType, controller.assetId, activityType);
	}
}