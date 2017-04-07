
View.createController('msdsReportClass', {
    abRiskMsdsRptMsdsClassGrid_onClickItem: function (row) {
        this.abRiskMsdsRptMsdsClassForm.refresh(row.getRecord().toRestriction());
        this.abRiskMsdsRptMsdsClassGrid.updateHeight();
    }
});