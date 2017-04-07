package com.archibus.app.common.extensionsarcgis;

import org.json.JSONObject;

import com.archibus.app.common.connectors.dao.IConnectorDao;
import com.archibus.app.common.connectors.dao.datasource.ConnectorDataSource;
import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.service.ConnectorJob;

/**
 *
 * Provides public methods to run the Json Connectors associated with the Extensions for Esri
 * (ArcGIS).
 *
 * @author knight
 *
 */
public final class ArcgisConnectorManager {
    
    /**
     * Constructor not called.
     */
    private ArcgisConnectorManager() {
        
    }

    /**
     * Runs the Json Import Connector which imports data output from an ArcGIS feature layer to the
     * corresponding ARCHIBUS asset table.
     *
     * @param connectorId The Id of the import connector to run.
     * @param importFilename The import file name containing the json data.
     */
    
    public static void runJsonImportConnector(final String connectorId, final String importFilename) {
        
        /*
         * Get connector definition from database
         */
        
        final IConnectorDao connectorDao = new ConnectorDataSource();
        final ConnectorConfig connector = connectorDao.get(connectorId);
        
        /*
         * Set the connector filename and whereClause properties
         */
        connector.setConnStringDb(importFilename);
        
        /*
         * Set the connector parameters.
         */
        final JSONObject connParams = new JSONObject();
        connParams.put("useConfigInPreProcess", true);
        connector.setConnParams(connParams);

        /*
         * Run connector.
         */
        final ConnectorJob connectorJob = new ConnectorJob(connector, connectorDao);
        connectorJob.run();
    }
    
    /**
     * Runs the Json Export Connector which exports data from an ARCHIBUS asset table then calls a
     * post process to post the data to the corresponding ArcGIS feature layer.
     *
     * @param connectorId the Id of the export connector to run.
     * @param exportFilename the export file name for the json data.
     * @param whereClause the where clause to pass to the connector.
     */
    public static void runJsonExportConnector(final String connectorId,
            final String exportFilename, final String whereClause) {
        
        /*
         * Get connector definition from database
         */
        final IConnectorDao connectorDao = new ConnectorDataSource();
        final ConnectorConfig connector = connectorDao.get(connectorId);
        
        /*
         * Set the connector export filename and where clause properties
         */
        connector.setConnStringDb(exportFilename);
        connector.setClause(whereClause);

        /*
         * Set the connector parameters.
         */
        final JSONObject connParams = new JSONObject();
        connParams.put("useConfigInPostProcess", true);
        connector.setConnParams(connParams);
        
        /*
         * Run connector.
         */
        final ConnectorJob connectorJob = new ConnectorJob(connector, connectorDao);
        connectorJob.run();
        
    }
    
}