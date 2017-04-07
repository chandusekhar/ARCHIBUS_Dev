/**
 * @author Guo
 * changed 2009-05-12 for KB3021459
 */
var controller = View.createController('abEmSetupOrMoveDwgVacantRooms_Controller', {
    blId: null,
    flId: null,
    rmId: null,
	dwgname:null,
    
    //----------------event handle--------------------
    
    afterViewLoad: function(){
        this.abEmSetupOrMoveDwgVacantRooms_DrawingPanel.actions.get('close').setTitle(getMessage("close"));
        this.abEmSetupOrMoveDwgVacantRooms_DrawingPanel.appendInstruction("default", "", "");
        this.abEmSetupOrMoveDwgVacantRooms_DrawingPanel.addEventListener('ondwgload', this.onDwgLoaded);
        this.abEmSetupOrMoveDwgVacantRooms_DrawingPanel.addEventListener('onclick', this.onClickHandler);
        var drawingRestriction = opener.drawingRestriction;
        this.blId = drawingRestriction.blId;
        this.flId = drawingRestriction.flId;
        this.rmId = drawingRestriction.rmId;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('rm.bl_id', this.blId, '=');
        restriction.addClause('rm.fl_id', this.flId, '=');
		var ds = View.dataSources.get("ds_ab-em-setup-or-move-dwg-vacant-rooms_dwgname");
		var rmRecord = ds.getRecord(restriction);
		this.dwgname = rmRecord.getValue("rm.dwgname");
		var dcl = new Ab.drawing.DwgCtrlLoc(this.blId, this.flId, null, this.dwgname);
        this.abEmSetupOrMoveDwgVacantRooms_DrawingPanel.addDrawing(dcl);
    },
    
    abEmSetupOrMoveDwgVacantRooms_DrawingPanel_onClose: function(){
        window.close();
    },
    
    onDwgLoaded: function(){
        setPanelTitle('abEmSetupOrMoveDwgVacantRooms_DrawingPanel', getMessage('instructionText'));
    },
    
    onClickHandler: function(pk, selected){
        var rmFieldElement = opener.document.getElementById('mo.to_rm_id');
        if (!rmFieldElement) {
            rmFieldElement = opener.document.getElementsByName('mo.to_rm_id')[0];
        }
        rmFieldElement.value = pk[2];
        window.close();
        rmFieldElement.focus();
    }
});
