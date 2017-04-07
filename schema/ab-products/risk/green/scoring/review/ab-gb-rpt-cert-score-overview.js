/**
 * @author Guo
 */

/*
 * KB 3036958 Set back the "before v20.2" color palette
 */
Ab.chart.ChartControl.prototype.FILLCOLOR_SATURATED = ['0xF79646', '0x4BACC6', '0x8064A2', '0x9BBB59', '0xC0504D', '0x4F81BD', '0x1F497D', '0x938953', '0x000000', '0x7F7F7F', '0x974806','0x205867','0x3F3151','0x4F6128','0x5E1C1B','0x244061','0x0F243E','0x1D1B10','0x0C0C0C','0x7F7F7F'];
Ab.chart.ChartControl.prototype.FILLCOLOR_DESATURATED = ['0xFDEADA', '0xDBEEF3', '0xE5E0EC', '0xEBF1DD', '0xF2DCDB', '0xDBE5F1', '0xC6D9F0', '0xDDD9C3', '0x7F7F7F', '0xD8D8D8','0xFBD5B5','0xB7DDE8','0xCCC1D9','0xD7E3BC','0xE5B9B7','0x95B3D7','0x548DD4','0x938953','0x3F3F3F','0xBFBFBF'];

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
