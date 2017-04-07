var lsadminLeaseInfoController = View.createController('lsadminLeaseInfo', {
	bl_id:'',
	pr_id:'',
	ls_id:'',
	menuParent:null,
	menu: new Array('lease', 'building', 'land', 'structure'),
	reportLease_beforeRefresh:function(){
		this.reportLease.addParameter("status_active", getMessage("status_active"));
		this.reportLease.addParameter("status_inactive", getMessage("status_inactive"));
	},
	
	reportLease_afterRefresh:function(){
		this.reportLease.actions.get('edit').show(this.reportLease.getFieldValue('ls.ls_id')!='');
		this.reportLease.actions.get('reports').show(this.reportLease.getFieldValue('ls.ls_id')!='');
		/*
		 * 04/26/2010 IOAN KB 3027217
		 * Show only menus for selected item type
		 * lease details appear always
		 * buildin, land  and structure appear based on user selection
		 */
		var ls_id = this.reportLease.getFieldValue('ls.ls_id');
		if(valueExistsNotEmpty(ls_id)){
			this.ls_id = ls_id;
		}
		this.menu = new Array('lease');
		var bl_id = this.reportLease.getFieldValue('ls.bl_id');
		if(valueExistsNotEmpty(bl_id)){
			this.menu.push('building');
			var value = '<a href="javascript:void(0)" onClick="openReport(\'BUILDING\', \''+bl_id+'\');">'+bl_id+'</a>';
			this.reportLease.setFieldValue('ls.bl_id', value);
			this.bl_id = bl_id;
		}else{
			this.bl_id = '';
		}
		var pr_id = this.reportLease.getFieldValue('ls.pr_id');
		if(valueExistsNotEmpty(pr_id)){
			var value = '<a href="javascript:void(0)" onClick="openReport(\'PROPERTY\', \''+pr_id+'\');">'+pr_id+'</a>';
			this.reportLease.setFieldValue('ls.pr_id', value);
			var property_type = this.reportLease.record.getValue('ls.pr_type');
			if(property_type == 'Land'){
				this.menu.push('land');
			}else if(property_type == 'Structure'){
				this.menu.push('structure');
			}
			this.pr_id = pr_id;
		}else{
			this.pr_id = '';
		}
	},
	afterViewLoad:function(){
		this.menuParent = Ext.get('reports');
		this.menuParent.on('click', this.showMenu, this, null);
		if(View.getOpenerView().controllers.get('lsadminLeaseInfo')){
			this.ls_id = View.getOpenerView().controllers.get('lsadminLeaseInfo').ls_id;
		}
		var lsRestr = new Ab.view.Restriction();
		lsRestr.addClause('ls.ls_id', this.ls_id, '=');
		this.reportLease.refresh(lsRestr);
	},
	formLeaseDetails_onSave: function(){
		this.reportLease.refresh();
	},
	showMenu: function(e, item){
		var menuItems = [];
		for(var i=0;i<this.menu.length;i++){
			var type = this.menu[i];
			menuItem = new Ext.menu.Item({
				text: getMessage('menu_' + type),
				handler: reports.createDelegate(this, [type])});
			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.show(this.menuParent, 'tl-bl?');
	}
})

function openReport(type, item){
	if(type == 'BUILDING'){
	    View.openDialog('ab-rplm-lsadmin-portfolio-bldginfo.axvw', null, true, {
	        width: 1000,
	        height: 400,
	        closeButton: false,
	        afterInitialDataFetch: function(dialogView){
	            var dialogController = dialogView.controllers.get('leaseAdminBldgInfo');
				dialogController.bl_id = item;
				dialogController.initView();
	        }
	    });
	}else{
	    View.openDialog('ab-rplm-lsadmin-portfolio-propertyinfo.axvw', null, true, {
	        width: 1000,
	        height: 400,
	        closeButton: false,
	        afterInitialDataFetch: function(dialogView){
	            var dialogController = dialogView.controllers.get('leaseAdminPropertyInfo');
				dialogController.pr_id = item;
				dialogController.initView();
	        }
	    });
	}
}

function reports(type){
	var page;
	var controller;
	var ls_id = lsadminLeaseInfoController.ls_id;
	var pr_id = lsadminLeaseInfoController.pr_id;
	var bl_id = lsadminLeaseInfoController.bl_id;
	var property_type = lsadminLeaseInfoController.reportLease.record.getValue('ls.pr_type');
	switch(type){
		case 'lease':{
			page = 'ab-rplm-lsadmin-leases-details-report-report.axvw';
			controller = 'repLeaseDetails';
			break;
		}
		case 'building':{
			page = 'ab-rplm-lsadmin-owned-bldg-details-report-report.axvw';
			controller = 'repOwnBuilding';
			break;
		}
		case 'land':{
			page = 'ab-rplm-lsadmin-owned-land-details-report-report.axvw';
			controller = 'repOwnLand';
			break;
		}
		case 'structure':{
			page = 'ab-rplm-lsadmin-owned-struc-details-report-report.axvw';
			controller = 'repOwnStructure';
			break;
		}
	}
    View.openDialog(page, null, true, {
        width: 1000,
        height: 400,
        closeButton: false,
        afterInitialDataFetch: function(dialogView){
            var dialogController = dialogView.controllers.get(controller);
            dialogController.ls_id = ls_id;
			dialogController.bl_id = bl_id;
			dialogController.pr_id = pr_id;
			dialogController.initializeView();
        }
    });
}

//enable/disable 'ls.ls_parent_id' field is 'ls.lease_sublease' is SUBLEASE/LEASE
function setParentLease(){
	var panel = lsadminLeaseInfoController.formLeaseDetails;
	if(panel.getFieldValue('ls.lease_sublease')!='SUBLEASE'){
		panel.enableField('ls.ls_parent_id' ,false);
		panel.setFieldValue('ls.ls_parent_id' ,'');
	}else{
		panel.enableField('ls.ls_parent_id' ,true);
	}
}
