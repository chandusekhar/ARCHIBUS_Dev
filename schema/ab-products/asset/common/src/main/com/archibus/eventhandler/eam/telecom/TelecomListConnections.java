package com.archibus.eventhandler.eam.telecom;

import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;

/**
 *
 * Version 22.1 Enterprise Asset Management - Telecom Service List Connections.
 * <p>
 * Methods used to list connections.
 *
 * @author Radu Bunea
 * @since 22.1
 *
 */
public class TelecomListConnections {
    /**
     * Translatable elements used to build the list connections.
     */
    /**
     * Equipment.
     */
    // @translatable
    static final String EQUIPMENT = "Equipment";

    /**
     * Equipment port.
     */
    // @translatable
    static final String EQUIPMENT_PORT = "Equipment Port";

    /**
     * Panel.
     */
    // @translatable
    static final String PANEL = "Panel";

    /**
     * Faceplate.
     */
    // @translatable
    static final String FACEPLATE = "Faceplate";

    /**
     * Jack.
     */
    // @translatable
    static final String JACK = "Jack";

    /**
     * Port.
     */
    // @translatable
    static final String PORT = "Port";

    /**
     * Patch Panel Port.
     */
    // @translatable
    static final String PATCH_PANEL_PORT = "Patch Panel Port";

    /**
     *
     * List asset connections.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPorts list of asset ports
     * @return JSONArray of connections with data like
     *         <p>
     *         {assetType: assetType, assetId:assetId assetPort: assetPort,
     *         towardClientConnections:[towardClientConnections],
     *         towardServerConnections:[towardServerConnections],
     *         localizedAsset:localizedAssetTypeTitle,assetStd:assetStandard}
     */
    public JSONArray listAssetConnections(final String assetType, final String assetId,
            final List<String> assetPorts) {
        final JSONArray connections = new JSONArray();
        if (assetPorts.isEmpty()) {
            final JSONObject result = getConnections(assetType, assetId, null, true);
            connections.put(result);
        } else {
            for (final String assetPort : assetPorts) {
                final JSONObject result = getConnections(assetType, assetId, assetPort, true);
                connections.put(result);
            }
        }
        return connections;
    }

    /**
     *
     * Get connections by asset and port.
     *
     * @param assetType Asset type
     * @param assetId Asset id
     * @param assetPort Asset port
     * @param selected Is asset selected
     * @return JSONObject connection data
     */
    public JSONObject getConnections(final String assetType, final String assetId,
            final String assetPort, final boolean selected) {
        final JSONObject result = new JSONObject();
        String connectedAssetType = assetType;
        String connectedAssetId = assetId;
        String connectedAssetPort = assetPort;
        result.put(Constants.TOWARD_CLIENT_CONNECTIONS,
            getTowardClientConnections(assetType, assetId, assetPort));
        result.put(Constants.TOWARD_SERVER_CONNECTIONS,
            getTowardServerConnections(assetType, assetId, assetPort));

        if (Constants.FP_TYPE.equals(assetType)) {
            connectedAssetType = Constants.JK_TYPE;
            connectedAssetId = assetPort;
            connectedAssetPort = "";
        }
        // check is_multiplexing
        if (Constants.EQPORT_TYPE.equals(connectedAssetType)) {
            result.put(Constants.IS_MULTIPLEXING,
                TelecomHelper.isMultiplexingEquipment(connectedAssetId));
        }
        result.put(Constants.ASSET_TYPE, connectedAssetType);
        result.put(Constants.ASSET_ID, connectedAssetId);
        result.put(Constants.ASSET_PORT, connectedAssetPort);
        result.put(Constants.IS_SELECTED, selected);
        result.put(Constants.LOCALIZED_ASSET,
            EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
                getAssetType(connectedAssetType, true), this.getClass().getName()));
        result.put(Constants.ASSET_STD, TelecomHelper.getAssetStandard(connectedAssetType,
            connectedAssetId, connectedAssetPort));
        return result;
    }

    /**
     *
     * Get toward the client connections in reverse order.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPort asset port
     * @return JSONArray of connections
     */
    public JSONArray getTowardClientConnections(final String assetType, final String assetId,
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
                            multiplexingAsset, multiplexingPort, false);
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
        final JSONArray reverseOrderConnections = new JSONArray();
        for (int i = towardClientConnections.length() - 1; i >= 0; i--) {
            reverseOrderConnections.put(towardClientConnections.get(i));
        }
        return reverseOrderConnections;
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
                            connectedToAssetId, multiplexingPort, false);
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
     * Create connection JSONObject based on connected data.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPort asset port
     * @return JSONObject data {assetType: assetType, title:localizedAssetTypeTitle, assetId:
     *         assetId, assetPort:assetPort,assetStd:assetStandard}
     */
    private JSONObject createConnectionResult(final String assetType, final String assetId,
            final String assetPort) {
        String connectedAssetType = assetType;
        String connectedAssetId = assetId;
        String connectedAssetPort = assetPort;
        if (Constants.FP_TYPE.equals(assetType)) {
            connectedAssetType = Constants.JK_TYPE;
            connectedAssetId = assetPort;
            connectedAssetPort = "";
        }

        final JSONObject connectionObject = new JSONObject();

        connectionObject.put(Constants.ASSET_TYPE, connectedAssetType);
        connectionObject.put(Constants.ASSET_ID, connectedAssetId);
        connectionObject.put(Constants.ASSET_PORT, connectedAssetPort);
        connectionObject.put(Constants.LOCALIZED_ASSET,
            EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
                getAssetType(connectedAssetType, true), this.getClass().getName()));
        connectionObject.put(Constants.ASSET_STD, TelecomHelper.getAssetStandard(connectedAssetType,
            connectedAssetId, connectedAssetPort));
        return connectionObject;
    }

    /**
     * Get asset type string or title.
     *
     * @param assetType asset type
     * @param returnTitle true to return title
     * @return element type string
     */
    private String getAssetType(final String assetType, final boolean returnTitle) {
        final Map<String, String> assets = new HashMap<String, String>();
        assets.put(Constants.EQ_TYPE, EQUIPMENT);
        assets.put(Constants.EQPORT_TYPE, EQUIPMENT_PORT);
        assets.put(Constants.JK_TYPE, JACK);
        assets.put(Constants.FP_TYPE, FACEPLATE);
        assets.put(Constants.PN_TYPE, returnTitle ? PATCH_PANEL_PORT : PANEL);
        assets.put(Constants.PNPORT_TYPE, returnTitle ? PATCH_PANEL_PORT : PANEL);
        return assets.get(assetType);
    }
}