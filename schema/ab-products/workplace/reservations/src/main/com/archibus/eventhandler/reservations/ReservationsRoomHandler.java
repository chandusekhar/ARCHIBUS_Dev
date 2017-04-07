package com.archibus.eventhandler.reservations;

import java.util.*;

import com.archibus.app.reservation.service.WorkRequestService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 * Contains common event handlers used in Rooms reservation WFRs.
 */
public class ReservationsRoomHandler extends ReservationsEventHandlerBase {

    /** Create work request rule id. */
    private static final String RULE_ID = "createWorkRequest";

    /** Identifier for the localized error message. */
    private static final String ERROR_MESSAGE = "CREATEWORKREQUESTERROR";

    /** Identifier for the localized setup description. */
    private static final String SETUP_DESC = "CREATEWORKREQUESTSETUPDESCRIPTION";

    /** Identifier for the localized cleanup description. */
    private static final String CLEANUP_DESC = "CREATEWORKREQUESTCLEANUPDESCRIPTION";

    /** Identifier for the localized reservation comments header. */
    private static final String COMMENTS_DESC = "CREATEWORKREQUESTRESERVATIONCOMMENTSDESCRIPTION";

    /** Identifier for the localized reservation attendees header. */
    private static final String ATTENDEES_DESC = "CREATEWORKREQUESTRESERVATIONATTENDEES";

    // ---------------------------------------------------------------------------------------------
    // BEGIN createWorkRequest wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * Gets the identifier of a created or modified room reservation and generates or updates the
     * work request associated to this reservation if needed Inputs: res_id res_id (String);
     * parent_id parent_id (String); Outputs: message error message in necesary case
     *
     * @param context Event handler context.
     */
    public void createWorkRequest(final EventHandlerContext context) {
        // this.log.info("Executing '"+ACTIVITY_ID+"-"+RULE_ID+"' .... ");
        // Get the input res_id parameter
        String reservationId = (String) context.getParameter("res_id");
        final String parentId = (String) context.getParameter("res_parent");
        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [res_id]: "+resId+" ");

        String sql = "";
        final Map<String, String> messages = new HashMap<String, String>();

        // createWorkRequest rule error message
        messages.put(ERROR_MESSAGE,
            localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR", ERROR_MESSAGE, null));
        // createWorkRequest setup and cleanup description messages
        messages.put(SETUP_DESC,
            localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR", SETUP_DESC, null));
        messages.put(CLEANUP_DESC,
            localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR", CLEANUP_DESC, null));
        // createWorkRequest reservation comments description messages
        messages.put(COMMENTS_DESC,
            localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR", COMMENTS_DESC, null));
        // createWorkRequest reservation attendees count message
        messages.put(ATTENDEES_DESC,
            localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR", ATTENDEES_DESC, null));

        // BEGIN: it gets one or more room reserve
        final Vector<String> vectorRes_Id = new Vector<String>();
        if (!parentId.equals("0")) {
            sql = " SELECT res_id " + " FROM reserve " + " WHERE res_parent= " + parentId;
            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 0]: "+sql);

            try {
                final List<?> recordsSql0 = retrieveDbRecords(context, sql);

                if (!recordsSql0.isEmpty()) {
                    int i = 0;
                    for (final Object name : recordsSql0) {
                        final Map<String, String> values = (Map<String, String>) name;
                        vectorRes_Id.add(i, values.get("res_id"));
                        i++;
                    }
                } else {
                    vectorRes_Id.add(0, "0");
                }
            } catch (final Throwable e) {
                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: " + sql,
                    messages.get(ERROR_MESSAGE), e);
            }

        }
        // END: it gets one or more room reserve
        else {
            vectorRes_Id.add(0, reservationId);
        }

        final Map<String, String> tradesByArrangement = new HashMap<String, String>();
        final Map<String, String> vendorsByArrangement = new HashMap<String, String>();
        final boolean isWorkRequestOnly = WorkRequestService.isWorkRequestOnly();

        // Create work requests for each reservation
        for (final String resId : vectorRes_Id) {
            reservationId = resId;
            if (!reservationId.equals("0") && !reservationId.equals("")) {
                createWorkRequestsForReservation(context, reservationId, messages,
                    tradesByArrangement, vendorsByArrangement, isWorkRequestOnly);
            }
        }
    }

    /**
     * Create work requests for a single reservation.
     *
     * @param context event handler context
     * @param reservationId reservation id
     * @param messages localized messages
     * @param tradesByArrangement cache specifying trade by arrangement type
     * @param vendorsByArrangement cache specifying vendor by arrangement type
     * @param isWorkRequestOnly true if building operations is using only work requests
     */
    private void createWorkRequestsForReservation(final EventHandlerContext context,
            final String reservationId, final Map<String, String> messages,
            final Map<String, String> tradesByArrangement,
            final Map<String, String> vendorsByArrangement, final boolean isWorkRequestOnly) {
        final DataSource reserveRmDs = DataSourceFactory.createDataSourceForFields("reserve_rm",
            new String[] { "res_id", "status", "rm_arrange_type_id" });
        reserveRmDs.setApplyVpaRestrictions(false);
        reserveRmDs.addRestriction(Restrictions.eq("reserve_rm", "res_id", reservationId));
        final DataRecord reserveRmRecord = reserveRmDs.getRecord();

        String statusOfRoomReservation = "";
        String arrangeTypeId = "";
        if (reserveRmRecord != null) {
            statusOfRoomReservation = reserveRmRecord.getString("reserve_rm.status");
            arrangeTypeId = reserveRmRecord.getString("reserve_rm.rm_arrange_type_id");
        }
        final String statusForWorkRequest =
                this.getStatusForWorkRequest(statusOfRoomReservation, isWorkRequestOnly);

        final String tradeToCreate =
                getTradeOrVendorToCreate(tradesByArrangement, arrangeTypeId, "tr", "tr_id");
        final String vendorToCreate =
                getTradeOrVendorToCreate(vendorsByArrangement, arrangeTypeId, "vn", "vn_id");

        // -----------------------------------------------------------------------------------
        // CANCEL/STOP WORK REQUESTS FOR OTHER TRADES / VENDORS
        // -----------------------------------------------------------------------------------
        this.cancelAndStopOtherWorkRequests(context, reservationId, tradeToCreate, vendorToCreate);

        // -----------------------------------------------------------------------------------
        // WORK REQUESTS FOR TRADE
        // -----------------------------------------------------------------------------------
        if (StringUtil.notNullOrEmpty(tradeToCreate)) {
            createWorkRequestsForTradeOrVendor(context, reservationId, statusForWorkRequest,
                "tr_id", tradeToCreate, messages, isWorkRequestOnly);
        }

        // -----------------------------------------------------------------------------------
        // WORK REQUESTS FOR VENDOR
        // -----------------------------------------------------------------------------------
        if (StringUtil.notNullOrEmpty(vendorToCreate)) {
            createWorkRequestsForTradeOrVendor(context, reservationId, statusForWorkRequest,
                "vn_id", vendorToCreate, messages, isWorkRequestOnly);
        }
    }

    /**
     * Cancel (or stop) work requests for different trades and/or vendors.
     *
     * @param context the event handler context
     * @param reservationId the reservation id
     * @param tradeToCreate cancel work requests for all trades except this one
     * @param vendorToCreate cancel work requests for all vendors except this one
     */
    private void cancelAndStopOtherWorkRequests(final EventHandlerContext context,
            final String reservationId, final String tradeToCreate, final String vendorToCreate) {

        final DataSource workRequestDataSource = this.createDataSourceToCancelOtherWorkRequests(
            reservationId, tradeToCreate, vendorToCreate);
        workRequestDataSource.addRestriction(Restrictions.isNotNull("wr", "rmres_id"));

        final List<DataRecord> records = workRequestDataSource.getRecords();
        WorkRequestService.cancelWorkRequests(workRequestDataSource, records);
    }

    /**
     * Create or update work requests for a specified trade or vendor and reservation.
     *
     * @param context event handler context
     * @param reservationId reservation identifier
     * @param statusForWorkRequest new status for the work requests
     * @param createFor tr_id or vn_id when creating for a trade or vendor
     * @param nameToCreate which trade or vendor to create for
     * @param messages localized messages used for error reporting and work request description
     * @param isWorkRequestOnly true if BuildingOps handles only work requests
     */
    private void createWorkRequestsForTradeOrVendor(final EventHandlerContext context,
            final String reservationId, final String statusForWorkRequest, final String createFor,
            final String nameToCreate, final Map<String, String> messages,
            final boolean isWorkRequestOnly) {
        final DataSource dsWr =
                this.createDataSourceToSaveWorkRequests(createFor, nameToCreate, reservationId);
        final List<DataRecord> workRequests = dsWr.getRecords();
        DataRecord setupRequest = null;
        DataRecord cleanupRequest = null;
        if (workRequests.size() < 2) {
            // no work requests found, so create new records
            setupRequest = dsWr.createNewRecord();
            cleanupRequest = dsWr.createNewRecord();
        } else {
            setupRequest = workRequests.get(0);
            cleanupRequest = workRequests.get(1);
        }

        // retrieve all relevant data with a custom query
        final DataRecord dataRecord = this.retrieveData(context, reservationId, nameToCreate,
            createFor, messages, statusForWorkRequest);

        // create or update the work request records
        saveWorkRequest(dsWr, setupRequest, dataRecord, "reserve_rm", "rmres_id", createFor,
            "_setup");
        saveWorkRequest(dsWr, cleanupRequest, dataRecord, "reserve_rm", "rmres_id", createFor,
            "_cleanup");
    }

    /**
     * Determine for which trade or vendor the given room arrangement type needs work requests.
     *
     * @param namesByArrangement cache of room arrangement types for which we already know the
     *            corresponding trade or vendor identifier
     * @param arrangeTypeId the room arrangement type identifier
     * @param tableName tr or vn when looking for a trade or vendor
     * @param fieldName tr_id or vn_id when looking for a trade or vendor
     * @return the trade or vendor identifier for the given room arrangement type (or empty if no
     *         work requests should be generated for any trade / vendor)
     */
    private String getTradeOrVendorToCreate(final Map<String, String> namesByArrangement,
            final String arrangeTypeId, final String tableName, final String fieldName) {
        String nameToCreate = namesByArrangement.get(arrangeTypeId);
        if (nameToCreate == null) {
            final DataSource arrangeTypeDs = DataSourceFactory.createDataSourceForFields(
                "rm_arrange_type", new String[] { "rm_arrange_type_id", fieldName });
            arrangeTypeDs.addTable(tableName, DataSource.ROLE_STANDARD);
            arrangeTypeDs.addField(tableName, "wr_from_reserve");

            arrangeTypeDs.addRestriction(
                Restrictions.eq("rm_arrange_type", "rm_arrange_type_id", arrangeTypeId));
            arrangeTypeDs.addRestriction(Restrictions.isNotNull("rm_arrange_type", fieldName));
            arrangeTypeDs.addRestriction(Restrictions.eq(tableName, "wr_from_reserve", 1));
            final DataRecord arrangeRecord = arrangeTypeDs.getRecord();
            if (arrangeRecord == null) {
                nameToCreate = "";
            } else {
                nameToCreate = arrangeRecord.getString("rm_arrange_type." + fieldName);
            }
            namesByArrangement.put(arrangeTypeId, nameToCreate);
        }
        return nameToCreate;
    }

    /**
     * Retrieve reservation data to create the work requests.
     *
     * @param context event handler context
     * @param reservationId reservation id
     * @param createForId trade or vendor identifier
     * @param createFor tr_id or vn_id when creating for a trade or vendor
     * @param messages localized messages used in the work request description
     * @param statusForWorkRequest new status for the work request
     * @return the reservations data in a reserve_rm record with a lot of virtual fields
     */
    private DataRecord retrieveData(final EventHandlerContext context, final String reservationId,
            final String createForId, final String createFor, final Map<String, String> messages,
            final String statusForWorkRequest) {

        final String querySql =

                " SELECT reserve_rm.res_id, reserve_rm.rmres_id, "
                        + " reserve_rm.bl_id, reserve_rm.fl_id, reserve_rm.rm_id, "
                        + " reserve.user_requested_by ${sql.as} requestor, "
                        + literal(context, statusForWorkRequest)
                        + " ${sql.as} status, reserve_rm.date_start ${sql.as} date_assigned, "
                        + literal(context, createForId) + " ${sql.as} " + createFor + ", "
                        + " reserve.phone ${sql.as} phone, reserve.dv_id ${sql.as} dv_id, reserve.dp_id ${sql.as} dp_id, "
                        + "reserve_rm.time_start ${sql.as} time_assigned_setup, "
                        + "reserve_rm.time_end ${sql.as} time_assigned_cleanup, "
                        + formatSqlIsNull(context, "-rm_arrange.pre_block , 0")
                        + " ${sql.as} delta_time_setup, " + " 0 ${sql.as} delta_time_cleanup, "
                        + formatSqlIsNull(context, "rm_arrange.pre_block , 0")
                        + "/60 ${sql.as} est_labor_hours_setup, "
                        + formatSqlIsNull(context, "rm_arrange.post_block , 0")
                        + "/60 ${sql.as} est_labor_hours_cleanup, "
                        + getWrDescriptionSql(context, messages.get(SETUP_DESC),
                            messages.get(ATTENDEES_DESC), messages.get(COMMENTS_DESC))
                        + " ${sql.as} description_setup, "
                        + getWrDescriptionSql(context, messages.get(CLEANUP_DESC),
                            messages.get(ATTENDEES_DESC), messages.get(COMMENTS_DESC))
                        + " ${sql.as} description_cleanup, "
                        + " 'RES. SETUP' ${sql.as} prob_type_setup, "
                        + " 'RES. CLEANUP' ${sql.as} prob_type_cleanup "
                        + " FROM reserve_rm, reserve, rm_arrange "
                        + " WHERE reserve_rm.res_id=reserve.res_id " + " AND reserve_rm.res_id= "
                        + reservationId + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                        + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                        + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                        + " AND reserve_rm.config_id=rm_arrange.config_id "
                        + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ";

        final DataSource ds0 = DataSourceFactory.createDataSource();
        final String tableName = "reserve_rm";
        ds0.addTable(tableName, DataSource.ROLE_MAIN);
        ds0.setApplyVpaRestrictions(false);
        ds0.addQuery(querySql);

        // Add all virtual fields
        this.addVirtualFields(ds0, tableName, "rmres_id", createFor);

        return ds0.getRecord();
    }

    /**
     * Get the SQL string for the work request description.
     *
     * @param context event handler context
     * @param headerDesc header for the description
     * @param reservationAttendees title for number of attendees
     * @param reservationComments title for reservation comments
     * @return SQL string
     */
    private String getWrDescriptionSql(final EventHandlerContext context, final String headerDesc,
            final String reservationAttendees, final String reservationComments) {
        final StringBuffer wrDescriptionSql = new StringBuffer();
        wrDescriptionSql.append(literal(context, headerDesc) + formatSqlConcat(context) + "'. '"
                + formatSqlConcat(context));

        // KB 3043641 - include number of attendees - only if the new field is defined in DB schema.
        if (ContextStore.get().getProject().loadTableDef("reserve_rm")
            .findFieldDef("attendees_in_room") != null) {
            wrDescriptionSql.append(literal(context, reservationAttendees)
                    + formatSqlConcat(context) + "' '" + formatSqlConcat(context)
                    + " CAST(reserve_rm.attendees_in_room AS VARCHAR(5)) "
                    + formatSqlConcat(context) + "'. '" + formatSqlConcat(context));
        }

        wrDescriptionSql.append(literal(context, reservationComments) + formatSqlConcat(context)
                + "' '" + formatSqlConcat(context)
                + formatSqlIsNull(context, "RTRIM(reserve.comments) , ''")
                + formatSqlConcat(context) + "'. '" + formatSqlConcat(context)
                + formatSqlIsNull(context, "RTRIM(reserve_rm.comments) , ''"));
        return wrDescriptionSql.toString();
    }

}
