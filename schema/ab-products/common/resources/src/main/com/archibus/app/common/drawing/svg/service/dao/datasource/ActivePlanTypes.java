package com.archibus.app.common.drawing.svg.service.dao.datasource;

import com.archibus.app.common.drawing.svg.service.domain.HighlightParameters;
import com.archibus.utility.StringUtil;

/**
 *
 * Provides helper class to retreat records from active_plantypes table in database.
 * <p>
 *
 * Used by HighlightParametersDataSource.java
 *
 * @author Yong Shao
 * @since 22.1
 *
 */
public class ActivePlanTypes extends HighlightParameters {
    
    /**
     * the name of axvw view for secondary asset highlight.
     */
    private String secondaryViewName;
    
    /**
     * the id of secondary asset highlight DataSource.
     */
    private String secondaryHighlightDatasourceId;
    
    /**
     * the type of the secondary highlight asset.
     */
    private String secondaryAssetType;
    
    /**
     * Hide assets without being highlighted for secondary highlighting.
     */
    private boolean secondaryHideNotHighlightedAssets;
    
    /**
     * the name of secondary asset-highlight label DataSource.
     */
    private String secondaryLabelDataSourceId;

    /**
     * secondary asset-highlight label height.
     */
    private double secondaryLabelHeight;

    /**
     * secondary asset-highlight label color name.
     */
    private String secondaryLabelColorName;

    /**
     * Getter for the secondaryLabelDataSourceId property.
     *
     * @see secondaryLabelDataSourceId
     * @return the secondaryLabelDataSourceId property.
     */
    public String getSecondaryLabelDataSourceId() {
        return this.secondaryLabelDataSourceId;
    }
    
    /**
     * Setter for the secondaryLabelDataSourceId property.
     *
     * @see secondaryLabelDataSourceId
     * @param secondaryLabelDataSourceId the secondaryLabelDataSourceId to set
     */
    
    public void setSecondaryLabelDataSourceId(final String secondaryLabelDataSourceId) {
        this.secondaryLabelDataSourceId = secondaryLabelDataSourceId;
    }
    
    /**
     * Getter for the secondaryLabelHeight property.
     *
     * @see secondaryLabelHeight
     * @return the secondaryLabelHeight property.
     */
    public double getSecondaryLabelHeight() {
        return this.secondaryLabelHeight;
    }
    
    /**
     * Setter for the secondaryLabelHeight property.
     *
     * @see secondaryLabelHeight
     * @param secondaryLabelHeight the secondaryLabelHeight to set
     */
    
    public void setSecondaryLabelHeight(final double secondaryLabelHeight) {
        this.secondaryLabelHeight = secondaryLabelHeight;
    }
    
    /**
     * Getter for the secondaryLabelColorName property.
     *
     * @see secondaryLabelColorName
     * @return the secondaryLabelColorName property.
     */
    public String getSecondaryLabelColorName() {
        return this.secondaryLabelColorName;
    }
    
    /**
     * Setter for the secondaryLabelColorName property.
     *
     * @see secondaryLabelColorName
     * @param secondaryLabelColorName the secondaryLabelColorName to set
     */
    
    public void setSecondaryLabelColorName(final String secondaryLabelColorName) {
        this.secondaryLabelColorName = secondaryLabelColorName;
    }
    
    /**
     *
     * Sets Secondary View Name.
     *
     * @param secondaryViewName string.
     */
    public void setSecondaryViewName(final String secondaryViewName) {
        this.secondaryViewName = secondaryViewName;
    }
    
    /**
     *
     * Gets SecondaryViewName.
     * 
     * @return SecondaryViewName.
     */
    public String getSecondaryViewName() {
        return this.secondaryViewName;
    }

    /**
     * Getter for the secondaryHighlightDatasourceId property.
     *
     * @see secondaryHighlightDatasourceId
     * @return the secondaryHighlightDatasourceId property.
     */
    public String getSecondaryHighlightDatasourceId() {
        return this.secondaryHighlightDatasourceId;
    }

    /**
     * Setter for the secondaryHighlightDatasourceId property.
     *
     * @see secondaryHighlightDatasourceId
     * @param secondaryHighlightDatasourceId the secondaryHighlightDatasourceId to set
     */

    public void setSecondaryHighlightDatasourceId(final String secondaryHighlightDatasourceId) {
        this.secondaryHighlightDatasourceId = secondaryHighlightDatasourceId;
    }

    /**
     * Getter for the secondaryAssetType property.
     *
     * @see secondaryAssetType
     * @return the secondaryAssetType property.
     */
    public String getSecondaryAssetType() {
        return this.secondaryAssetType;
    }

    /**
     * Setter for the secondaryAssetType property.
     *
     * @see secondaryAssetType
     * @param secondaryAssetType the secondaryAssetType to set
     */

    public void setSecondaryAssetType(final String secondaryAssetType) {
        this.secondaryAssetType = secondaryAssetType;
    }

    /**
     *
     * Checks if there is secondary asset highlight.
     *
     * @return boolean
     */
    public boolean hasSecondaryAssetHighlight() {
        return StringUtil.notNullOrEmpty(this.secondaryViewName)
                && StringUtil.notNullOrEmpty(this.secondaryHighlightDatasourceId);
    }
    
    /**
     * Getter for the secondaryHideNotHighlightedAssets property.
     *
     * @see secondaryHideNotHighlightedAssets
     * @return the secondaryHideNotHighlightedAssets property.
     */
    public boolean isSecondaryHideNotHighlightedAssets() {
        return this.secondaryHideNotHighlightedAssets;
    }

    /**
     * Setter for the secondaryHideNotHighlightedAssets property.
     *
     * @see secondaryHideNotHighlightedAssets
     * @param secondaryHideNotHighlightedAssets the secondaryHideNotHighlightedAssets to set
     */

    public void setSecondaryHideNotHighlightedAssets(final boolean secondaryHideNotHighlightedAssets) {
        this.secondaryHideNotHighlightedAssets = secondaryHideNotHighlightedAssets;
    }

}
