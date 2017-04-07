var ucRepmAddEditLeaseFormCtrl = View.createController('ucRepmAddEditLeaseFormCtrl', {
    afterViewLoad: function() {
        this.inherit();

        if (window.location.parameters["ls_id"] != null) {
            View.urlParameters = new Object();
            View.urlParameters["ls_id"] = window.location.parameters["ls_id"];

            var blpr = window.location.parameters["blpr"];
            if (blpr != null && blpr == "p") {
                View.urlParameters["blpr"] = window.location.parameters["blpr"];
                this.leaseTemplatesTabs.selectTab("propertyTab");
            }
        }


    }
});

