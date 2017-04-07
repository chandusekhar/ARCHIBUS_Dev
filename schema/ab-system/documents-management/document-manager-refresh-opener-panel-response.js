
/**
 * Closes the document dialog and refreshes the opener panel.
 * The document dialog can only be opened from the edit form panel.
 */
function user_form_onload() {
    var view = AFM.view.View.getView('opener');
    
    if (valueExists(view.dialogOpenerPanel)) {
        view.dialogOpenerPanel.refresh();
    }
    
    view.closeDialog();
}