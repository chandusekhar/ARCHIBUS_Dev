/**
 * Added for 22.1 Compliance and Building Operations Integration: Programs with Overdue Work report.
 * By Zhang Yi - 2015.5
 */
var abCompRptOpenWrLocCtrl = View.createController('abCompRptOpenWrLocCtrl', {

    locationField: '',
    locationValue: '',
	
	workRequestResForLinkedPm:" 1=1 ",
	workRequestFieldsArraysForLinkedPmRes: new Array( ['wr.site_id'], ['wr.pmp_id'],['wr.bl_id'], ['wr.prob_type'],
			['eqstd.category'], ['eqstd.eq_std'], 
			['pmp.pmp_type'], ['pms.pm_group'], 
			['regreq_pmp.regulation'], ['regreq_pmp.reg_program'], ['regreq_pmp.reg_requirement'], 
			['regrequirement.regreq_cat'], ['regrequirement.regreq_type'], 
			['regprogram.project_id'], ['regprogram.priority']),

	workRequestResForLinkedEvent:" 1=1 ",
	workRequestFieldsArraysForLinkedEventRes: new Array( ['wr.site_id'], ['wr.pmp_id'],['wr.bl_id'], ['wr.prob_type'],
			['eqstd.category'], ['eqstd.eq_std'], 
			['pmp.pmp_type'], ['pms.pm_group'], 
			['regreq_pmp.regulation', '', 'event.regulation'], ['regreq_pmp.reg_program','', 'event.reg_program'], ['regreq_pmp.reg_requirement','', 'event.reg_requirement'], 
			['regrequirement.regreq_cat'], ['regrequirement.regreq_type'], 
			['regprogram.project_id'], ['regprogram.priority']),
	
	abCompRptWrConsole_onShow: function(){
		if ( this.abCompRptWrLocTree.lastNodeClicked ) {
			this.getLocationRestriction(); 
		} 
		else {
			this.locationField = '1';
			this.locationValue = '1';
		}
		this.refreshPanels();
	},

	refreshPanels: function(){
		this.workRequestResForLinkedPm = getRestrictionStrFromConsole( this.abCompRptWrConsole, this.workRequestFieldsArraysForLinkedPmRes); 
		this.workRequestResForLinkedEvent = getRestrictionStrFromConsole( this.abCompRptWrConsole, this.workRequestFieldsArraysForLinkedEventRes);

		var chartPanel = this.abCompRptWrLocChart;
		chartPanel.addParameter("resForPmpLink", this.workRequestResForLinkedPm);
		chartPanel.addParameter("resForEventLink", this.workRequestResForLinkedEvent);
		chartPanel.addParameter('locationField', this.locationField);
		chartPanel.addParameter('locationValue', this.locationValue);

		var gridPanel = this.abCompRptWrGrid;
		gridPanel.addParameter("resForPmpLink", this.workRequestResForLinkedPm);
		gridPanel.addParameter("resForEventLink", this.workRequestResForLinkedEvent);
		gridPanel.addParameter('locationField', this.locationField);
		gridPanel.addParameter('locationValue', this.locationValue);

		chartPanel.refresh();
		chartPanel.show(true);
	},

	/**
	 * Called when the user selects any tree node. Applies the selected node restriction to the chart.
	 */
	onSelectLocation: function() {
		this.getLocationRestriction();
		this.refreshPanels();
	},

	getLocationRestriction: function() {
		var treePanel = View.panels.get('abCompRptWrLocTree');
		var selectedNode = treePanel.lastNodeClicked;
		var selectedLevel = selectedNode.level.levelIndex;
		
		switch (selectedLevel) {
			case 0:
				this.locationField = 'ctry_id'; 
				this.locationValue = selectedNode.data['ctry.ctry_id'];
				break;
			case 1:
				this.locationField = 'regn_id'; 
				this.locationValue = selectedNode.data['regn.regn_id'];
				break;
			case 2:
				this.locationField = 'state_id'; 
				this.locationValue = selectedNode.data['state.state_id'];
				break;
			case 3:
				this.locationField = 'city_id'; 
				this.locationValue = selectedNode.data['city.city_id'];
				break;
			case 4:
				this.locationField = 'site_id'; 
				this.locationValue = selectedNode.data['site.site_id'];
				break;
			case 5:
				this.locationField = 'bl_id'; 
				this.locationValue = selectedNode.data['bl.bl_id'];
				break;
		}	
	},

    /**
     * Called when clicking on chart
     * @param ob {Object} click object.
     */
	showWorkRequestList: function(obj){	
		//var status = obj.selectedChartData['wr.status'];
		//var keyStatus = getKeyValueOfStatus(obj, status);
		//if(keyStatus){
		//	otherRes = otherRes + " AND wr.status='"+keyStatus+"' ";
		//}

        var grid = this.abCompRptWrGrid;
        grid.refresh(obj.restriction);
        grid.showInWindow({
			x : 200,
			y : 200,
			closeButton: true,
			modal : true,
            width: 1200,
            height: 500
        });
	}
})