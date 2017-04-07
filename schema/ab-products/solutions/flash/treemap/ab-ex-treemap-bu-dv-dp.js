function loadComplete_JS(panelId){
	var treeMapControl = Ab.view.View.getControl('', panelId);
	
	treeMapControl.setStyleProperty('fillColor','blue');
    treeMapControl.setStyleProperty('colorScheme','depth');
    treeMapControl.setControlProperty( "labelThreshold", 1 ) ;
    treeMapControl.setControlProperty( "bottomMarginProportion", 0.1 ) ;
    treeMapControl.setControlProperty( "topMarginProportion", 0.1 ) ;
    treeMapControl.setControlProperty( "rightMarginProportion", 0.1 ) ;
    treeMapControl.setStyleProperty( "borderThickness", 0.1 ) ;
    treeMapControl.setStyleProperty( "borderColor", 'black' ) ;

	
	treeMapControl.addLevelOfData(0,//hierarchyLevel
		"treemapTestDsBu",//dataSourceId
		"bu.bu_id",//labelIdField
		"bu.area_chargable",//areaField
		"bu.count_em",//colorField
		"bu.bu_id",//restrictionFieldForChildren
		null,//restrictionFieldFromParent
		null);//restrictionFromConsole
	
	treeMapControl.addLevelOfData(1,//hierarchyLevel
		"treemapTestDsDv",//dataSourceId
		"dv.dv_id",//labelIdField
		"dv.area_chargable",//areaField
		"dv.count_em",//colorField
		"dv.dv_id",//restrictionFieldForChildren
		"dv.bu_id",//restrictionFieldFromParent
		null);//restrictionFromConsole
	
	treeMapControl.addLevelOfData(2,//hierarchyLevel
		"treemapTestDsDp",//dataSourceId
		"dp.dp_id",//labelIdField
		"dp.area_chargable",//areaField
		"dp.count_em",//colorField
		null,//restrictionFieldForChildren
		"dp.dv_id",//restrictionFieldFromParent
		null);//restrictionFromConsole

	treeMapControl.showData();
}

View.createController('showTreemap', {

	treeMapControl:null,
	
	afterViewLoad: function(){
        var treeMapControl = new Ab.flash.TreeMap('treemap',"treemapTestDsBu","ab-ex-treemap-bu-dv-dp.axvw");
        this.panelHtml.setContentPanel(Ext.get('treemap'));
    }
});