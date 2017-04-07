package com.archibus.eventhandler.eam.telecom;

import java.util.List;

import org.json.JSONArray;

import com.archibus.datasource.data.DataRecord;

/**
 *
 * Version 22.1 Enterprise Asset Management - Telecom Service.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbAssetEAM-TelecomService'.
 * <p>
 * Provides methods for trace, highlight and create ports for selected asset type in Telecom Console
 * <p>
 * Invoked by web central.
 * <p>
 * assetType: eq, eqport, jk, fp, pn, pnport
 *
 * @author Radu Bunea
 * @since 22.1
 *
 */
public class TelecomService {
    /**
     *
     * Get a list of asset connections with specific data for each connection.
     * <p>
     * The list contains toward the client connections and toward the server connections.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPorts list of asset ports
     * @return JSONArray of connections
     */
    public JSONArray listAssetConnections(final String assetType, final String assetId,
            final List<String> assetPorts) {
        return new TelecomListConnections().listAssetConnections(assetType, assetId, assetPorts);
    }

    /**
     *
     * Get a list of asset connections to trace connections.
     * <p>
     * The list contains toward the client connections and toward the server connections.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPorts list of asset ports
     * @return JSONArray of connections
     */
    public JSONArray traceAssetConnections(final String assetType, final String assetId,
            final List<String> assetPorts) {
        return new TelecomTraceConnections().traceConnections(assetType, assetId, assetPorts);
    }

    /**
     *
     * Get a list of asset connections to highlight connected rooms.
     * <p>
     * The list contains toward the client connections and toward the server connections.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPorts list of asset ports
     * @return JSONArray of connections
     */
    public JSONArray highlightConnectedRooms(final String assetType, final String assetId,
            final List<String> assetPorts) {
        return new TelecomHighlightRooms().highlightConnectedRooms(assetType, assetId, assetPorts);
    }

    /**
     *
     * Highlight spaces with open jacks.
     *
     * @param buildingId building id
     * @param floorId floor id
     * @param telecomService from tc_service field. Values are V or D to indicate voice or data jack
     *
     * @return return list of room ids where we have open jacks.
     */
    public List<String> highlightRoomsWithOpenJacks(final String buildingId, final String floorId,
            final String telecomService) {
        return new TelecomHighlightRooms().highlightRoomsWithOpenJacks(buildingId, floorId,
            telecomService);
    }

    /**
     *
     * Create jacks for faceplates.
     *
     * @return JSONArray with count of jacks created
     */
    public JSONArray createJacksForFaceplates() {
        return new TelecomCreatePorts().createJacksForFaceplates();
    }

    /**
     *
     * Create ports for panels.
     *
     * @return JSONArray with count of ports created
     */
    public JSONArray createPortsForPanels() {
        return new TelecomCreatePorts().createPortsForPanels();
    }

    /**
     *
     * Create ports for equipment.
     *
     * @return JSONArray with count of ports created
     */
    public JSONArray createPortsForEquipment() {
        return new TelecomCreatePorts().createPortsForEquipment();
    }

    /**
     *
     * Get toward the client connection; used in connection form.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPort asset port
     * @return DataRecord connection
     */
    public DataRecord getTowardTheClientConnection(final String assetType, final String assetId,
            final String assetPort) {
        return TelecomHelper.getTowardClientConnectionRecord(assetType, assetId, assetPort);
    }
}