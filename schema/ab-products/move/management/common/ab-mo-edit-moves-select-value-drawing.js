
var controller = View.createController('abEditMoveSelectValueDrawing_Controller', {
    
	blId:null,
	flId:null,
	rmId:null,
	dwgname:null,
	openerPanel:null,
	
    
     //----------------event handle--------------------
    
    afterViewLoad: function(){
		this.openerPanel = this.view.parameters['openerPanel'];
        this.abEditMoveSelectValueDrawing_DrawingPanel.appendInstruction("default", "", "");
        this.abEditMoveSelectValueDrawing_DrawingPanel.addEventListener('ondwgload', this.onDwgLoaded);
        this.abEditMoveSelectValueDrawing_DrawingPanel.addEventListener('onclick', this.onClickHandler);

		// add Vacant Only restriction to the dataSource
		if(valueExistsNotEmpty(this.view.parameters['vacantOnly'])) {
			this.ds_abEditMovesSelectValueDrawing_rmHighlight.addParameter('vacantOnly', this.view.parameters['vacantOnly']);
		}
		
        this.blId = this.openerPanel.getFieldValue('mo.to_bl_id');
        this.flId = this.openerPanel.getFieldValue('mo.to_fl_id');
        this.rmId = this.openerPanel.getFieldValue('mo.to_rm_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('rm.bl_id', this.blId, '=');
        restriction.addClause('rm.fl_id', this.flId, '=');
		var ds = View.dataSources.get("ds_ab-edit-moves-select-value-drawing_dwgname");
		var rmRecord = ds.getRecord(restriction);
		this.dwgname = rmRecord.getValue("rm.dwgname");
		var dcl = new Ab.drawing.DwgCtrlLoc(this.blId, this.flId, null, this.dwgname);
		this.abEditMoveSelectValueDrawing_DrawingPanel.addDrawing(dcl);
    },
    
    onDwgLoaded: function(){
        if (controller.rmId) {
            var dwgCtrl = View.panels.get('abEditMoveSelectValueDrawing_DrawingPanel');
            var df = new DwgFill();
            df.bc = 0x00ff00; //Border Color
            df.bt = 5; //Border Thickness
            df.bo = 1.0; //Border Opacity: 1.0 (full intensity)  
            var opts = new DwgOpts();
			opts.rawDwgName = controller.dwgname;
            opts.appendRec(controller.blId + ';' + controller.flId + ';' + controller.rmId, df);
            dwgCtrl.highlightAssets(opts);
        }
        
        setPanelTitle('abEditMoveSelectValueDrawing_DrawingPanel', getMessage('instructionText'));
    },
    
    onClickHandler: function(pk, selected){

		controller.openerPanel.setFieldValue('mo.to_rm_id' ,pk[2]);
        View.closeThisDialog();
    }
});

