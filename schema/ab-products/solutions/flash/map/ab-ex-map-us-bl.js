function mapItemClick_JS(itemId){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.state_id',itemId);
	Ab.view.View.openDialog('ab-ex-bl-by-state.axvw', restriction, false, 20, 40, 800, 600);  	
}

View.createController('showMap', {
	afterViewLoad: function(){
        var mapControl = new Ab.flash.Map(
        	'map',
        	'us',
        	'dsMapUsBl',
        	'bl.state_id',
        	'bl.color',
        	'bl.state_id',	
         	false								
        );
        this.panelHtml.setContentPanel(Ext.get('map'));
    }
});