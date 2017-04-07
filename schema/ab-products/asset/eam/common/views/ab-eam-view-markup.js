View.createController('abEamViewMarkupController', {
    afterViewLoad: function () {
        var controller = this;
        var records = this.abEamMarkItem_ds.getRecords(View.restriction);
        if (records.length == 0) {
            if (valueExists(View.restriction.findClause('project.project_id'))) {
                View.getOpenerView().showMessage(String.format(getMessage('noProjectMarkupFound'), View.restriction.findClause('project.project_id').value));
            } else if (valueExists(View.restriction.findClause('work_pkgs.work_pkg_id'))) {
            	View.getOpenerView().showMessage(String.format(getMessage('noWorkPackageMarkupFound'), View.restriction.findClause('work_pkgs.work_pkg_id').value));
            } else if (valueExists(View.restriction.findClause('fl.bl_id'))) {
                View.getOpenerView().showMessage(String.format(getMessage('noBlFlMarkupFound'), View.restriction.findClause('fl.bl_id').value, View.restriction.findClause('fl.fl_id').value));
            } else {
                View.getOpenerView().showMessage(String.format(getMessage('noActionMarkupFound'), View.restriction.findClause('activity_log.activity_log_id').value));
            }
            return;
        }
        if (records.length == 1) {
            var actionId = records[0].getValue('activity_log.activity_log_id'),
                actionTitle = records[0].getValue('activity_log.action_title'),
                blId = records[0].getValue('activity_log.bl_id'),
                flId = records[0].getValue('activity_log.action_title'),
                flId = records[0].getValue('activity_log.fl_id'),
                docFileName = records[0].getValue('activity_log.doc4');
            this.showImage(actionId, actionTitle, docFileName, blId, flId);
        } else if (records.length > 1) {
            View.getOpenerView().openDialog("ab-eam-view-markup-actions.axvw", View.restriction, false, {
                closeButton: false,
                width: 1024,
                height: 800,
                callback: function (actionId, actionTitle, docFileName, blId, flId) {
                    controller.showImage(actionId, actionTitle, docFileName, blId, flId);
                }
            });
        }
    },

    showImage: function (actionId, actionTitle, docFileName, blId, flId) {
        var isImage = function (docFileName) {
            var isImage = false;
            var extension = docFileName.substring(docFileName.lastIndexOf('.') + 1);
            if (valueExistsNotEmpty(extension)) {
                extension = extension.toLowerCase();
                isImage = (extension == 'bmp' ||
                extension == 'gif' ||
                extension == 'jpg' ||
                extension == 'png');
            }
            return isImage;
        };
        if (isImage(docFileName)) {
            var panel = this.abEamViewMarkItemPanel;
            var photoField = 'doc4';
            var photoCell = document.createElement('td');
            photoCell.rowSpan = 13;
            photoCell.innerHTML = '<img id="img_' + photoField + '" style="" src="">';

            var imageField = document.getElementById('doc_image');
            imageField.appendChild(photoCell);
            var keys = {
                'activity_log_id': actionId
            };
            panel.disable();
            DocumentService.getImage(keys, "activity_log", photoField, '1', true, {
                callback: function (image) {
                    dwr.util.setValue("img_" + photoField, image);
                    panel.enable();
                    panel.show();
                    if (valueExistsNotEmpty(blId) && valueExistsNotEmpty(flId)) {
                    	var title = String.format(getMessage('panelBlFlTitle'), blId, flId);
                    	if (valueExistsNotEmpty(actionTitle)) {
                    		title += ' - ' + actionTitle;
                    	}
                        panel.setTitle(title);
                    } else {
                        panel.setTitle(String.format(getMessage('panelActionTitle'), actionId, actionTitle));
                    }
                    panel.updateHeight();
                },
                errorHandler: function (m, e) {
                    Ab.view.View.showException(e);
                    panel.enable();
                }
            });
        }
    }
});
