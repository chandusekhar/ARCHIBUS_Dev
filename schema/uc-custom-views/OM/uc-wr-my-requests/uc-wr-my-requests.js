// CHANGE LOG
// 2010/04/19 - JJYCHAN - ISSUE 116 - Added code to remove top buttons

var wrViewController = View.createController('wrViewController', {

	afterViewLoad: function() {
		prevNextafterViewLoad(this.wr_grid,"25,50,100,200","50");
		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
		
	},
	wr_grid_afterRefresh:function(){
        prevNext_afterRefresh(this.wr_grid);
	},
	showPanel: function(row){
		wrViewController.banner.show(true)
		wrViewController.wr_report.show(false,true)
		wrViewController.res_report.show(false,true)
		var rest = new Ab.view.Restriction(); 
		rest.addClause("wrhwr.wr_id", +row['wrhwr.wr_id'], "=");
		if (row['wrhwr.prob_type'] == 'FLEET-RESERVE'){
			wrViewController.res_report.refresh(rest)
		}
		else {
			wrViewController.wr_report.refresh(rest)
		}
	
	},

		
	// *****************************************************************************
	// Open the Craftsperson Print window
	//******************************************************************************
	 openPrintWindow: function()
	{
		var wr_id = this.wr_report.getFieldValue('wrhwr.wr_id');
		if (this.wr_report.getFieldValue('wrhwr.prob_type')=='FLEET') {
			window.open('uc-wr-my-requests-fleet-print.axvw', 'newWindow', 'width=800, height=600, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');
		} else {
			window.open('uc-wr-my-requests-print.axvw?handler=com.archibus.config.ActionHandlerDrawing&wrhwr.wr_id='+wr_id, 'newWindow', 'width=800, height=600, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');
		}
	}
})


