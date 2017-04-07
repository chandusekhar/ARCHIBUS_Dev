var abEamLifecycleHActivitiesCrtController = View.createController('abEamLifecycleHActivitiesCrtController', {
	
	assetType: null,
	
	assetId: null,
	
	afterViewLoad: function(){
		this.abEamLifecycleHActivitiesCrt_form.addEventListener('afterGetData', this.afterGetDataEvent, this);
	},
	
	afterInitialDataFetch: function(){
		this.abEamLifecycleCrtActivitiesRefresh.refresh();
	},
	
	refreshView: function(){
		if(valueExistsNotEmpty(this.assetType) && valueExistsNotEmpty(this.assetId)){
			var restriction = new Ab.view.Restriction();
			if (this.assetType == 'bl') {
				restriction.addClause('hactivity_log.bl_id', this.assetId, '=');
				restriction.addClause('hactivity_log.bl_id', null, 'IS NOT NULL', 'AND', false);
			} else if (this.assetType == 'property') {
				restriction.addClause('hactivity_log.pr_id', this.assetId, '=');
				restriction.addClause('hactivity_log.pr_id', null, 'IS NOT NULL', 'AND', false);
			} else if (this.assetType == 'eq') {
				restriction.addClause('hactivity_log.eq_id', this.assetId, '=');
				restriction.addClause('hactivity_log.eq_id', null, 'IS NOT NULL', 'AND', false);
			} else if (this.assetType == 'ta') {
				restriction.addClause('hactivity_log.ta_id', this.assetId, '=');
				restriction.addClause('hactivity_log.ta_id', null, 'IS NOT NULL', 'AND', false);
			}
			this.abEamLifecycleHActivitiesCrt_form.refresh(restriction);
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
		// KB3049792 - oracle returns '(no value)' when no value is returned 
		for(var i = 0; i< dataSet.rowValues.length; i++){
			dataSet.rowValues[i].l = ((valueExistsNotEmpty(dataSet.rowValues[i].n) && "(no value)" != dataSet.rowValues[i].n) ? getMessage('labelActivityType_' + dataSet.rowValues[i].n) : getMessage('labelActivityType_empty'));
		}
	},
	
	onDrillDownEvent: function(assetType, assetId, activityType){
		var drillDownByActivityType = {
				'project_action': {'bl': 'ab-eam-lifecycle-proj-action-history.axvw', 'property': 'ab-eam-lifecycle-proj-action-history.axvw', 'eq':'ab-eam-lifecycle-proj-action-history.axvw', 'ta': 'ab-eam-lifecycle-proj-action-history.axvw'},
				'assessment': {'bl': 'ab-eam-lifecycle-assessment-history.axvw', 'property': 'ab-eam-lifecycle-assessment-history.axvw', 'eq':'ab-eam-lifecycle-assessment-history.axvw', 'ta': 'ab-eam-lifecycle-assessment-history.axvw'},
				'sustainability_assessment': {'bl': 'ab-eam-lifecycle-sust-assessment-history.axvw', 'property': 'ab-eam-lifecycle-sust-assessment-history.axvw', 'eq':'ab-eam-lifecycle-sust-assessment-history.axvw', 'ta': 'ab-eam-lifecycle-sust-assessment-history.axvw'},
				'commissioning': {'bl': 'ab-eam-lifecycle-commissioning-history.axvw', 'property': 'ab-eam-lifecycle-commissioning-history.axvw', 'eq':'ab-eam-lifecycle-commissioning-history.axvw', 'ta': 'ab-eam-lifecycle-commissioning-history.axvw'},
				'work_request': {'bl': 'ab-eam-lifecycle-wr.axvw', 'property': '', 'eq':'ab-eam-lifecycle-wr.axvw', 'ta': ''},
				'sd_furniture': {'bl': 'ab-eam-lifecycle-sd-action-history.axvw', 'property': 'ab-eam-lifecycle-sd-action-history.axvw', 'eq':'ab-eam-lifecycle-sd-action-history.axvw', 'ta': 'ab-eam-lifecycle-sd-action-history.axvw'},
				'sd_group_move': {'bl': 'ab-eam-lifecycle-sd-action-history.axvw', 'property': 'ab-eam-lifecycle-sd-action-history.axvw', 'eq':'ab-eam-lifecycle-sd-action-history.axvw', 'ta': 'ab-eam-lifecycle-sd-action-history.axvw'},
				'sd_individual_move': {'bl': 'ab-eam-lifecycle-sd-action-history.axvw', 'property': 'ab-eam-lifecycle-sd-action-history.axvw', 'eq':'ab-eam-lifecycle-sd-action-history.axvw', 'ta': 'ab-eam-lifecycle-sd-action-history.axvw'},
				'other': {'bl': 'ab-eam-lifecycle-other-action-history.axvw', 'property': 'ab-eam-lifecycle-other-action-history.axvw', 'eq':'ab-eam-lifecycle-other-action-history.axvw', 'ta': 'ab-eam-lifecycle-other-action-history.axvw'}
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
			restriction.addClause('hactivity_log.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('hactivity_log.status', ['COMPLETED', 'COMPLETED-V', 'CLOSED'], 'IN');
		} else if (activityType == 'work_request'){
			restriction.addClause('wrhwr.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('wrhwr.status', ['Com','Clo','Rej','S','Can'], 'IN');
		} else if (activityType == 'sd_furniture') {
            restriction.addClause('hactivity_log.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('hactivity_log.activity_type', 'SERVICE DESK - FURNITURE', '=');
		} else if (activityType == 'sd_group_move') {
            restriction.addClause('hactivity_log.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('hactivity_log.activity_type', 'SERVICE DESK - GROUP MOVE', '=');
		} else if (activityType == 'sd_individual_move') {
            restriction.addClause('hactivity_log.' + fieldNameByType[assetType], assetId, '=');
			restriction.addClause('hactivity_log.activity_type', 'SERVICE DESK - INDIVIDUAL MOVE', '=');
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
	var activityTypeClause = restriction.findClause('hactivity_log.activity_type');
	if(activityTypeClause){
		var activityType = activityTypeClause.value;
		var controller = View.controllers.get('abEamLifecycleHActivitiesCrtController');
		controller.onDrillDownEvent(controller.assetType, controller.assetId, activityType);
	}
}