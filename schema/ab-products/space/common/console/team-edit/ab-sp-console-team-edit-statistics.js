var statisticsController = View.createController('statisticsController', {
	
	teamId:"",
	
	asOfDate:"",
	
	afterInitialDataFetch : function(){
		
		//get teamId from previous page, it is null if add new button clicked
		this.teamId=View.parameters['teamId'];

		//get current date
		this.asOfDate = View.parameters['asOfDate'];
		
		//this.calculateTeamStatistics();
		this.appendHelpTextOnAsOfDate();

	},
	
	/**
	 * add question remark icon and hint message after the as of date field.
	 */
	appendHelpTextOnAsOfDate:function (){
		var tdNode = Ext.get('statisticsForm_team_properties.stat_date_fieldCell').dom;
		Ext.DomHelper.append(tdNode, "<img id='helpAsOfDate' src='/archibus/schema/ab-core/graphics/icons/help.png' style='margin-left:5px;' title='"+getMessage("helpAsOfDate")+"'/>", true);
		Ext.get("helpAsOfDate").on("click", function(){
			View.alert(getMessage("helpAsOfDate"));
		});
	},
	/**
	 * trigger an event when date changed
	 */
	onAsOfDateChanged:function (){
    	
    	//reset as of date
    	this.asOfDate =  View.panels.get('statisticsForm').getFieldValue('team_properties.stat_date');
    	
    	//notify teamEditController to refresh current selected tab
    	View.controllers.get('teamEditController').refreshCurrentSelectedTab(this.asOfDate);
    	
    },
    
	/**
	 * calculate field value
	 */
    calculateTeamStatistics: function (){
    	
    	try {
    		
			//get statisticsController
	    	var controller = View.controllers.get('statisticsController');
	    	
	    	//get statistics record and set to fields
	    	var team_statistics_ds = View.dataSources.get("team_statistics_ds");
	    	team_statistics_ds.addParameter('teamId', controller.teamId);
	    	team_statistics_ds.addParameter('dateCon', this.asOfDate);
	    	var statisticsRecord = team_statistics_ds.getRecord();
	    	
	    	//calculate statistics for fields
	    	this.calculateStatisticsFields(controller, statisticsRecord, team_statistics_ds);
	    	
	    	//get building list for building field
	    	this.getBuildingList(controller);
	    	
	    	//get next date event
	    	this.getNextDateEvent(controller, statisticsRecord);
	    	
    	} catch (e) {
    		View.showMessage('error', '', e.message, e.data);
    	}
    		
    },
    
    /**
	 * calculate statistics for fields
	 * @param controller
	 * @param statisticsRecord 
	 * @param team_statistics_ds
	 */
    calculateStatisticsFields: function (controller, statisticsRecord, team_statistics_ds){
    	
    	this.statisticsForm.show(true);
    	this.statisticsForm.clear();
    	
    	var seat_ratio_act = 0, room_count = 0, room_area = 0, headcount = 0, capacity = 0, seat_ratio_tgt = 0, buildings = "";
    	
    	room_count = this.checkUndefined(statisticsRecord.getValue("team_properties.room_count"));
    	room_area = this.checkUndefined(statisticsRecord.getValue("team_properties.total_rm_area"));
    	headcount = this.checkUndefined(statisticsRecord.getValue("team_properties.employees"));
    	capacity =  this.checkUndefined(statisticsRecord.getValue("team_properties.capacity"));
    	seat_ratio_tgt =  this.checkUndefined(statisticsRecord.getValue("team_properties.seat_ratio_tgt"));
    	
    	//first calculate with standard number
    	if(capacity != 0) {
    		seat_ratio_act = (headcount/capacity).toFixed(2);
    	}
    	if(seat_ratio_tgt!=0){
    		seat_ratio_tgt = ((seat_ratio_act/seat_ratio_tgt)*100).toFixed(2);
    	}
    	
    	//then display localized number
    	this.statisticsForm.setFieldValue('team_properties.room_count', team_statistics_ds.formatValue("team_properties.room_count", room_count, true));
    	this.statisticsForm.setFieldValue('team_properties.capacity', team_statistics_ds.formatValue("team_properties.capacity", capacity, true));
    	this.statisticsForm.setFieldValue('team_properties.total_rm_area', team_statistics_ds.formatValue("team_properties.total_rm_area", room_area, true));
    	this.statisticsForm.setFieldValue('team_properties.employees', team_statistics_ds.formatValue("team_properties.employees", headcount, true));
    	this.statisticsForm.setFieldValue('team_properties.seat_ratio_act', team_statistics_ds.formatValue("team_properties.seat_ratio_act", seat_ratio_act, true));
    	this.statisticsForm.setFieldValue('team_properties.seat_ratio_tgt',  team_statistics_ds.formatValue("team_properties.seat_ratio_tgt", seat_ratio_tgt, true));
    	
    	//set as of date field
    	this.statisticsForm.setFieldValue('team_properties.stat_date', this.asOfDate);
    },
    
    /**
	 * get buildings text and pop up a building list when clicking on it
	 * @param controller
	 */
    getBuildingList: function (controller){
    	
    	var rm_team_ds = View.dataSources.get("rm_team_ds");
    	rm_team_ds.addParameter('teamId', controller.teamId);
    	rm_team_ds.addParameter('dateCon', this.asOfDate);
    	var rmteamRecords=rm_team_ds.getRecords();
    	
    	var bl_id="";
    	
    	for(var i = 0; i < rmteamRecords.length; i++) {
    		var rmteamRecord = rmteamRecords[i];
    		bl_id += rmteamRecord.getValue('rm_team.bl_id')+",";
    	}
    	if ( valueExistsNotEmpty(bl_id) ) {
			bl_id = bl_id.substring(0,bl_id.length-1);
		}
    	if(bl_id.length>0&&bl_id.indexOf(',')>0){
    		this.statisticsForm.setFieldValue('team_properties.buildings', bl_id.substring(0,bl_id.indexOf(','))+"...");
    	}else{
    		this.statisticsForm.setFieldValue('team_properties.buildings', bl_id);
    	}
    	
    	//tooltip for the buildings
    	$("ShowstatisticsForm_team_properties.buildings").title = bl_id;
    	$("ShowstatisticsForm_team_properties.buildings").onclick=function(){

    		var buildingsRes = new Ab.view.Restriction(); 
    		buildingsRes.addClause('rm_team.team_id',controller.teamId,'=');
    		buildingsRes.addClause("rm_team.date_start", controller.asOfDate, "<=");
    		buildingsRes.addClause("rm_team.date_end", null, "IS NULL", ")AND(");
    		buildingsRes.addClause("rm_team.date_end", controller.asOfDate, ">=", "OR");
			
    		View.openDialog("ab-sp-console-team-edit-statistics-buildings.axvw", buildingsRes, false, {
    			width: 400,
    			height: 300,
    			closeButton: true
    		});
    	};
    },
    
    /**
	 * calculate next date event
	 * @param controller
	 * @param statisticsRecord
	 */
    getNextDateEvent: function (controller, statisticsRecord){
    	
    	//get the latest date according to as of date
    	var next_date = statisticsRecord.getValue("team_properties.next_date");
    	if("--"==next_date||!valueExistsNotEmpty(next_date)){
    		jQuery("#depict").html(getMessage("none"));
    	}else{
    		var next_change_event_ds = View.dataSources.get("next_change_event_ds");
        	next_change_event_ds.addParameter('teamId', controller.teamId);
        	next_change_event_ds.addParameter('latestDate', next_date);
        	var nextEvent = next_change_event_ds.getRecord();
        	var em_start = nextEvent.getValue("team_properties.em_start");
        	var em_end = nextEvent.getValue("team_properties.em_end");
        	var rm_start = nextEvent.getValue("team_properties.rm_start");
        	var rm_end = nextEvent.getValue("team_properties.rm_end");
        	
        	var depict = statisticsRecord.getValue("team_properties.next_date")+"<br>";
        	if(em_start>0){
        		depict += em_start +" "+getMessage("employee_start")+"<br>"
        	}
        	if(em_end>0){
        		depict += em_end +" "+getMessage("employee_end")+"<br>"
        	}
        	if(rm_start>0){
        		depict += rm_start +" "+getMessage("room_start")+"<br>"
        	}
        	if(rm_end>0){
        		depict += rm_end +" "+getMessage("room_end")+"<br>"
        	}
        	jQuery("#depict").html(depict);
    	}
    },
    
	/**
	 * transform undefined value to 0
	 * @param value
	 * @return value
	 */
    checkUndefined: function (value){
    	if(typeof value === 'undefined'){
    		return 0;
    	}
    	return value;
    }
	
});

