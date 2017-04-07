var projMngInvsController = View.createController('projMngInvs', {
	project_id: '',
    
    projMngInvsFilter_afterRefresh: function() {
    	var openerController = View.getOpenerView().controllers.get('projMng');
    	this.project_id = openerController.project_id;
    	var title = this.project_id;
		if (openerController.project_name != '') title += ' - ' + openerController.project_name;
    	this.projMngInvsFilter.appendTitle(title);
    	this.projMngInvsFilter_onClear();
    },
    
    projMngInvsGrid_afterRefresh: function() {
    	this.projMngInvsGrid.gridRows.each(function (row) {
    	   var record = row.getRecord();
    	   var action = row.actions.get('edit_icon');
 		   var status = record.getValue('invoice.status');
 		   if (status == 'ISSUED') {
 			   action.show(true);
 		   }
 		   else action.show(false)
    	});
    },
    
    projMngInvsFilter_onClear: function() {
    	this.projMngInvsFilter.setFieldValue('invoice.work_pkg_id', '');
    	this.projMngInvsFilter.setFieldValue('invoice.vn_id', '');
    	$('projMngInvsFilter_show').value = 'all';
    	
    	/* get filter restriction from alerts selection */
    	var openerController = View.getOpenerView().controllers.get('projMng');
    	var alertsFilter = openerController.alertsFilter;
    	if (alertsFilter) {
    		$('projMngInvsFilter_show').value = alertsFilter;
    		openerController.alertsFilter = '';
    	}
    	
    	this.projMngInvsFilter_onFilter();
    },
    
    projMngInvsFilter_onFilter: function() {
    	var work_pkg_id = this.projMngInvsFilter.getFieldValue('invoice.work_pkg_id');
    	var vn_id = this.projMngInvsFilter.getFieldValue('invoice.vn_id');
    	var restriction = getShowFilterRestriction();
    	restriction.addClause('invoice.project_id', this.project_id);
    	if (work_pkg_id) restriction.addClause('invoice.work_pkg_id', work_pkg_id);
    	if (vn_id) restriction.addClause('invoice.vn_id', vn_id);
    	this.projMngInvsGrid.refresh(restriction);    	
    },

    projMngInvsFilter_onAddNew:function() {
    	var openerController = View.getOpenerView().controllers.get('projMng');
		var projectRestriction = new Ab.view.Restriction();
		projectRestriction.addClause('project.project_id', openerController.project_id);
    	View.openDialog('ab-proj-mng-inv-edit.axvw', projectRestriction, true, {
    		width : 1000,
			height : 800,
			closeButton : true,
			callback: function() {
				View.controllers.get('projMngInvs').projMngInvsFilter_onClear();
		    }
		});
    }
});

function openInv(commandContext) {
	var invoice_id = commandContext.restriction['invoice.invoice_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('invoice.invoice_id', invoice_id);
	View.openDialog('ab-proj-mng-inv-edit.axvw', restriction, false, {
		width : 1000,
		height : 800,
		closeButton : true,
		callback: function() {
			View.panels.get('projMngInvsGrid').refresh();
	    }
	});
}

function projMngInvsFilter_vnSelval() {
	var controller = View.controllers.get('projMngInvs');
	View.selectValue('projMngInvsFilter',
			getMessage('vendors'),
			['invoice.vn_id'],
			'vn',
			['vn.vn_id'],
			['vn.vn_id', 'vn.company','vn.city','vn.state','vn.country'],
			"EXISTS (SELECT 1 FROM invoice WHERE invoice.vn_id = vn.vn_id AND invoice.project_id = '"+controller.project_id+"')");
}

function getShowFilterRestriction() {
	var controller = View.controllers.get('projMngInvs');
	
	var value = $('projMngInvsFilter_show').value;
	var restriction = new Ab.view.Restriction();
	
	switch (value) {
	case 'all':
		break;
	case 'issued': 
		restriction.addClause('invoice.status', 'ISSUED');
		break;
	case 'approved':
		restriction.addClause('invoice.status', ['SENT','CLOSED'], 'IN');
		break;
	}
	return restriction;
}