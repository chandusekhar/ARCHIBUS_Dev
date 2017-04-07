package com.archibus.service.space.helper;

import java.util.*;

import org.json.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.datasource.data.DataRecord;
import com.archibus.service.space.*;

/**
 * <p>
 * Space Transaction AssignmentObject helper class.<br>
 *
 * @author ASC-BJ, Song
 *
 *         Justification: This class contains public AssignmentOjbect convert related method.
 */
public final class SpaceTransactionAssignmentHelper {

    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private SpaceTransactionAssignmentHelper() {
    }

    /**
     * save data to Assignments from rmpct record.
     *
     * @param dataRecord DataRecord
     * @return newAssign JSONObject.
     */
    public static JSONObject saveRecordToAssianments(final DataRecord dataRecord) {
        final Integer activityLogId = dataRecord
            .getInt(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.ACTIVITY_LOG_ID);
        final JSONObject newAssign = new JSONObject();
        newAssign.put("status", 1);
        newAssign.put("action", "update");
        newAssign.put("activity_log_id", activityLogId);
        newAssign.put("em_id", dataRecord.getString("rmpct.em_id"));
        newAssign.put("from_bl_id", dataRecord.getString("rmpct.from_bl_id"));
        newAssign.put("from_fl_id", dataRecord.getString("rmpct.from_fl_id"));
        newAssign.put("from_rm_id", dataRecord.getString("rmpct.from_rm_id"));
        newAssign.put("bl_id",
            dataRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.BL_ID));
        newAssign.put("fl_id",
            dataRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.FL_ID));
        newAssign.put("rm_id",
            dataRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.RM_ID));
        newAssign.put("primary_em", dataRecord.getInt("rmpct.primary_em"));
        newAssign.put("dv_id", dataRecord.getString("rmpct.dv_id"));
        newAssign.put("dp_id", dataRecord.getString("rmpct.dp_id"));
        newAssign.put("rm_cat", dataRecord.getString("rmpct.rm_cat"));
        newAssign.put("rm_type", dataRecord.getString("rmpct.rm_type"));
        newAssign.put("primary_rm", dataRecord.getInt("rmpct.primary_rm"));
        newAssign.put("parent_pct_id", dataRecord
            .getInt(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PARENT_PCT_ID));
        newAssign.put("pct_id",
            dataRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PCT_ID));
        newAssign.put(SpaceConstants.DATE_START, dataRecord
            .getDate(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.DATE_START));
        newAssign.put(SpaceConstants.MO_ID,
            dataRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.MO_ID));
        return newAssign;
    }

    /**
     * modify augment jsonOjbect type from JSONObject to RmpctObject.
     *
     * @param jsonArray JSONArray
     *
     * @return list List<RmpctObject>.
     */
    public static List<AssignmentObject> convertJSONObjectArrayToRmpctObjectList(
            final JSONArray jsonArray) {

        final List<AssignmentObject> list = new ArrayList<AssignmentObject>();
        for (int i = 0; i < jsonArray.length(); i++) {
            final JSONObject jsonObject = jsonArray.getJSONObject(i);
            final AssignmentObject rmpctObject =
                    SpaceTransactionAssignmentHelper.convertJSONObjectToRmpctObject(jsonObject);
            list.add(rmpctObject);
        }
        return list;
    }

    /**
     * modify augment jsonOjbect type from JSONObject to RmpctObject.
     *
     * @param jsonObject JSONObject
     *
     * @return object RmpctObject.
     *
     *         <p>
     *         Suppress PMD warning PMD.UnnecessaryWrapperObjectCreation
     *         <p>
     *         Justification: long value is required for Date constructor
     *         <p>
     *         VT TODO: please read
     *         http://stackoverflow.com/questions/321549/double-to-long-conversion
     */
    @SuppressWarnings("PMD.UnnecessaryWrapperObjectCreation")
    public static AssignmentObject convertJSONObjectToRmpctObject(final JSONObject jsonObject) {

        final RoomTransaction roomTransaction = new RoomTransaction();

        roomTransaction.setBuildingId(jsonObject.optString(SpaceConstants.BL_ID, null));
        roomTransaction.setFloorId(jsonObject.optString(SpaceConstants.FL_ID, null));
        roomTransaction.setRoomId(jsonObject.optString(SpaceConstants.RM_ID, null));

        roomTransaction.setFromBuildingId(jsonObject.optString(SpaceConstants.FROM_BL_ID, null));
        roomTransaction.setFromFloorId(jsonObject.optString(SpaceConstants.FROM_FL_ID, null));
        roomTransaction.setFromRoomId(jsonObject.optString(SpaceConstants.FROM_RM_ID, null));

        roomTransaction.setPrimaryRoom(jsonObject.optInt(SpaceConstants.PRIMARY_RM, 1));
        roomTransaction.setPrimaryEmployee(jsonObject.optInt(SpaceConstants.PRIMARY_EM, 0));
        roomTransaction.setDivisionId(jsonObject.optString(SpaceConstants.DV_ID, null));
        roomTransaction.setDepartmentId(jsonObject.optString(SpaceConstants.DP_ID, null));

        roomTransaction.setType(jsonObject.optString(SpaceConstants.RM_TYPE, null));
        roomTransaction.setStatus(jsonObject.optInt(SpaceConstants.STATUS, 1));
        roomTransaction.setEmployeeId(jsonObject.optString(SpaceConstants.EM_ID, null));
        roomTransaction.setCategory(jsonObject.optString(SpaceConstants.RM_CAT, null));

        roomTransaction.setId(jsonObject.optInt(SpaceConstants.PCT_ID, 0));
        roomTransaction.setParentId(jsonObject.optInt(SpaceConstants.PARENT_PCT_ID, 0));
        roomTransaction.setActivityLogId(jsonObject.optInt(SpaceConstants.ACTIVITY_LOG_ID, 0) == 0
                ? null : jsonObject.optInt(SpaceConstants.ACTIVITY_LOG_ID, 0));

        roomTransaction.setMoId(jsonObject.optInt(SpaceConstants.MO_ID, 0) == 0 ? null
                : jsonObject.optInt(SpaceConstants.MO_ID, 0));
        roomTransaction.setPercentageOfSpace(jsonObject.optDouble(SpaceConstants.PCT_SPACE, 0));

        // KB 3046253 (IOAN) Date object is saved into JSON using milliseconds representation - long
        // value.
        // KB 3047015 Initialize date only when json has a value for
        if (jsonObject.has(SpaceConstants.DATE_START)) {
            roomTransaction.setDateStart(new Date(
                Double.valueOf(jsonObject.optDouble(SpaceConstants.DATE_START)).longValue()));
        }
        if (jsonObject.has(SpaceConstants.DATE_END)) {
            roomTransaction.setDateEnd(new Date(
                Double.valueOf(jsonObject.optDouble(SpaceConstants.DATE_END)).longValue()));
        }

        final AssignmentObject rmpctObject = new AssignmentObject();
        rmpctObject.setAction(jsonObject.optString(SpaceConstants.ACTION, ""));
        rmpctObject.setRoomTransaction(roomTransaction);
        return rmpctObject;

    }
}
