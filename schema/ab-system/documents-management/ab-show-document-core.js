<!-- 17.2 compatibility mode document JavaScrip -->

var documentDisplayFieldName = 'documentTarget';
	
function user_form_onload() {
    setManagerVarsFromOpener();
	// showDocument();
	// closeDialog();
	// now load docs_grid with restriction
     var restriction = "afm_docs.table_name = '" + docmanager_tableName + "' and afm_docs.field_name = '" + docmanager_fieldName + "' and afm_docs.pkey_value = '" + docmanager_pkey_value + "'";

	 var labelElem = $("document_target");
	 var translatedLabel = getMessage("message_opening_label");
	 labelElem.innerHTML = translatedLabel;
}
/*    
function show_document() {
        // do not open dialog - get the file from the server

        var openingView = View.getOpenerWindow().AFM.view.View;
        var panel = AFM.view.View;
        var fileName = docmanager_autoNamedFile;

        // restriction for the DocumentService is in a special format
        var keys = {};
		var r = docmanager_pkeys_values;
        var restriction = openingView.dialogRestriction;
        for (var i=0, pkey; pkey = restriction.pkeys[i]; i++) {
            keys[pkey.name.substring(pkey.name.lastIndexOf('.') + 1)] = pkey.value;
        }
        
        if (isImage(fileName) && valueExistsNotEmpty(documentDisplayFieldName)) {
            // image document, should be displayed in an image field on this form
            var displayFieldId = panel.getFieldElementName(displayFieldName);
            DocumentService.getImage(keys, docmanager_tableName, docmanager_fieldName, '1', true, {
                callback: function(image) {
                    dwr.util.setValue(displayFieldId, image);
                    panel.enable();
                },
                errorHandler: function(m, e) {
                    AFM.view.View.showException(e);
                    panel.enable();
                }
            });
        } 
		else {
            // application document, should be handled by the browser using iframe managed by DWR
            DocumentService.show(keys, docmanager_tableName, docmanager_fieldName, fileName, '', true, 'showDocument', {
                validateIncompleteReply: false,
                rpcType: 'dwr.engine.IFrame',
                httpMethod: 'GET',
                callback: function() {
                    // do nothing because the service does not return any value
                },
                errorHandler: function(m, e) {
                    AFM.view.View.showException(e);
                }
            });
        }
    }
    
    **
     * Return true if specified file name matches one of the supported image formats.
     *
    isImage: function(fileName) {
        var isImage = false;
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        if (valueExistsNotEmpty(extension)) {
            extension = extension.toLowerCase();
            isImage = (extension == 'bmp' || 
                       extension == 'gif' || 
                       extension == 'jpg' || 
                       extension == 'png');
        }
        return isImage;
    }
*/