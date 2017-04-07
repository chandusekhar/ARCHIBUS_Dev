package com.archibus.eventhandler.eam.telecom;

import java.util.List;

import org.json.JSONArray;

/**
 *
 * Version 22.1 Enterprise Asset Management - Telecom Service Trace Connections.
 * <p>
 * Methods used to trace connection.
 *
 * @author Radu Bunea
 * @since 22.1
 * 
 */
public class TelecomTraceConnections {
    /**
     *
     * Get a list of asset connections data to trace connections.
     * <p>
     * The list contains toward the client connections and toward the server connections.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPorts list of asset ports
     * @return JSONArray of connections
     */
    public JSONArray traceConnections(final String assetType, final String assetId,
            final List<String> assetPorts) {
        return new TelecomConnections().getAssetConnections(assetType, assetId, assetPorts);
    }
}
