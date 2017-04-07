var selectRequestorController = View.createController("selectRequestor",{
    
    employeePanel_onClickItem: function(row) {
        var reservePanel = View.getOpenerView().panels.get("reservePanel");
        reservePanel.setFieldValue("reserve.user_requested_by", row.getFieldValue("em.em_id"));
        reservePanel.setFieldValue("reserve.user_requested_for", row.getFieldValue("em.em_id"));
        reservePanel.setFieldValue("reserve.email", row.getFieldValue("em.email"));
        reservePanel.setFieldValue("reserve.phone", row.getFieldValue("em.phone"));
        reservePanel.setFieldValue("reserve.dv_id", row.getFieldValue("em.dv_id"));
        reservePanel.setFieldValue("reserve.dp_id", row.getFieldValue("em.dp_id"));
        View.closeThisDialog();
    }

});