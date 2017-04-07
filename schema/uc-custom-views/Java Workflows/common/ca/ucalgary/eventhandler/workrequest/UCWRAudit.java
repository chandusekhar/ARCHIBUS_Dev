package ca.ucalgary.eventhandler.workrequest;

import java.text.SimpleDateFormat;
import java.util.Calendar;

import org.json.JSONObject;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class UCWRAudit extends EventHandlerBase{
	
	/**
	 * Saves the changed values of wr into the audit log.
	 * 
	 * Two values are audited, status and tr_id.  The old and new values are saved
	 * to the audit table along with user that changed the values and the
	 * date of change.
	 * 
	 * Required Parameters in the context:
	 *   user_name : (string) The name of the user that changed the record.
	 *   wr_id : (int) The work request ID.
	 *   newValues : (JSONObject) A JSON object containing "wr.status" and "wr.tr_id".
	 * 
	 * @param context
	 */
	public void auditSaveWorkRequest(EventHandlerContext context) {
		int wrId = context.getInt("wr_id");
		String userName = context.getString("user_name");
		JSONObject newFieldValues = context.getJSONObject("newValues");
		
		String newStatus = newFieldValues.getString("wr.status");
		String newTrId = newFieldValues.getString("wr.tr_id");
		
		String newWorkTeamId = null;
		if (newFieldValues.has("wr.work_team_id")) {
			newWorkTeamId = newFieldValues.getString("wr.work_team_id");
		}
		
		
		Object[] oldValues = selectDbValues(context, "wr", new String[] {"status", "tr_id", "work_team_id"},
				"wr_id = " + wrId);
		
		String oldStatus = notNull(oldValues[0]);
		String oldTrId = notNull(oldValues[1]);
		String oldWorkTeamId = notNull(oldValues[2]);
		
		String insertFields = "wr_id, date_modified, afm_user_name";
		String insertValues = Integer.toString(wrId)
			+ ",'" + getCurrentDateTimeString() + "'"
			+ "," + literal(context, userName);
		
		boolean hasChangedValues = false;
		
		// Add in the insert field and values if necessary
		if (newStatus != null && !newStatus.equals(oldStatus)) {
			insertFields += ", status_old, status_new";
			insertValues += "," + literal(context, oldStatus) + "," + literal(context, newStatus);
			hasChangedValues = true;
		}
		
		if (newTrId != null && !newTrId.equals(oldTrId)) {
			insertFields += ", tr_id_old, tr_id_new";
			insertValues += "," + literal(context, oldTrId) + "," + literal(context, newTrId);
			hasChangedValues = true;
		}
		
		if (newWorkTeamId != null && !newWorkTeamId.equals(oldWorkTeamId)) {
			insertFields += ", work_team_id_old, work_team_id_new";
			insertValues += "," + literal(context, oldWorkTeamId) + "," + literal(context, newWorkTeamId);
			hasChangedValues = true;
		}
		
		// Execute the insert statement if there are changes.
		if (hasChangedValues) {
			String sql = "INSERT INTO uc_wr_audit (" + insertFields + ")"
				+ " VALUES (" + insertValues + ")";
			
			// run the sql statement, throw Exception if it wasn't inserted.
			executeDbSql(context, sql, true);
			executeDbCommit(context);
		}
	}
	
	private String getCurrentDateTimeString() {
		String date_format = "yyyy-MM-dd HH:mm:ss";
		
		Calendar cal = Calendar.getInstance();
		SimpleDateFormat dateFormatter = new SimpleDateFormat(date_format);
		return dateFormatter.format(cal.getTime());
	}
}
