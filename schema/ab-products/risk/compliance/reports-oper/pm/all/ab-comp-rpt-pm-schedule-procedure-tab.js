/**
 * Added for 22.1 Compliance and Building Operations Integration: Compliance Work History report - Work Request Tab.
 */
var abCompRptPmsTabCtrl = View.createController('abCompRptPmsTabCtrl', {
	currentShow: "pms",
		
	//Event restriction from table activity_log only related to date
	pmsDateRestriction:" 1=1 ",
	pmsDateFieldsArraysForRes: new Array( ['pms.date_last_completed']),

	pmsRes:" 1=1 ",
	pmsResFieldsArrays: new Array( 
			['pms.site_id'], ['pms.bl_id'], ['pms.fl_id'], 
			['pms.pmp_id'], ['pmp.pmp_type'], ['pms.pm_group'],
			['eqstd.category'], ['eq.eq_std'],  
			['regreq_pmp.regulation'], ['regreq_pmp.reg_program'], ['regreq_pmp.reg_requirement'], 
			['regrequirement.regreq_cat'], ['regrequirement.regreq_type'], 
			['regprogram.project_id'], ['regprogram.priority']),

	afterInitialDataFetch: function(){
		checkLicense(['AbBldgOpsPM'], this.abCompRptPmsConsole, true); 
	},

	abCompRptPmsConsole_onShow: function(){
		if ( 'pms' == this.currentShow)	 {
			this.abCompRptPmpGrid.show(false);
			this.showAndRefreshGrid(this.abCompRptPmsGrid);
		} else {
			this.abCompRptPmsGrid.show(false);
			this.showAndRefreshGrid(this.abCompRptPmpGrid);
		}
	},

	showAndRefreshGrid: function(gridPanel){
		this.pmsDateRestriction = getDatesRestrictionFromConsole(this.abCompRptPmsConsole, this.pmsDateFieldsArraysForRes);

		this.pmsRes = getRestrictionStrFromConsole( this.abCompRptPmsConsole, this.pmsResFieldsArrays); 
		var wr_status = this.abCompRptPmsConsole.getFieldValue('wr.status');
		if (wr_status != '') {
		  if ('pms' == this.currentShow) {
		    this.pmsRes = this.pmsRes + "  AND EXISTS (SELECT 1 FROM wr WHERE wr.pms_id=pms.pms_id AND wr.status='" + wr_status +"')";
		  }
		  else {
		    this.pmsRes = this.pmsRes + "  AND wr.status='" + wr_status +"'";			  
		  }
		}

		gridPanel.addParameter("pmsRes", this.pmsDateRestriction + " and " + this.pmsRes);

		gridPanel.setSingleVisiblePanel(true);
		gridPanel.refresh();
		gridPanel.show(true);
	},

	abCompRptPmsGrid_onViewPmps: function(){	
		this.abCompRptPmsGrid.show(false);
		this.currentShow = "pmp";
		this.showAndRefreshGrid(this.abCompRptPmpGrid);
	},
		
	abCompRptPmpGrid_onViewPms: function(){	
		this.abCompRptPmpGrid.show(false);
		this.currentShow = "pms";
		this.showAndRefreshGrid(this.abCompRptPmsGrid);
	}
});

