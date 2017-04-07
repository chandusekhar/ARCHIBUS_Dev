function projWorkRequestsByActionGridOnSelectAction(row) {
    var activityLogId = row["activity_log.activity_log_id"];

    var wrRest = "wr.activity_log_id IN (SELECT activity_log_id FROM activity_log WHERE assessment_id = "+activityLogId+")";
    View.panels.get("projWorkRequestsByActionRequestGrid").refresh(wrRest);
}