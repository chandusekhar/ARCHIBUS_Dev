
function approveProject() {
    alert('Project approved!')
}

function enableDisableFieldButton() {
    var form = View.panels.get('exProjectFindManageConditional_projectForm');
    
    // get form field by ID
    var field = form.fields.get('project.requestor');
    
    // get action by ID
    var action = field.actions.get('sql_action');
    action.enable(!action.enabled);    
}

function enableDisableFormButton() {
    var form = View.panels.get('exProjectFindManageConditional_projectForm');
    
    // get action by ID
    var action = form.actions.get('save');
    action.enable(!action.enabled);    
}

function enableDisableGridButton() {
    var grid = View.panels.get('exProjectFindManageConditional_projectGrid');
    
    // get first grid row, get action by index
    var action = grid.gridRows.get(0).actions.get(0);
    action.enable(!action.enabled);    
}

function enableDisableAllGridButtons() {
    var grid = View.panels.get('exProjectFindManageConditional_projectGrid');
    
    // for each grid row
    grid.gridRows.each(function(row) {
        // get first per-row action
        var action = row.actions.get(0);
        action.enable(!action.enabled);
    });    
}

function enableDisableAllButtons() {
    // for all view panels
    View.panels.each(function(panel) {
        
        // except the test console
        if (panel.id != 'exProjectFindManageConditional_testForm') {
            
            // enable/disable panel-level actions
            panel.actions.each(function(action) {
                action.enable(!action.enabled);
            });
            
            // enable/disable grid row actions
            if (panel.type == 'grid') {
                panel.gridRows.each(function(row) {
                    var action = row.actions.get(0);
                    action.enable(!action.enabled);
                });    
            }     

            // enable/disable form field actions
            if (panel.type == 'form') {
                panel.fields.each(function(field) {
                    field.actions.each(function(action) {
                        action.enable(!action.enabled);
                    });
                });    
            }     
        }
    });
}

function changeActionTooltip() {
    var action = View.panels.get('exProjectFindManageConditional_userForm').actions.get('userInfoAction');
    action.setTooltip('This button still does not do anything');
}