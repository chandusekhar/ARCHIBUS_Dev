package com.archibus.app.common.extensionsarcgis;

/**
 *
 * Represents an ArcGIS feature layer.
 *
 * @author knight
 *
 */
public class ArcgisFeatureLayer {
    
    /**
     * The feature layer URL.
     */
    private String url;
    
    /**
     * The ArcGIS asset type field name.
     */
    private String assetTypeField;

    /**
     * The ARCHIBUS ID (key) field name for the asset associated with the feature layer.
     */
    private String idField;
    
    /**
     * The ArcGIS OBJECTID (key) field name.
     */
    private String objectIdField;
    
    /**
     * The ArcGIS field names to update in the feature layer.
     */
    private String updateFieldNames;
    
    /**
     * The import connector id associated with the feature layer.
     */
    private String importConnectorId;
    
    /**
     * The export connector id associated with the feature layer.
     */
    private String exportConnectorId;
    
    /**
     * The update connector id associated with the feature layer.
     */
    private String updateConnectorId;
    
    /**
     * The geometry type of the features.
     */
    private String geometryType;
    
    /**
     * The where clause for the import, export, update operation.
     */
    private String whereClause;
    
    /**
     * The ARCHIBUS asset key fields.
     */
    private String[] assetKeyFields;

    /**
     *
     * Get the URL for the feature layer.
     *
     * @return the feature layer URL.
     */
    public String getUrl() {
        return this.url;
    }
    
    /**
     *
     * Set the URL for the feature layer.
     *
     * @param url the feature layer URL.
     */
    public void setUrl(final String url) {
        this.url = url;
    }
    
    /**
     *
     * Get the ARCHIBUS ID field name for the asset associated with the feature layer.
     *
     * @return the ARCHIBUS ID field.
     */
    public String getIdField() {
        return this.idField;
    }
    
    /**
     *
     * Set the ARCHIBUS ID field name for the asset associated with the feature layer.
     *
     * @param idField the ARCHIBUS ID field name.
     */
    public void setIdField(final String idField) {
        this.idField = idField;
    }
    
    /**
     *
     * Get the ArcGIS OBJECTID field name for the feature layer.
     *
     * @return the ArcGIS OBJECTID field name.
     */
    public String getObjectIdField() {
        return this.objectIdField;
    }
    
    /**
     *
     * Set the ArcGIS OBJECTID field name for the feature layer.
     *
     * @param objectIdField the ArcGIS OBJECTID field name.
     */
    public void setObjectIdField(final String objectIdField) {
        this.objectIdField = objectIdField;
    }
    
    /**
     *
     * Get the ArcGIS field names to update in the feature layer.
     *
     * @return the ArcGIS field names to update.
     */
    public String getUpdateFieldNames() {
        return this.updateFieldNames;
    }
    
    /**
     *
     * Set the ArcGIS field names to update in the feature layer.
     *
     * @param updateFieldNames the ArcGIS field names to update.
     */
    public void setUpdateFieldNames(final String updateFieldNames) {
        this.updateFieldNames = updateFieldNames;
    }
    
    /**
     *
     * Get the import connector id for the feature layer.
     *
     * @return the import connector id.
     */
    public String getImportConnectorId() {
        return this.importConnectorId;
    }
    
    /**
     *
     * Set the import connector id for the feature layer.
     *
     * @param importConnectorId the import connector id.
     */
    public void setImportConnectorId(final String importConnectorId) {
        this.importConnectorId = importConnectorId;
    }
    
    /**
     *
     * Get the export connector id for the feature layer.
     *
     * @return the export connector id.
     */
    public String getExportConnectorId() {
        return this.exportConnectorId;
    }
    
    /**
     *
     * Set the export connector id for the feature layer.
     *
     * @param exportConnectorId the export connector id.
     */
    public void setExportConnectorId(final String exportConnectorId) {
        this.exportConnectorId = exportConnectorId;
    }
    
    /**
     *
     * Get the update connector id for the feature layer.
     *
     * @return the update connector id.
     */
    public String getUpdateConnectorId() {
        return this.updateConnectorId;
    }
    
    /**
     *
     * Set the update connector id for the feature layer.
     *
     * @param updateConnectorId the update connector id.
     */
    public void setUpdateConnectorId(final String updateConnectorId) {
        this.updateConnectorId = updateConnectorId;
    }
    
    /**
     *
     * Get the where clause for the feature layer.
     *
     * @return the where clause.
     */
    public String getWhereClause() {
        return this.whereClause;
    }
    
    /**
     *
     * Set the where clause for the feature layer.
     *
     * @param whereClause the where clause.
     */
    public void setWhereClause(final String whereClause) {
        this.whereClause = whereClause;
    }

    /**
     *
     * Get the geometry type for the feature layer.
     *
     * @return The geometry type.
     */
    public String getGeometryType() {
        return this.geometryType;
    }

    /**
     *
     * Set the geometry type for the feature layer.
     *
     * @param geometryType The geometry type.
     */
    public void setGeometryType(final String geometryType) {
        this.geometryType = geometryType;
    }
    
    /**
     *
     * Get the ARCHIBUS key fields for the feature layer.
     *
     * @return The ARCHIBUS key fields.
     */
    public String[] getAssetKeyFields() {
        return this.assetKeyFields.clone();
    }
    
    /**
     *
     * Set the ARCHIBUS key fields for the feature layer .
     *
     * @param assetKeyFields The ARCHIBUS key fields.
     */
    public void setAssetKeyFields(final String[] assetKeyFields) {
        this.assetKeyFields = assetKeyFields.clone();
    }
    
    /**
     * Getter for the assetTypeField property.
     *
     * @see assetTypeField
     * @return the assetTypeField property.
     */
    public String getAssetTypeField() {
        return this.assetTypeField;
    }
    
    /**
     * Setter for the assetTypeField property.
     *
     * @see assetTypeField
     * @param assetTypeField the assetTypeField to set
     */
    
    public void setAssetTypeField(final String assetTypeField) {
        this.assetTypeField = assetTypeField;
    }
}
