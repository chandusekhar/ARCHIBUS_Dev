package com.archibus.eventhandler.reservations;

import java.util.*;

import org.json.JSONObject;

import com.archibus.app.reservation.service.WorkRequestService;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

public class ReservationsResourcesHandler extends ReservationsEventHandlerBase {

    /** Create work request rule id. */
    private static final String RULE_ID = "createResourceWr";

    /** Identifier for the localized error message. */
    private static final String ERROR_MESSAGE = "SAVERESOURCEERROR";

    /** Identifier for the localized setup description. */
    private static final String SETUP_DESC = "CREATEWORKREQUESTSETUPDESCRIPTION";

    /** Identifier for the localized cleanup description. */
    private static final String CLEANUP_DESC = "CREATEWORKREQUESTCLEANUPDESCRIPTION";

    /** Identifier for the localized reservation comments header. */
    private static final String COMMENTS_DESC = "CREATEWORKREQUESTRESERVATIONCOMMENTSDESCRIPTION";

    /** Identifier for the localized reservation quantity header. */
    private static final String QUANTITY_DESC = "CREATEWORKREQUESTRESERVATIONQUANTITY";

    /**
     * Create work requests for resource reservations.
     *
     * @param context event handler context
     * @param parentId parent reservation id to create requests for a recurring reservation
     * @param newResId single reservation id to create requests for a single reservation
     */
    public void createResourceWr(final EventHandlerContext context, final String parentId,
            final String newResId) {

        final Map<String, String> messages = new HashMap<String, String>();

        messages.put(SETUP_DESC,
            localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR", SETUP_DESC, null));
        messages.put(CLEANUP_DESC,
            localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR", CLEANUP_DESC, null));
        messages.put(COMMENTS_DESC,
            localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR", COMMENTS_DESC, null));
        messages.put(ERROR_MESSAGE, localizeMessage(context, ACTIVITY_ID,
            "SAVERESOURCERESERVATIONS_WFR", ERROR_MESSAGE, null));
        messages.put(QUANTITY_DESC,
            localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR", QUANTITY_DESC, null));
        String sql = "";
        final List<String> listResId = new ArrayList<String>();

        if (!"0".equals(parentId)) {
            sql = "SELECT res_id FROM reserve WHERE res_parent = " + literal(context, parentId);
            final List<?> recurringResIdList = retrieveDbRecords(context, sql);
            for (final Object name : recurringResIdList) {
                final String resIdTemp = getString((Map<?, ?>) name, "res_id");
                listResId.add(resIdTemp);
            }
        } else if (!"0".equals(newResId)) {
            listResId.add(newResId);
        }

        final boolean isWorkRequestOnly = WorkRequestService.isWorkRequestOnly();
        final Map<String, String> tradesByResourceId = new HashMap<String, String>();
        final Map<String, String> vendorsByResourceId = new HashMap<String, String>();

        for (final String res_id : listResId) {
            sql = "SELECT status, rsres_id, resource_id FROM reserve_rs WHERE res_id = "
                    + literal(context, res_id);
            final List<?> resourceReservations = retrieveDbRecords(context, sql);
            for (int i = 0; i < resourceReservations.size(); i++) {
                final JSONObject event = new JSONObject();

                event.put("status", getString((Map<?, ?>) resourceReservations.get(i), "status"));
                event.put("resource_id",
                    getString((Map<?, ?>) resourceReservations.get(i), "resource_id"));
                event.put("rsres_id",
                    getString((Map<?, ?>) resourceReservations.get(i), "rsres_id"));
                event.put("res_id", res_id);

                createWorkRequestsForReservation(context, event, messages, tradesByResourceId,
                    vendorsByResourceId, isWorkRequestOnly);

            }
        }
    }

    /**
     * Create work requests for a single resource reservation.
     *
     * @param context event handler context
     * @param event resource reservation event
     * @param messages localized messages used for error reporting and description
     * @param tradesByResourceId cache with trades by resource id
     * @param vendorsByResourceId cache with vendors by resource id
     * @param isWorkRequestOnly indicates whether BuildingOps is using only work requests
     */
    private void createWorkRequestsForReservation(final EventHandlerContext context,
            final JSONObject event, final Map<String, String> messages,
            final Map<String, String> tradesByResourceId,
            final Map<String, String> vendorsByResourceId, final boolean isWorkRequestOnly) {

        final String resourceId = event.getString("resource_id");
        final String statusOfReservation = event.getString("status");

        if (statusOfReservation.equals("Cancelled") || statusOfReservation.equals("Rejected")) {
            /*
             * Cancelled and rejected reservation: Cancel all work requests for this reservation by
             * not passing any trade or vendor
             */
            this.cancelAndStopOtherWorkRequests(context, event, null, null);
        } else {
            String tradeToCreate = "";
            String vendorToCreate = "";

            final String statusForWorkRequest =
                    this.getStatusForWorkRequest(statusOfReservation, isWorkRequestOnly);

            // Check if the resource has trade that accepts wrs from reservations
            tradeToCreate = getTradeOrVendorToCreate(context, tradesByResourceId, resourceId,
                messages, "tr", "tr_id");

            // Check if resource has vendor that accepts wrs from reservations
            vendorToCreate = getTradeOrVendorToCreate(context, vendorsByResourceId, resourceId,
                messages, "vn", "vn_id");

            this.cancelAndStopOtherWorkRequests(context, event, tradeToCreate, vendorToCreate);

            if (StringUtil.notNullOrEmpty(tradeToCreate)) {
                createWorkRequestsForTradeOrVendor(context, event, messages, "tr_id", tradeToCreate,
                    statusForWorkRequest, isWorkRequestOnly);
            }

            if (StringUtil.notNullOrEmpty(vendorToCreate)) {
                createWorkRequestsForTradeOrVendor(context, event, messages, "vn_id",
                    vendorToCreate, statusForWorkRequest, isWorkRequestOnly);
            }
        }
    }

    /**
     * Get the id of the trade or vendor for which to create work requests.
     *
     * @param context event handler context
     * @param namesByResourceId cache mapping resource id's to the corresponding trade or vendor
     * @param resourceId resource id to get the trade or vendor for
     * @param messages localized messages for error reporting
     * @param tableName tr or vn to handle trades or vendors
     * @param fieldName tr_id or vn_id to handle trades or vendors
     * @return id of the trade or vendor, empty string if none
     */
    private String getTradeOrVendorToCreate(final EventHandlerContext context,
            final Map<String, String> namesByResourceId, final String resourceId,
            final Map<String, String> messages, final String tableName, final String fieldName) {
        String sql;
        String nameToCreate = namesByResourceId.get(resourceId);
        if (nameToCreate == null) {
            try {
                sql = " SELECT resource_std." + fieldName + " FROM resource_std LEFT OUTER JOIN "
                        + tableName + " ON resource_std." + fieldName + " = " + tableName + "."
                        + fieldName + " LEFT OUTER JOIN resources "
                        + " ON resources.resource_std = resource_std.resource_std " + " WHERE "
                        + tableName + ".wr_from_reserve = 1 AND resources.resource_id = "
                        + literal(context, resourceId);

                final List<?> records = selectDbRecords(context, sql);

                if (records.size() > 0) {
                    final Object[] nameToCreateObject = (Object[]) records.get(0);
                    nameToCreate = nameToCreateObject[0].toString();
                }
            } catch (final Throwable e) {
                handleError(context,
                    ACTIVITY_ID + "-" + RULE_ID
                            + ": Could not retrieve trades or vendors for work requests: ",
                    messages.get(ERROR_MESSAGE), e);
            }

            if (nameToCreate == null) {
                nameToCreate = "";
            }
            namesByResourceId.put(resourceId, nameToCreate);
        }
        return nameToCreate;
    }

    /**
     * Cancel or stop work requests for other trades and vendors.
     *
     * @param context event handler context
     * @param event resource reservation event
     * @param tradeToCreate cancel work requests for all trades except this one
     * @param vendorToCreate cancel work requests for all vendors except this one
     */
    private void cancelAndStopOtherWorkRequests(final EventHandlerContext context,
            final JSONObject event, final String tradeToCreate, final String vendorToCreate) {

        final String resId = event.getString("res_id");
        final String rsResId = event.getString("rsres_id");

        // Retrieve matching work requests from the database
        final DataSource workRequestDataSource = this
            .createDataSourceToCancelOtherWorkRequests(resId, tradeToCreate, vendorToCreate);
        workRequestDataSource.addRestriction(Restrictions.eq("wr", "rsres_id", rsResId));

        final List<DataRecord> records = workRequestDataSource.getRecords();
        WorkRequestService.cancelWorkRequests(workRequestDataSource, records);
    }

    /**
     * Create or update work requests for a specified trade or vendor and reservation.
     *
     * @param context event handler context
     * @param event resource reservation event
     * @param statusForWorkRequest new status for the work requests
     * @param createFor tr_id or vn_id when creating for a trade or vendor
     * @param nameToCreate which trade or vendor to create for
     * @param messages localized messages used for error reporting and work request description
     * @param isWorkRequestOnly true if BuildingOps handles only work requests
     */
    private void createWorkRequestsForTradeOrVendor(final EventHandlerContext context,
            final JSONObject event, final Map<String, String> messages, final String createFor,
            final String nameToCreate, final String statusForWorkRequest,
            final boolean isWorkRequestOnly) {

        final String resId = event.getString("res_id");
        final String rsResId = event.getString("rsres_id");

        final DataSource dsWr = createDataSourceToSaveWorkRequests(createFor, nameToCreate, resId);
        dsWr.addRestriction(Restrictions.eq("wr", "rsres_id", rsResId));
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
        final DataRecord dataRecord = this.retrieveData(context, event, nameToCreate, createFor,
            messages, statusForWorkRequest);

        // create or update the work request records
        saveWorkRequest(dsWr, setupRequest, dataRecord, "reserve_rs", "rsres_id", createFor,
            "_setup");
        saveWorkRequest(dsWr, cleanupRequest, dataRecord, "reserve_rs", "rsres_id", createFor,
            "_cleanup");
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
    private DataRecord retrieveData(final EventHandlerContext context, final JSONObject event,
            final String createForId, final String createFor, final Map<String, String> messages,
            final String statusForWorkRequest) {

        final String resId = event.getString("res_id");
        final String rsResId = event.getString("rsres_id");

        final String querySql =

                " SELECT reserve_rs.res_id, reserve_rs.rsres_id, "
                        + " reserve_rs.bl_id, reserve_rs.fl_id, reserve_rs.rm_id, "
                        + " reserve.user_requested_by ${sql.as} requestor, "
                        + literal(context, statusForWorkRequest)
                        + " ${sql.as} status, reserve_rs.date_start ${sql.as} date_assigned, "
                        + literal(context, createForId) + " ${sql.as} " + createFor + ", "
                        + " reserve.phone ${sql.as} phone, reserve.dv_id ${sql.as} dv_id, reserve.dp_id ${sql.as} dp_id, "
                        + "reserve_rs.time_start ${sql.as} time_assigned_setup, "
                        + "reserve_rs.time_end ${sql.as} time_assigned_cleanup, "
                        + formatSqlIsNull(context, "-resources.pre_block , 0")
                        + " ${sql.as} delta_time_setup, " + " 0 ${sql.as} delta_time_cleanup, "
                        + formatSqlIsNull(context, "resources.pre_block , 0")
                        + "/60 ${sql.as} est_labor_hours_setup, "
                        + formatSqlIsNull(context, "resources.post_block , 0")
                        + "/60 ${sql.as} est_labor_hours_cleanup, "
                        + getWrDescriptionSql(context, messages.get(SETUP_DESC),
                            messages.get(QUANTITY_DESC), messages.get(COMMENTS_DESC))
                        + " ${sql.as} description_setup, "
                        + getWrDescriptionSql(context, messages.get(CLEANUP_DESC),
                            messages.get(QUANTITY_DESC), messages.get(COMMENTS_DESC))
                        + " ${sql.as} description_cleanup, "
                        + " 'RES. SETUP' ${sql.as} prob_type_setup, "
                        + " 'RES. CLEANUP' ${sql.as} prob_type_cleanup "
                        + " FROM reserve_rs, reserve, resources "
                        + " WHERE reserve_rs.res_id=reserve.res_id " + " AND reserve_rs.res_id= "
                        + resId + " AND reserve_rs.rsres_id= " + rsResId
                        + " AND reserve_rs.resource_id=resources.resource_id ";

        final DataSource ds0 = DataSourceFactory.createDataSource();
        final String tableName = "reserve_rs";
        ds0.addTable(tableName, DataSource.ROLE_MAIN);
        ds0.setApplyVpaRestrictions(false);
        ds0.addQuery(querySql);

        // Add all virtual fields
        addVirtualFields(ds0, tableName, "rsres_id", createFor);

        return ds0.getRecord();
    }

    /**
     * Get the SQL string for the work request description.
     *
     * @param context event handler context
     * @param headerDesc header for the description
     * @param reservationQuantity title for quantity
     * @param reservationComments title for reservation comments
     * @return SQL string
     */
    private String getWrDescriptionSql(final EventHandlerContext context, final String headerDesc,
            final String reservationQuantity, final String reservationComments) {
        final StringBuffer wrDescriptionSql = new StringBuffer();
        wrDescriptionSql.append(literal(context, headerDesc) + formatSqlConcat(context) + "'. '"
                + formatSqlConcat(context));

        wrDescriptionSql.append(literal(context, reservationQuantity) + formatSqlConcat(context)
                + "' '" + formatSqlConcat(context) + " CAST(reserve_rs.quantity AS VARCHAR(5)) "
                + formatSqlConcat(context) + "'. '" + formatSqlConcat(context));

        wrDescriptionSql.append(literal(context, reservationComments) + formatSqlConcat(context)
                + "' '" + formatSqlConcat(context)
                + formatSqlIsNull(context, "RTRIM(reserve.comments) , ''")
                + formatSqlConcat(context) + "'. '" + formatSqlConcat(context)
                + formatSqlIsNull(context, "RTRIM(reserve_rs.comments) , ''"));
        return wrDescriptionSql.toString();
    }

}
