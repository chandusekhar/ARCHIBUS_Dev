var imageUploadController = View.createController('imageUploadController',{
    uploadDirectory: 'confined space',
    
    uploadPanel_afterRefresh: function() {
        this.uploadPanel.setFieldValue('uploadDirectory', '/archibus/' + this.uploadDirectory);
    },
    
    uploadPanel_onUpload: function() {
        try {
            Workflow.startJob('AbBldgOpsOnDemandWork-HazardTrackingImageImport-importImages', this.uploadDirectory);
            View.showMessage('message', 'Image import has been started');
        } catch(e) {
            Workflow.handleError(e);
        }
    }
});