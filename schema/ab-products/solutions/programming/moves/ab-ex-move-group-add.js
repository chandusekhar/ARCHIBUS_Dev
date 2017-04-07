
var addController = View.createController('add', {
    
    afterInitialDataFetch: function() {
        // get the parent form field values
        var editProjForm = View.getOpenerView().panels.get('projectForm');
        var project_id = editProjForm.getFieldValue('project.project_id');
        var date_start = editProjForm.getFieldValue('project.date_start');
        var bl_id = editProjForm.getFieldValue('project.bl_id');
        var dv_id = editProjForm.getFieldValue('project.dv_id');
        var dp_id = editProjForm.getFieldValue('project.dp_id');
    
        // pre-set the current form field values
        this.moveForm.setFieldValue('mo.project_id', project_id);
        this.moveForm.setFieldValue('mo.to_bl_id', bl_id);
        this.moveForm.setFieldValue('mo.from_bl_id', bl_id);
        this.moveForm.setFieldValue('mo.from_dv_id', dv_id);
        this.moveForm.setFieldValue('mo.from_dp_id', dp_id);
        if (date_start != "") {
            this.moveForm.setFieldValue('mo.date_start_req', date_start);
        }
        this.moveForm.setFieldValue('mo.date_created', new Date());
    
        // initial settings - only if these elements are available
        if ($('vacant_rooms') != null) {
            $("vacant_rooms").checked = false;
            $("showDrawing").value = getMessage("showDrawingMessage");
            $("showDrawing").disabled = true;
        }
    },
    
    // ----------------------- event handlers -----------------------------------------------------
    
    moveForm_onSelectBuilding: function() {
        View.selectValue({
        	formId: 'moveForm', 
        	title: getMessage('selectBuildingMessage'), 
        	fieldNames: ['mo.to_bl_id'], 
        	selectTableName: 'bl', 
        	selectFieldNames: ['bl.bl_id'], 
        	visibleFieldNames: ['bl.bl_id','bl.name']
        });
    },
    
    moveForm_onSelectFloor: function() {
        var restriction = '';    
        var buildingId = this.moveForm.getFieldValue('mo.to_bl_id');
        if (buildingId != '') {   
            restriction = "fl.bl_id='" + buildingId + "'";
        }
        View.selectValue({
        	formId: 'moveForm', 
        	title: getMessage('selectFloorMessage'), 
        	fieldNames: ['mo.to_bl_id','mo.to_fl_id'], 
        	selectTableName: 'fl', 
        	selectFieldNames: ['fl.bl_id','fl.fl_id'], 
        	visibleFieldNames: ['fl.bl_id','fl.fl_id','fl.name'],
        	restriction: restriction,
        	actionListener: function() {
        	    $('showDrawing').disabled = 0;
            }
        });
    },
    
    moveForm_onSelectRoom: function() {
        var restriction = '';    
        var buildingId = this.moveForm.getFieldValue('mo.to_bl_id');
        if (buildingId != '') {   
            restriction = "rm.bl_id='" + buildingId + "'";
            
            var floorId = this.moveForm.getFieldValue('mo.to_fl_id');
            if (floorId != '') {
                restriction += " AND rm.fl_id='" + floorId + "'";
            }
        }
        
        if ($('vacant_rooms') != null && $('vacant_rooms').checked) {
            var vacantRoomsRestriction = " (NOT EXISTS (SELECT 1 FROM em WHERE em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id)) AND (rm_cat <>'VERT' OR rm_cat IS NULL)";
            if (restriction != "") {   
                restriction = restriction + " AND " + vacantRoomsRestriction;
            } else {   
                restriction = vacantRoomsRestriction;
            }
        }
        View.selectValue({
        	formId: 'moveForm', 
        	title: getMessage('selectToRoomMessage'), 
        	fieldNames: ['mo.to_bl_id','mo.to_fl_id','mo.to_rm_id'], 
        	selectTableName: 'rm', 
        	selectFieldNames: ['rm.bl_id','rm.fl_id','rm.rm_id'], 
        	visibleFieldNames: ['rm.bl_id','rm.fl_id','rm.rm_id','rm.rm_type'],
        	restriction: restriction,
        	showIndex: true,
        	actionListener: function() {
    	        $('showDrawing').disabled = 0;
            }
        });
    },
    
    moveForm_onShowDrawing: function() {
        var buildingId = this.moveForm.getFieldValue('mo.to_bl_id');
        var floorId = this.moveForm.getFieldValue('mo.to_fl_id');

        var restriction = new Ab.view.Restriction();
		restriction.addClause('fl.bl_id', buildingId);
        restriction.addClause('fl.fl_id', floorId);

		this.floorPlan.refresh(restriction);

		this.floorPlan.addEventListener('onclick', this.onSelectRoom.createDelegate(this));
    },
	
	onSelectRoom: function(pkArray) {
		this.moveForm.setFieldValue('mo.to_rm_id', pkArray[2]);
	}
});


/**
 * Helper function that checks whether selected building and floor has vacant rooms and enables/disabled the drawing button.
 * It is not a part of the controller because onfocus/onblur field events cannot be wired to the controller yet.
 * @param {Object} formId
 * @param {Object} bl_fieldName
 * @param {Object} fl_fieldName
 * @param {Object} vacantRoomsButtonName
 */
function checkVacantRooms(formId, bl_fieldName, fl_fieldName, vacantRoomsButtonName)
{
    var objForm = View.panels.get(formId);
    var obj_bl_id = objForm.getFieldElement(bl_fieldName);
    var obj_fl_id = objForm.getFieldElement(fl_fieldName);
    var obj_vacanyRoomsButton = $(vacantRoomsButtonName);

    if (!obj_bl_id || !obj_fl_id || !obj_vacanyRoomsButton)
        return;

    var str_bl_id = obj_bl_id.value;
    str_bl_id = trim(str_bl_id);
    var str_fl_id = obj_fl_id.value;
    str_fl_id = trim(str_fl_id);

    if (str_bl_id!="" && str_fl_id!="") {
        obj_vacanyRoomsButton.disabled = 0;
    } else {
        obj_vacanyRoomsButton.disabled = 1;
    }
}

