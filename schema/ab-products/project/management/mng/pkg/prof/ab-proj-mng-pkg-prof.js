var projMngPkgProfController = View.createController('projMngPkgProf', {
	contractAwarded: false,
	menuReports: new Array('report1','report2','report3'),
	menuContrReports: new Array('report1'),
	
	afterViewLoad: function() {

    },
	
    afterInitialDataFetch: function(){
        var titleObjReports = Ext.get('reports');
        titleObjReports.on('click', this.showReportsMenu, this, null);
        var titleObjContrReports = Ext.get('contrReports');
        titleObjContrReports.on('click', this.showContrReportsMenu, this, null);
    },
    
    showReportsMenu: function(e, item){
    	this.showMenu(e, this.menuReports, this.onReportsButtonPush);
    },
    
    showContrReportsMenu: function(e, item){
    	this.showMenu(e, this.menuContrReports, this.onContrReportsButtonPush);
    },
    
	/*
	 * show pull-down menu.
	 */
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
	
	onReportsButtonPush: function(menuItemId){
		switch(menuItemId) {
		case 'report1':
			View.openDialog('ab-proj-mng-rpt-bid-var.axvw', this.projMngPkgProf_bidsGrid.restriction);
			break;	
		case 'report2':
			View.openDialog('ab-proj-mng-rpt-vn-perf.axvw', null);
			break;
		case 'report3':
			View.openDialog('ab-proj-review-vendors-invoices-and-payments.axvw', null);
			break;
		}
	},
	
	onContrReportsButtonPush: function(menuItemId){
		switch(menuItemId) {
		case 'report1':
			View.openDialog('ab-proj-mng-rpt-bid-var.axvw', this.projMngPkgProfContrForm.restriction);
			break;
		}
	},
	
	projMngPkgProf_workpkgForm_afterRefresh:function() {
		var project_id = this.projMngPkgProf_workpkgForm.getFieldValue('work_pkgs.project_id');
		var work_pkg_id = this.projMngPkgProf_workpkgForm.getFieldValue('work_pkgs.work_pkg_id');
		this.projMngPkgProf_workpkgForm.setTitle(project_id + ' - ' + work_pkg_id);
		var status = this.projMngPkgProf_workpkgForm.getFieldValue('work_pkgs.status');
		var restriction = this.projMngPkgProf_workpkgForm.restriction;	
		var records = this.projMngPkgProf_contrDs.getRecords(restriction);
		if (records.length == 0) {
			this.contractAwarded = false;
			this.projMngPkgProfContrForm.show(false);
			if (status == 'Approved-Out for Bid' || status == 'Approved-Bid Review' || status == 'Approved-Bids Award' || status == 
				'Approved-Cancelled' || status == 'Issued-Stopped' || status.indexOf('Completed') == 0 || status == 'Closed') {
				this.projMngPkgProf_workpkgForm.actions.get('sendOutForBid').show(false);
				this.projMngPkgProf_workpkgForm.actions.get('skipBidProcess').show(false);
			} else {
				this.projMngPkgProf_workpkgForm.actions.get('sendOutForBid').show(true);
				this.projMngPkgProf_workpkgForm.actions.get('skipBidProcess').show(true);
			}
			if (status == 'Approved-Out for Bid' || status == 'Approved-Bid Review'|| status == 'Approved-Bids Award') {	
				this.projMngPkgProf_bidsGrid.refresh(restriction);
				this.projMngPkgProf_bidsGrid.show(true);
				if (this.projMngPkgProf_bidsGrid.rows.length == 0) this.projMngPkgProf_bidsGrid.setInstructions(getMessage('noBids'));
				else this.projMngPkgProf_bidsGrid.setInstructions('');
			} else {
				this.projMngPkgProf_bidsGrid.show(false);
			}
		} else {
			this.contractAwarded = true;
			this.projMngPkgProfContrForm.refresh(restriction);
			this.projMngPkgProfContrForm.show(true);
			this.projMngPkgProf_bidsGrid.show(false);
			
			this.projMngPkgProf_workpkgForm.actions.get('sendOutForBid').show(false);
			this.projMngPkgProf_workpkgForm.actions.get('skipBidProcess').show(false);

			this.projMngPkgProf_bidsGrid.show(false);
		}
	},

	projMngPkgProfForm_beforeSave : function() {
		this.projMngPkgProfForm.clearValidationResult();
		this.validateDates();
	},
	
	projMngPkgProf_workpkgForm_onSendOutForBid:function() {
		var record = this.projMngPkgProfDs0.getRecord(this.projMngPkgProf_workpkgForm.restriction);
		record.setValue('work_pkgs.status','Approved-Out for Bid');
		this.projMngPkgProfDs0.saveRecord(record);
		this.projMngPkgProf_workpkgForm.refresh();
	},

	validateDates : function() {
		var valid = validateDateFields(this.projMngPkgProfForm, 'work_pkgs.date_est_start', 'work_pkgs.date_est_end', false);
		if (valid) valid = validateDateFields(this.projMngPkgProfForm, 'work_pkgs.date_act_start', 'work_pkgs.date_act_end', false);
		return valid;
	},
	
	projMngPkgProf_bidsGrid_afterRefresh : function() {
		var numSub = 0;
		this.projMngPkgProf_bidsGrid.gridRows.each(function (row) {
		   var status = row.getRecord().getValue('work_pkg_bids.status');
		   var action = row.actions.get('approve');
		   if (status == 'Withdrawn' || status == 'Created') {
			   action.show(false);
		   }
		   else {
			   action.show(true);
			   numSub++;
		   }
		});
		this.projMngPkgProf_bidsGrid.appendTitle(getMessage('bids_sub') + " " + numSub);
	},
	
	projMngPkgProf_bidsGrid_onApprove : function(row, action) {
		var record = row.getRecord();
		var project_id = record.getValue('work_pkg_bids.project_id');
		var work_pkg_id = record.getValue('work_pkg_bids.work_pkg_id');
		var vn_id = record.getValue('work_pkg_bids.vn_id');
		var controller = this;
        var message = getMessage('confirmApprove').replace('{0}', vn_id);
        View.confirm(message, function(button){
            if (button == 'yes') {
                try {
                	var parameters = {
                			"project_id": project_id,
                			"work_pkg_id": work_pkg_id,
                			"vn_id": vn_id
                		};
                		var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-approveWorkPkgBid', parameters);
                		if (result.code == 'executed') 
                		{
                			controller.projMngPkgProf_workpkgForm.refresh();
                		} else 
                		{ 
                			alert(result.code + " :: " + result.message);
                		}
                } 
                catch (e) {

                }
            }
        });			
	},
	
	projMngPkgProfContrForm_onSignContract : function() {
		this.projMngPkgProfContrForm_onEdit();
	},
	
	projMngPkgProfContrForm_onEdit:function() {
		var record = this.projMngPkgProf_contrDs.getRecord(this.projMngPkgProfContrForm.restriction);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkg_bids.project_id', record.getValue('work_pkg_bids.project_id'));
		restriction.addClause('work_pkg_bids.work_pkg_id', record.getValue('work_pkg_bids.work_pkg_id'));
		restriction.addClause('work_pkg_bids.vn_id', record.getValue('work_pkg_bids.vn_id'));
		View.openDialog('ab-proj-mng-pkg-prof-contr-edit.axvw', restriction);
	}
});