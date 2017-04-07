// Controller for Select Value Floor Drawing dialog
//
// @author Steven Meyer with Joe Morris
//
// View.openDialog('ab-select-value-floor-dwg.axvw'  sets the view in an IFRAME. Is this the problem?
//
//
var controller = View.createController('roomSelectorController', {
	 
	// A restriction deep copied from the opener view, modified and sent back to opener through callback in click handler 
	restrict : new Ab.view.Restriction(),
	
	afterViewLoad: function() {	
		var openerView = View.getOpenerView();

    	var dwgRestriction = View.getOpenerView().dialogRestriction;
    	if (dwgRestriction != null) {
			//copy the restriction clauses from the opener view, prepared for click handler to modify and send to opener through callback
			this.restrict.addClauses(dwgRestriction, true);

			//specify a handler for when user selects a room in the drawing
	    	this.selectValueFloorDrawingPanel.addEventListener('onclick', this.onClickHandler);
			
			//specify a handler for when drawing is fully loaded; to be able to set highlights and labels after load
			this.selectValueFloorDrawingPanel.addEventListener('ondwgload', this.onDwgLoaded);
			
			var dwgCtrl = View.panels.get('selectValueFloorDrawingPanel');
			var labelsDS = 'roomNamesLabelDs';
			/*
			if (valueExistsNotEmpty(openerView.labelsDataSource)) {
				View.dataSources.add(openerView.labelsDataSource, openerView.dataSources.get(openerView.labelsDataSource));
				labelsDS = openerView.labelsDataSource;

				var testView = View;
				var test3 = 33;
				//dwgCtrl.labelsDataSource = openerView.labelsDataSource;
				//dwgCtrl.onSelectedDatasourceChanged('labels');
				//dwgCtrl.applyDS('labels');

			}
			*/
			dwgCtrl.currentLabelsDS = labelsDS; //'externalLabelDs';// 'roomNamesLabelDs' openerView.labelsDataSource;


    	    this.selectValueFloorDrawingPanel.addDrawing(this.restrict);
    	}
    },
	

	onDwgLoaded: function() {
			var openerView = View.getOpenerView();
			var dwgCtrl = View.panels.get('selectValueFloorDrawingPanel');

			if (valueExistsNotEmpty(openerView.labelsDataSource)) {
				View.dataSources.add(openerView.labelsDataSource, openerView.dataSources.get(openerView.labelsDataSource));

				var testView = View;
				dwgCtrl.labelsDataSource = openerView.labelsDataSource;
				dwgCtrl.onSelectedDatasourceChanged('labels');
				dwgCtrl.applyDS('labels');

				var test3 = 33;
			}

			// specify labels dataSource
			if (valueExistsNotEmpty(openerView.unselectableRoomCategories)) {
				var cats = openerView.unselectableRoomCategories.split(',');
			    var parameters = {
			        tableName: 'rm',
			        fieldNames: toJSON(['rm.bl_id', 'rm.fl_id', 'rm.rm_id']),
			        recordLimit: 0		        
			    };
				parameters.restriction = 'rm.bl_id=\'' + openerView.currentDwg_bl_id + '\' AND rm.fl_id=\'' + openerView.currentDwg_fl_id + 
						'\' AND rm.rm_cat IN (';
				for (var i=0, cat; cat = cats[i]; i++) {
					if (i > 0) {
						parameters.restriction += ',';
					}
					parameters.restriction += '\'' + cat + '\'' ;
				}
				parameters.restriction += ')' ;

			    try {
			    	var opts_selectable = new DwgOpts();
			        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			        for (var i = 0; i < result.data.records.length; i++) {
			            var record = result.data.records[i];
						opts_selectable.appendRec(record['rm.bl_id'] + ';' + record['rm.fl_id'] + ';' + record['rm.rm_id']);  //opts_selectable.appendRec("10003;006;06A135");						
			        }	        			        
					opts_selectable.dwgName[0] = 'rm.bl_id';
					opts_selectable.dwgName[2] = 'rm.fl_id';
					dwgCtrl.setSelectability(opts_selectable, false);        
			    } 
				catch (e) {
			        this.handleError(e);
			    }				
			}
			else {
				var test = 99;
			}

	},

	onClickHandler: function(pk, selected) {
		var ctrl = View.controllers.get('roomSelectorController');
		var name = ctrl.restrict.clauses[0].name;
		var i = name.indexOf('.');
		if (i <= 0) {
			return;
		}
			
		var tbl = name.substr(0, i);
		if (ctrl.restrict.clauses.length < 3) {
			ctrl.restrict.addClause(tbl + '.rm_id', pk[2], '=');
		}
		else {
			ctrl.restrict.clauses[2].value = pk[2];
		}

		View.parameters.callback(ctrl.restrict);

		// The .defer method used here is required for proper functionality with Firefox 2
		View.closeThisDialog.defer(100, View);
	}

});


