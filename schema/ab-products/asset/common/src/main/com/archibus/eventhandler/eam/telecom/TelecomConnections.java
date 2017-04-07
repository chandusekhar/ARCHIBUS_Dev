package com.archibus.eventhandler.eam.telecom;

import java.util.List;

import org.json.*;

import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.StringUtil;

/**
 *
 * Version 22.1 Enterprise Asset Management - Telecom Service data Connections.
 * <p>
 * Methods used to get connections data toward the client and toward the server.
 *
 * @author Radu Bunea
 * @since 22.1
 *
 */
public class TelecomConnections {
    /**
     *
     * Get asset connections.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPorts list of asset ports
     * @return JSONArray of connections with data like
     *         <p>
     *         {assetType: assetType, assetId:assetId assetPort: assetPort,
     *         towardClientConnections:[towardClientConnections],
     *         towardServerConnections:[towardServerConnections]}
     */
    public JSONArray getAssetConnections(final String assetType, final String assetId,
            final List<String> assetPorts) {
        final JSONArray locations = new JSONArray();
        if (assetPorts.isEmpty()) {
            locations.put(getConnections(assetType, assetId, null));
        } else {
            for (final String assetPort : assetPorts) {
                locations.put(getConnections(assetType, assetId, assetPort));
            }
        }
        return locations;
    }

    /**
     *
     * Get connections by asset and port.
     *
     * @param assetType Asset type
     * @param assetId Asset id
     * @param assetPort Asset port
     * @return JSONObject connection data
     */
    private JSONObject getConnections(final String assetType, final String assetId,
            final String assetPort) {
        final JSONObject result = new JSONObject();
        result.put(Constants.ASSET_TYPE, assetType);
        result.put(Constants.ASSET_ID, assetId);
        result.put(Constants.ASSET_PORT, assetPort);
        result.put(Constants.TOWARD_CLIENT_CONNECTIONS,
            getTowardClientConnections(assetType, assetId, assetPort));
        result.put(Constants.TOWARD_SERVER_CONNECTIONS,
            getTowardServerConnections(assetType, assetId, assetPort));
        return result;
    }

    /**
     *
     * Get toward the client connections.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPort asset port
     * @return JSONArray of connections
     */
    private JSONArray getTowardClientConnections(final String assetType, final String assetId,
            final String assetPort) {
        final JSONArray towardClientConnections = new JSONArray();
        JSONObject connection =
                TelecomHelper.getTowardClientConnection(assetType, assetId, assetPort);
        if (connection != null) {
            do {
                final String connectedFromAssetType =
                        connection.getString(Constants.CONNECT_ASSET_TYPE);
                final String connectedFromAssetId =
                        connection.getString(Constants.CONNECT_ASSET_CODE);
                final String connectedFromAssetPort = connection.has(Constants.CONNECT_ASSET_PORT)
                        ? connection.getString(Constants.CONNECT_ASSET_PORT) : "";

                final JSONObject connectionResult = createConnectionResult(connectedFromAssetType,
                    connectedFromAssetId, connectedFromAssetPort);
                // check is_multiplexing
                if (Constants.EQPORT_TYPE.equals(connectedFromAssetType)) {
                    connectionResult.put(Constants.IS_MULTIPLEXING,
                        TelecomHelper.isMultiplexingEquipment(connectedFromAssetId));
                    final List<DataRecord> multiplexingPorts = TelecomHelper
                        .getMultiplexingRecordsTowardTheClient(connectedFromAssetId);
                    final JSONArray multiplexingConnections = new JSONArray();
                    for (final DataRecord multiplexingPortRecord : multiplexingPorts) {
                        final String multiplexingAssetType = multiplexingPortRecord.getString(
                            Constants.EQPORT_TYPE + Constants.DOT + Constants.CONNECT_ASSET_TYPE);
                        final String multiplexingAsset = multiplexingPortRecord.getString(
                            Constants.EQPORT_TYPE + Constants.DOT + Constants.CONNECT_ASSET_CODE);
                        final String multiplexingPort = multiplexingPortRecord.getString(
                            Constants.EQPORT_TYPE + Constants.DOT + Constants.CONNECT_ASSET_PORT);
                        final JSONObject assetConnections = getConnections(multiplexingAssetType,
                            multiplexingAsset, multiplexingPort);
                        multiplexingConnections.put(assetConnections);
                    }
                    connectionResult.put(Constants.MULTIPLEXING_CONNECTIONS,
                        multiplexingConnections);
                }
                towardClientConnections.put(connectionResult);

                connection = TelecomHelper.getTowardClientConnection(connectedFromAssetType,
                    connectedFromAssetId, connectedFromAssetPort);
            } while (connection != null);
        }
        return towardClientConnections;
    }

    /**
     *
     * Get toward the server connections.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPort asset port
     * @return JSONArray of connections from first connection to last connection
     */
    private JSONArray getTowardServerConnections(final String assetType, final String assetId,
            final String assetPort) {
        final JSONArray towardServerConnections = new JSONArray();

        JSONObject connection =
                TelecomHelper.getTowardServerConnection(assetType, assetId, assetPort);
        if (connection != null) {
            do {
                final String connectedToAssetType =
                        connection.getString(Constants.CONNECT_ASSET_TYPE);
                final String connectedToAssetId =
                        connection.getString(Constants.CONNECT_ASSET_CODE);
                final String connectedToAssetPort = connection.has(Constants.CONNECT_ASSET_PORT)
                        ? connection.getString(Constants.CONNECT_ASSET_PORT) : "";

                final JSONObject connectionResult = createConnectionResult(connectedToAssetType,
                    connectedToAssetId, connectedToAssetPort);

                // check is_multiplexing
                if (Constants.EQPORT_TYPE.equals(connectedToAssetType)) {
                    connectionResult.put(Constants.IS_MULTIPLEXING,
                        TelecomHelper.isMultiplexingEquipment(connectedToAssetId));
                    final List<String> multiplexingPorts =
                            TelecomHelper.getMultiplexingPortsTowardTheServer(connectedToAssetId);
                    final JSONArray multiplexingConnections = new JSONArray();
                    for (final String multiplexingPort : multiplexingPorts) {
                        final JSONObject assetConnections = getConnections(connectedToAssetType,
                            connectedToAssetId, multiplexingPort);
                        multiplexingConnections.put(assetConnections);
                    }
                    connectionResult.put(Constants.MULTIPLEXING_CONNECTIONS,
                        multiplexingConnections);
                }

                towardServerConnections.put(connectionResult);

                connection = TelecomHelper.getTowardServerConnection(connectedToAssetType,
                    connectedToAssetId, connectedToAssetPort);
            } while (connection != null);
        }

        return towardServerConnections;
    }

    /**
     *
     * Create connection result data.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPort asset port
     * @return JSONObject data {connectedAssetType: connectedAssetType,
     *         connectedAssetId:connectedAssetId, connectedAssetPort: connectedAssetPort, location:
     *         {blId:buildingId, flId:floorId, rmId:roomId}
     */
    private JSONObject createConnectionResult(final String assetType, final String assetId,
            final String assetPort) {
        String connectedAssetType = assetType;
        String connectedAssetId = assetId;
        String connectedAssetPort = assetPort;
        // check if jack is part of faceplate. If yes, connectedAssetId is fpId and
        // connectedAssetPort is assetId
        final String fpId = TelecomHelper.getFaceplateByJack(connectedAssetType, connectedAssetId);
        if (StringUtil.notNullOrEmpty(fpId)) {
            connectedAssetType = Constants.FP_TYPE;
            connectedAssetPort = assetId;
            connectedAssetId = fpId;
        }
        final JSONObject connectionLocation =
                TelecomHelper.getConnectionLocation(assetType, assetId);

        final JSONObject result = new JSONObject();
        result.put("connectedAssetType", connectedAssetType);
        result.put("connectedAssetId", connectedAssetId);
        result.put("connectedAssetPort", connectedAssetPort);
        result.put("location", connectionLocation);
        return result;
    }
}