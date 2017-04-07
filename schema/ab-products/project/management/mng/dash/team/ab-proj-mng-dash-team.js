var projMngDashTeamController = View.createController('projMngDashTeam', {
	
	menuObj: null,
	menuAddNew: new Array('add1','add2','add3','add4'),
	projectRestriction: null,
	project_id: '',
	
    afterInitialDataFetch: function(){
    	var titleObjAddNew = Ext.get('addNewMember');
        titleObjAddNew.on('click', this.showAddNewMenu, this, null);
    },
    
    projMngDashTeamFilter_afterRefresh: function() {
    	this.project_id = this.getProjectId();
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('project.project_id', this.project_id);
    	this.projectRestriction = restriction;
    	
    	this.projMngDashTeamFilter_onClear();
    },
    
    projMngDashTeamFilter_onClear: function() {
    	$('projMngDashTeamFilter_show').value = 'all';
    	
    	this.projMngDashTeamFilter_onFilter();
    },
    
    projMngDashTeamFilter_onFilter: function() {
    	var source_table = $('projMngDashTeamFilter_show').value;
    	var restriction = " projteam.project_id = '" + getValidRestVal(this.project_id) + "'";
    	if (source_table != 'all') restriction += " AND projteam.source_table = '" + source_table + "'";
    	this.projMngDashTeamGrid.refresh(restriction);    	
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
		var projectRestriction = new Ab.view.Restriction();
		projectRestriction.addClause('project.project_id', project_id);
		var viewName = '';
		switch(menuItemId) {
			case 'add1':
				viewName = 'ab-proj-mng-dash-team-em.axvw';
				break;
			case 'add2':
				viewName = 'ab-proj-mng-dash-team-vn.axvw';
				break;
			case 'add3':
				viewName = 'ab-proj-mng-dash-team-cf.axvw';
				break;		
			case 'add4':
				viewName = 'ab-proj-mng-dash-team-contact.axvw';
				break;
		}
		View.openDialog(viewName, null, false, {
			callback: function() {
		        View.controllers.get('projMngDashTeam').projMngDashTeamFilter_onClear();
		    }
		});
	},
	
	projMngDashTeamGrid_onEdit: function(obj) {
		var member_id = obj.restriction['projteam.member_id'];
		var project_id = this.getProjectId();
		var restriction = new Ab.view.Restriction();
		restriction.addClause('projteam.member_id', member_id);
		restriction.addClause('projteam.project_id', project_id);
		View.openDialog('ab-proj-mng-dash-team-edit.axvw', restriction);
	},
	
	addMember: function(member) {
		var project_id = this.getProjectId();
		var restriction = new Ab.view.Restriction();
		restriction.addClause('projteam.member_id', member.getValue('projteam.member_id'));
		restriction.addClause('projteam.project_id', project_id);
		var existingRecords = this.projMngDashTeam_ds0.getRecords(restriction);
		if (existingRecords.length > 0) return;
		
		member.setValue('projteam.project_id', project_id);
		this.projMngDashTeam_ds0.saveRecord(member);
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
