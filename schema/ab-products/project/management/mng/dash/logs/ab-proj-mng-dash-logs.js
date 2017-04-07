var projMngDashLogsController = View.createController('projMngDashLogs',{	

	menuObj: null,
	menuAddNew: new Array('comm1','comm2','comm3','comm4'),
	project_id: '',
	collapsed: true,
	
	afterInitialDataFetch: function(){
		var titleObjAddNew = Ext.get('addNewComm');
	    titleObjAddNew.on('click', this.showAddNewMenu, this, null);
	    this.projMngDashLogsFilter_onShowMoreFields(false);
	},
	
	projMngDashLogsFilter_onToggleMoreFields: function(panel, action) {
		this.projMngDashLogsFilter_onShowMoreFields(this.collapsed);
    	this.collapsed = !this.collapsed;
    	action.setTitle(this.collapsed ?
                getMessage('filterMore') : getMessage('filterLess'));
    },
    
    projMngDashLogsFilter_onShowMoreFields: function(show) {
		this.projMngDashLogsFilter.showField('ls_comm.activity_log_id', show);
	    this.projMngDashLogsFilter.showField('ls_comm.contact_id', show);
	    this.projMngDashLogsFilter.showField('ls_comm.comm_type', show);
	    this.projMngDashLogsFilter.showField('ls_comm.recorded_by', show);
    },
	
	projMngDashLogsFilter_afterRefresh: function() {
		this.project_id = this.getProjectId();
		this.projMngDashLogsFilter_onClear();
	},
	
	projMngDashLogsFilter_onClear: function() {
		this.projMngDashLogsFilter.setFieldValue('ls_comm.comm_type', '');
		this.projMngDashLogsFilter.setFieldValue('ls_comm.contact_id', '');
		this.projMngDashLogsFilter.setFieldValue('ls_comm.activity_log_id', ''); 
		this.projMngDashLogsFilter.setFieldValue('ls_comm.recorded_by', ''); 
		$('projMngDashDashLogsFilter_selectPriority').value = 'All';
		
		/* get filter restriction from alerts selection */
    	var openerController = View.getOpenerView().controllers.get('projMng');
    	if(openerController){
        	var alertsFilter = openerController.alertsFilter;
        	if (alertsFilter) {
        		switch(alertsFilter) {
    	    		case 'high': 
    	    			$('projMngDashDashLogsFilter_selectPriority').value = 'High';
    	    			break;
    	    		case 'urgent':
    	    			$('projMngDashDashLogsFilter_selectPriority').value = 'Urgent';
    	    			break;
        		}
        		openerController.alertsFilter = '';
        	}
    	}
    	
		this.projMngDashLogsFilter_onFilter();
	},
	
	projMngDashLogsFilter_onSetFilter: function() {
		this.projMngDashLogsFilter_onFilter();
	},
	
	projMngDashLogsFilter_onFilter: function() {
		var priority = $('projMngDashDashLogsFilter_selectPriority').value;
		var comm_type = this.projMngDashLogsFilter.getFieldValue('ls_comm.comm_type');
		var contact_id = this.projMngDashLogsFilter.getFieldValue('ls_comm.contact_id');
		var activity_log_id = this.projMngDashLogsFilter.getFieldValue('ls_comm.activity_log_id');
		var recorded_by = this.projMngDashLogsFilter.getFieldValue('ls_comm.recorded_by');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_comm.project_id', this.project_id);
		if (priority != 'All') restriction.addClause('ls_comm.priority', priority);
		if (!this.collapsed) {
			if (comm_type) restriction.addClause('ls_comm.comm_type', comm_type);
			if (contact_id) restriction.addClause('ls_comm.contact_id', contact_id);
			if (activity_log_id) restriction.addClause('ls_comm.activity_log_id', activity_log_id);
			if (recorded_by) restriction.addClause('ls_comm.recorded_by', recorded_by);
		}
		this.projMngDashLogsGrid.refresh(restriction);    
	},
	
	projMngDashLogsGrid_afterRefresh: function() {
		this.projMngDashLogsGrid.gridRows.each(function (row) {
		   var record = row.getRecord(); 		   
		   var alert_icon = row.actions.get('alert_icon');
		   var priority = record.getValue('ls_comm.priority');
		   if (priority == 'High' || priority == 'Urgent') {		  
			   alert_icon.show(true);
		   }
		   else alert_icon.show(false);	
		   
		   var doc_icon = row.actions.get('doc_icon');
		   var doc = record.getValue('ls_comm.doc');
		   if (doc != '') {
			   doc_icon.show(true);
		   } else doc_icon.show(false);
		});
	},
	
	showAddNewMenu: function(e, item){
		this.showMenu(e, this.menuAddNew, this.onAddNewButtonPush);
	},
	
	showMenu: function(e, menuArr, handler){
		var menuItems = [];
		for(var i = 0; i < menuArr.length; i++){
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: getMessage('menu_' + menuArr[i]),
				handler: handler.createDelegate(this, [menuArr[i]])});
	
			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.showAt(e.getXY());
	},
	
	onAddNewButtonPush: function(menuItemId){
		var project_id = this.getProjectId();
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_comm.project_id', project_id);
		switch(menuItemId) {
		case 'comm1':
			restriction.addClause('ls_comm.comm_type', 'Notice');
			break;
		case 'comm2':
			restriction.addClause('ls_comm.comm_type', 'Correspondence');
			break;
		case 'comm3':
			restriction.addClause('ls_comm.comm_type', 'Meeting Minutes');
			break;		
		}
	    
		var projectRestriction = new Ab.view.Restriction();
		projectRestriction.addClause('project.project_id', project_id);
		View.openDialog('ab-proj-mng-dash-logs-add.axvw', restriction, true, {
			callback: function() {
				View.controllers.get('projMngDashLogs').projMngDashLogsFilter_onClear();
		    }
		});	    
	},
	
	projMngDashLogsGrid_onSelectDoc: function(obj) {
	    var record = this.projMngDashLogs_ds0.getRecord(obj.restriction);
	    var auto_number = record.getValue('ls_comm.auto_number');
	    var commDocFileName = record.getValue('ls_comm.doc');
	    var keys = {'auto_number': auto_number}; 
		View.showDocument(keys, 'ls_comm', 'doc', commDocFileName); 
	},
	
	getProjectId: function(){
		var projectId = null;
		if(valueExists(View.getOpenerView().controllers.get('projMng'))){
			projectId = View.getOpenerView().controllers.get('projMng').project_id;
		} else if (valueExists(this.view.restriction)){
			var clause = this.view.restriction.findClause('project.project_id');
			if(clause){
				projectId = clause.value;
			}
		}
		return projectId;
	}
});

function projMngDashLogsFilter_typeSelval() {
var controller = View.controllers.get('projMngDashLogs');
View.selectValue('projMngDashLogsFilter',
		getMessage('commtypes'),
		['ls_comm.comm_type'],
		'commtype',
		['commtype.comm_type'],
		['commtype.comm_type'],
		"EXISTS (SELECT 1 FROM ls_comm WHERE ls_comm.comm_type = commtype.comm_type AND ls_comm.project_id = '"+controller.project_id+"')");
}

function projMngDashLogsFilter_actSelval() {
var controller = View.controllers.get('projMngDashLogs');
View.selectValue('projMngDashLogsFilter',
		getMessage('actions'),
		['ls_comm.activity_log_id'],
		'activity_log',
		['activity_log.activity_log_id'],
		['activity_log.wbs_id', 'activity_log.work_pkg_id','activity_log.action_title','activity_log.activity_type','activity_log.status','activity_log.activity_log_id'],
		"EXISTS (SELECT 1 FROM ls_comm WHERE ls_comm.activity_log_id = activity_log.activity_log_id AND ls_comm.project_id = '"+controller.project_id+"')");
}

function projMngDashLogsFilter_contactSelval() {
var controller = View.controllers.get('projMngDashLogs');
View.selectValue('projMngDashLogsFilter',
		getMessage('contacts'),
		['ls_comm.contact_id'],
		'contact',
		['contact.contact_id'],
		['contact.contact_id','contact.name_first','contact.name_last','contact.contact_type','contact.company','contact.city_id','contact.state_id','contact.ctry_id'],
		"EXISTS (SELECT 1 FROM ls_comm WHERE ls_comm.contact_id = contact.contact_id AND ls_comm.project_id = '"+controller.project_id+"')");
}

function projMngDashLogsFilter_recBySelval() {
	var controller = View.controllers.get('projMngDashLogs');
	View.selectValue('projMngDashLogsFilter',
			getMessage('recBy'),
			['ls_comm.recorded_by'],
			'em',
			['em.em_id'],
			['em.em_id','em.name_first','em.name_last','em.em_std','em.bl_id','em.dv_id','em.dp_id'],
			"EXISTS (SELECT 1 FROM ls_comm WHERE ls_comm.recorded_by = em.em_id AND ls_comm.project_id = '"+controller.project_id+"')");
}

