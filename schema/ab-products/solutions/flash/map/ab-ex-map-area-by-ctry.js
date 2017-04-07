function getPinData_JS(panelId){
	var flashControl = Ab.view.View.getControl('', panelId);
	flashControl.addPins("dsMapProperty",//dataSourceId
		"property.pr_id",//primaryKeyField
		"property.lat",//latField
		"property.lon",//lonField
		"property.name",//labelField
		null,//pinIcon
		false);//showLabels
}

function mapItemClick_JS(itemId){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('property.ctry_id',itemId,'LIKE');
	Ab.view.View.openDialog('ab-ex-property-by-ctry.axvw', restriction, false, 20, 40, 800, 600);  	
}

View.createController('showMap', {
	afterViewLoad: function(){
        var mapControl = new Ab.flash.Map(
        	'map',
        	'world',
        	'dsMapAreaByCountry',
        	'property.ctry_id',
        	'property.color',
        	'property.ctry_id;property.sum_area_manual',	
         	true								
        );
        this.panelHtml.setContentPanel(Ext.get('map'));
    }
});