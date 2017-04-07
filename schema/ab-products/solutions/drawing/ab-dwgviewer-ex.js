


/**
 * Custom control class. Extends the base Component class.
 */
Ab.drawing.DrawingControlEx = Ab.drawing.DrawingControl.extend({
	
	constructor: function(id, config) {
		this.inherit(id, config);
	},
	
	afterLayout: function() {
		this.inherit();
		
		// Add the Floor Selection Action button
        var viewName = 'ab-floorselector.axvw';
        this.addAction({
            id: this.id + '_showAsDialog',
            icon: '/schema/ab-core/graphics/show.gif', 
            cls: 'x-btn-icon', 
            tooltip: 'Open Drawing',
            commands: [{type: 'openDialog', viewName: viewName, maximize: 'false', closeButton: 'false', width: 350, height: 400}]
        });
	},
	
    onFloorSelected: function(tmp) {
 		var res = null;
 		if (!valueExists(tmp))
 			return;
 		if (valueExists(tmp.clauses)) {
 			var ar = tmp.clauses;
 			res = new Ab.view.Restriction();
 			for (var i = 0; i < ar.length; i++) {
 				res.addClause(ar[i].name, ar[i].value);
 			}
 		}
    	View.panels.get('usingDwgcontrolex_cadPanel').addDrawing(res);
    }

});











 