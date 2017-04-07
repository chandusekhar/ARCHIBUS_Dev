package com.archibus.eventhandler.eam.telecom;

import java.util.*;

import org.json.JSONArray;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.StringUtil;

/**
 *
 * Version 22.1 Enterprise Asset Management - Telecom Service highlight rooms.
 * <p>
 * Methods used to highlight spaces on the drawing.
 *
 * @author Radu Bunea
 * @since 22.1
 *
 */
public class TelecomHighlightRooms {

    /**
     *
     * Get a list of asset connections to highlight connections rooms.
     * <p>
     * The list contains toward the client connections and toward the server connections.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPorts asset ports
     * @return JSONArray of connections
     */
    public JSONArray highlightConnectedRooms(final String assetType, final String assetId,
            final List<String> assetPorts) {
        return new TelecomConnections().getAssetConnections(assetType, assetId, assetPorts);
    }

    /**
     *
     * Highlight spaces with open jacks.
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this class.
     * <p>
     * Justification: Case #1: Restriction with SELECT pattern .
     *
     * @param buildingId - building id
     * @param floorId - floor id
     * @param telecomService - from tc_service field. Values are V or D to indicate voice or data
     *            jack
     *
     * @return return list of room ids where we have open jacks.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public List<String> highlightRoomsWithOpenJacks(final String buildingId, final String floorId,
            final String telecomService) {
        String sqlPart = "";
        if (StringUtil.notNullOrEmpty(telecomService)) {
            sqlPart = " AND jk.tc_service = " + SqlUtils.formatValueForSql(telecomService);
        }
        final String sql =
                "SELECT rm_id FROM rm WHERE EXISTS (SELECT 1 FROM jk WHERE jk.bl_id=rm.bl_id AND jk.fl_id=rm.fl_id and jk.rm_id=rm.rm_id "
                        + sqlPart
                        + " AND NOT EXISTS (SELECT tc_jk_id FROM eq WHERE tc_jk_id=jk_id) ) AND bl_id='"
                        + buildingId + "' AND fl_id='" + floorId + "'";
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(Constants.RM_TABLE);
        dataSource.addVirtualField("rm", Constants.RM_ID, DataSource.DATA_TYPE_TEXT);
        dataSource.addQuery(sql, SqlExpressions.DIALECT_GENERIC);
        final List<DataRecord> records = dataSource.getRecords();
        final List<String> roomIds = new ArrayList<String>();
        for (final DataRecord record : records) {
            final String rmId =
                    record.getString(Constants.RM_TABLE + Constants.DOT + Constants.RM_ID);
            roomIds.add(rmId);
        }
        return roomIds;
    }
}
