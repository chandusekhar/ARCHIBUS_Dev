package com.archibus.app.common.drawing.svg.service.domain;

import java.util.Map;

/**
 * Domain class for highlight parameters.
 * <p>
 * Mapped to active_plantypes table.
 *
 * <p>
 * Designed to have prototype scope.
 *
 * @author shao
 * @since 21.1
 *
 */
public class HighlightParameters extends LabelParameters {
    /**
     * the name of the axvw view.
     * <p>
     * In view, highlight and label dataSources are defined.
     */
    private String viewName;

    /**
     * the id of highlight DataSource.
     */
    private String highlightDatasourceId;

    /**
     * the type of the highlight asset.
     */
    private String assetType;

    /**
     * Hide assets without being highlighted.
     */
    private boolean hideNotHighlightedAssets;
    
    /**
     * query restriction.
     */
    private String restriction;
    
    /**
     * dataSource parameters.
     */
    private Map<String, Object> dataSourceParameters;

    /**
     * Getter for the highlightDatasourceId property.
     *
     * @see highlightDatasourceId
     * @return the highlightDatasourceId property.
     */
    public String getHighlightDatasourceId() {
        return this.highlightDatasourceId;
    }
    
    /**
     * Setter for the highlightDatasourceId property.
     *
     * @see datasourceId
     * @param datasourceId the highlightDatasourceId to set
     */
    
    public void setHighlightDatasourceId(final String datasourceId) {
        this.highlightDatasourceId = datasourceId;
    }
    
    /**
     * Getter for the assetType property.
     *
     * @see assetType.
     * @return the assetType property.
     */
    public String getAssetType() {
        return this.assetType;
    }
    
    /**
     * Setter for the assetType property.
     *
     * @see assetType.
     * @param assetType the assetType to set.
     */
    public void setAssetType(final String assetType) {
        this.assetType = assetType;
    }
    
    /**
     * Getter for the viewName property.
     *
     * @see viewName
     * @return the viewName property.
     */
    public String getViewName() {
        return this.viewName;
    }
    
    /**
     * Setter for the viewName property.
     *
     * @see viewName
     * @param viewName the viewName to set
     */
    public void setViewName(final String viewName) {
        this.viewName = viewName;
    }

    /**
     * Getter for the hideNotHighlightedAssets property.
     *
     * @see hideNotHighlightedAssets
     * @return the hideNotHighlightedAssets property.
     */
    public boolean isHideNotHighlightedAssets() {
        return this.hideNotHighlightedAssets;
    }
    
    /**
     * Setter for the hideNotHighlightedAssets property.
     *
     * @see hideNotHighlightedAssets
     * @param hideNotHighlightedAssets the hideNotHighlightedAssets to set
     */
    
    public void setHideNotHighlightedAssets(final boolean hideNotHighlightedAssets) {
        this.hideNotHighlightedAssets = hideNotHighlightedAssets;
    }
    
    /**
     *
     * Gets Restriction.
     * 
     * @return string.
     */
    public String getRestriction() {
        return this.restriction;
    }
    
    /**
     * 
     * Sets Restriction.
     * 
     * @param restriction string.
     */
    public void setRestriction(final String restriction) {
        this.restriction = restriction;
    }
    
    /**
     * 
     * Gets DataSourceParameters.
     * 
     * @return Map<String, Object> .
     */
    public Map<String, Object> getDataSourceParameters() {
        return this.dataSourceParameters;
    }
    
    /**
     * 
     * Sets DataSourceParameters.
     * 
     * @param dataSourceParameters Map<String, Object>.
     */
    public void setDataSourceParameters(final Map<String, Object> dataSourceParameters) {
        this.dataSourceParameters = dataSourceParameters;
    }
    
}
