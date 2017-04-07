/**
 * @author Guo
 */
var abGbRptCertScoreOverViewController = View.createController('abGbRptCertScoreOverViewController', {

    // ----------------------- event handlers -------------------------
    
    fieldsArraysForRestriction: new Array(['bl.site_id'], ['gb_cert_proj.bl_id'], ['gb_cert_proj.project_name'], ['gb_cert_proj.cert_std'], ['gb_cert_proj.certified_level'], ['gb_cert_proj.cert_status']),
    
    //console restriciton string
    consoleRestriction: '1=1',
    
    //score field used for abGbRptCertScoreOverviewByScoreChart dataSource
    scoreField: 'gb_cert_proj.tot_self_score',
    
    afterInitialDataFetch: function(){
		this.abGbRptCertScoreOverviewByPaybackPeriodChart.addParameter('Negative',getMessage('Negative'));
		this.abGbRptCertScoreOverviewByPaybackPeriodChart.addParameter('None',getMessage('None'));
		this.abGbRptCertScoreOverviewByPaybackPeriodChart.addParameter('one_five',getMessage('one_five'));
		this.abGbRptCertScoreOverviewByPaybackPeriodChart.addParameter('six_ten',getMessage('six_ten'));
		this.abGbRptCertScoreOverviewByPaybackPeriodChart.addParameter('elev_fifteen',getMessage('elev_fifteen'));
		this.abGbRptCertScoreOverviewByPaybackPeriodChart.addParameter('sixteen_twenty',getMessage('sixteen_twenty'));
		this.abGbRptCertScoreOverviewByPaybackPeriodChart.addParameter('more_twenty',getMessage('more_twenty'));
		this.abGbRptCertScoreOverviewByPaybackPeriodChart.refresh();
    },
    
    /**
     * This event handler is called when user click Show button in filter panel
     */
    abGbRptCertScoreOverviewConsole_onShow: function(){
        // get the console restriction
        this.consoleRestriction = getRestrictionStrFromConsole(this.abGbRptCertScoreOverviewConsole, this.fieldsArraysForRestriction);
        //set the patameter
        this.abGbRptCertScoreOverviewByLevelChart.addParameter('consoleRestriction', this.consoleRestriction);
        this.abGbRptCertScoreOverviewByScoreChart.addParameter('consoleRestriction', this.consoleRestriction);
        this.abGbRptCertScoreOverviewByStatusChart.addParameter('consoleRestriction', this.consoleRestriction);
        this.abGbRptCertScoreOverviewByPaybackPeriodChart.addParameter('consoleRestriction', this.consoleRestriction);
        //refresh the panel
        this.abGbRptCertScoreOverviewByLevelChart.refresh();
        this.abGbRptCertScoreOverviewByScoreChart.refresh();
        this.abGbRptCertScoreOverviewByStatusChart.refresh();
        this.abGbRptCertScoreOverviewByPaybackPeriodChart.refresh();
    },
    
    /**
     * This event handler is called when user click Switch button
     */
    abGbRptCertScoreOverviewByScoreChart_onSwitch: function(){
        // switch the goup by score field from gb_cert_proj.tot_self_score or gb_cert_proj.tot_final_score
        //change the panel title by selection
        var action = this.abGbRptCertScoreOverviewByScoreChart.actions.get('switch');
        if (this.scoreField == 'gb_cert_proj.tot_self_score') {
            this.scoreField = 'gb_cert_proj.tot_final_score';
            setPanelTitle('abGbRptCertScoreOverviewByScoreChart', getMessage('scoreChartTitle2'));
            action.setTitle(getMessage('scoreActionTitle1'));
        }
        else {
            this.scoreField = 'gb_cert_proj.tot_self_score';
            setPanelTitle('abGbRptCertScoreOverviewByScoreChart', getMessage('scoreChartTitle1'));
            action.setTitle(getMessage('scoreActionTitle2'));
        }
        
        //set the patameter and refresh the panel
        this.abGbRptCertScoreOverviewByScoreChart.addParameter('scoreField', this.scoreField);
        this.abGbRptCertScoreOverviewByScoreChart.refresh(this.abGbRptCertScoreOverviewByScoreChart.restriction);
    }
});
