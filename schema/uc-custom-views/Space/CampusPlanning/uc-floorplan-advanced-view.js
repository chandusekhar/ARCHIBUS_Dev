/**
 * Called when the user clicks on the floor record, to display the floor plan.
 */
function displayFloorPlan() {	
    // use special drawing view and handler URL
    var viewName = 'ab-ex-form-select-value-from-highlight-rooms.axvw';
    var handler = '?handler=com.archibus.config.ActionHandlerDrawing';

    // add selected building and floor ids to the URL    
    var bl_id = this['fl.bl_id'];
    var fl_id = this['fl.fl_id'];
    var url = viewName + handler + '&bl.bl_id=' + bl_id + '&rm.fl_id=' + fl_id;
    
    // set the IFRAME URL to display the drawing
    $('formDrawingSelectObjHandler_drawingFrame').src = url;
    
}

