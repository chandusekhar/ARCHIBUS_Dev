package com.archibus.app.common.drawing.svg.service.dao.datasource;

import java.util.*;

import com.archibus.app.common.drawing.svg.service.dao.IHighlightParametersDao;
import com.archibus.app.common.drawing.svg.service.domain.HighlightParameters;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.utility.*;

/**
 * DataSource for ActivePlanTypes.
 * <p>
 * A bean named as "svgHighlightParametersDataSource".
 * <p>
 * configured in /schema/ab-products/common/resources/appContext-services.xml
 * <p>
 * Designed to have prototype scope.
 *
 * @author Shao
 * @since 21.1
 */
public class HighlightParametersDataSource extends ObjectDataSourceImpl<ActivePlanTypes> implements
IHighlightParametersDao {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { Constants.VIEW_FILE_NAME, "viewName" },
            { Constants.HIGHLIGHT_DATASOURCE, "highlightDatasourceId" },
            { Constants.LABEL_DATASOURCE, "labelDataSourceId" },
            { Constants.LABEL_HEIGHT, "labelHeight" },
            { Constants.LABEL_COLOR, "labelColorName" },
            { Constants.VIEW_FILE_NAME + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX,
                    "secondaryViewName" },
            {
                    Constants.HIGHLIGHT_DATASOURCE
                            + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX,
                    "secondaryHighlightDatasourceId" },
        { Constants.LABEL_DATASOURCE + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX,
                    "secondaryLabelDataSourceId" },
        { Constants.LABEL_HEIGHT + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX,
                    "secondaryLabelHeight" },
        { Constants.LABEL_COLOR + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX,
                    "secondaryLabelColorName" }
    
    };
    
    /**
     * Constructs HighlightParametersDataSource, mapped to <code>active_plantypes</code> table,
     * using <code>svgHighlightParameters</code> bean.
     */
    public HighlightParametersDataSource() {
        super("svgHighlightParameters", Constants.ACTIVE_PLAN_TYPES);
        
        final com.archibus.context.Context context = ContextStore.get();
        if (context != null && context.getProject() != null) {
            addNewFields(context.getProject().loadTableDef(Constants.ACTIVE_PLAN_TYPES)
                .getFieldNames());
        }
    }
    
    /**
     *
     * Adds newly defined fields in new database schema.
     *
     * @param schemeFieldNames field names defined in database schema.
     */
    private void addNewFields(final ListWrapper.Immutable<String> schemeFieldNames) {
        for (final String fieldName : schemeFieldNames) {
            boolean notAdded = true;
            for (final String[] fieldToProperty : FIELDS_TO_PROPERTIES) {
                if (fieldName.equals(fieldToProperty[0])) {
                    notAdded = false;
                    break;
                }
            }
            
            if (notAdded) {
                addField(fieldName);
            }
        }
    }
    
    /**
     *
     * Gets HighlightParameters by a plan type.
     *
     * @param planType plan type value.
     * @return HighlightParameters.
     *
     * @throws ExceptionBase if DataSource throws an exception.
     */
    @Override
    public List<HighlightParameters> getByPlanType(final String planType) throws ExceptionBase {
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(Constants.ACTIVE_PLAN_TYPES + '.' + Constants.PLAN_TYPE);
            pkField.setValue(planType);
            
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        
        final List<HighlightParameters> result = new ArrayList<HighlightParameters>();
        final ActivePlanTypes activePlanTypes = this.get(primaryKeysValues);
        HighlightParameters highlightParameters = new HighlightParameters();
        highlightParameters.setViewName(activePlanTypes.getViewName());
        highlightParameters.setAssetType(activePlanTypes.getAssetType());
        highlightParameters.setHighlightDatasourceId(activePlanTypes.getHighlightDatasourceId());
        highlightParameters.setLabelDataSourceId(activePlanTypes.getLabelDataSourceId());
        highlightParameters.setLabelHeight(activePlanTypes.getLabelHeight());
        highlightParameters.setLabelColorName(activePlanTypes.getLabelColorName());
        highlightParameters.setHideNotHighlightedAssets(activePlanTypes
            .isHideNotHighlightedAssets());
        
        result.add(highlightParameters);
        if (activePlanTypes.hasSecondaryAssetHighlight()) {
            highlightParameters = new HighlightParameters();
            highlightParameters.setViewName(activePlanTypes.getSecondaryViewName());
            highlightParameters.setAssetType(activePlanTypes.getSecondaryAssetType());
            highlightParameters.setHighlightDatasourceId(activePlanTypes
                .getSecondaryHighlightDatasourceId());
            highlightParameters.setLabelDataSourceId(activePlanTypes
                .getSecondaryLabelDataSourceId());
            highlightParameters.setLabelHeight(activePlanTypes.getSecondaryLabelHeight());
            highlightParameters.setLabelColorName(activePlanTypes.getSecondaryLabelColorName());
            highlightParameters.setHideNotHighlightedAssets(activePlanTypes
                .isSecondaryHideNotHighlightedAssets());
            result.add(highlightParameters);
        }
        return result;
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
    
    @Override
    public ActivePlanTypes convertRecordToObject(final DataRecord record) {
        final ActivePlanTypes activePlanTypes = super.convertRecordToObject(record);
        
        if (record.valueExists(Constants.ACTIVE_PLAN_TYPES + '.' + Constants.HIGHLIGHT_HIDE)) {
            activePlanTypes.setHideNotHighlightedAssets(StringUtil.toBoolean(record
                .getInt(Constants.ACTIVE_PLAN_TYPES + '.' + Constants.HIGHLIGHT_HIDE)));
        }
        
        if (record.valueExists(Constants.ACTIVE_PLAN_TYPES + '.' + Constants.HIGHLIGHT_HIDE
                + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX)) {
            activePlanTypes.setSecondaryHideNotHighlightedAssets(StringUtil.toBoolean(record
                .getInt(Constants.ACTIVE_PLAN_TYPES + '.' + Constants.HIGHLIGHT_HIDE
                        + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX)));
        }
        
        return activePlanTypes;
    }
}
