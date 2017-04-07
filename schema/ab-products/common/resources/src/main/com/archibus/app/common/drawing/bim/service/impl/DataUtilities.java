package com.archibus.app.common.drawing.bim.service.impl;

import java.math.BigInteger;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.drawing.highlight.HighlightImageService;
import com.archibus.ext.report.ReportUtility;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;
import com.archibus.service.common.svg.ReportUtilities;
import com.archibus.utility.*;

/**
 *
 * Utilities for class DrawingBimService.
 * <p>
 * Provides methods for data.
 *
 * @author Yong Shao
 * @since 21.4
 *
 */
public final class DataUtilities {

    /**
     * Constant: RVITGUIDDIGITS_16.
     */
    private static final int RVITGUIDDIGITS_16 = 16;

    /**
     * Constant: RVITGUIDDIGITS_28.
     */
    private static final int RVITGUIDDIGITS_28 = 28;

    /**
     * Constant: RVITGUIDDIGITS_36.
     */
    private static final int RVITGUIDDIGITS_36 = 36;

    /**
     * Constant: RVITGUIDDIGITS_37.
     */
    private static final int RVITGUIDDIGITS_37 = 37;

    /**
     * Constant: RVITGUIDLENGTH_45.
     */
    private static final int RVITGUIDLENGTH_45 = 45;

    /**
     * Constant: RVITGUID_EHANDLE.
     */
    private static final String RVITGUID_EHANDLE = "ehandle";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DataUtilities() {
    }

    /**
     *
     * Converts revit guid to model valid guid.
     *
     * @param revitGuid revit guid.
     * @return model valid guid.
     */
    public static String convertRvitGuid2ModelGuid(final String revitGuid) {
        BigInteger bigInteger =
                new BigInteger(revitGuid.substring(RVITGUIDDIGITS_37), RVITGUIDDIGITS_16);
        final int elementId = bigInteger.intValue();
        bigInteger = new BigInteger(revitGuid.substring(RVITGUIDDIGITS_28, RVITGUIDDIGITS_36),
            RVITGUIDDIGITS_16);
        final int last32Bits = bigInteger.intValue();
        final int newGuid = last32Bits ^ elementId;
        final String result =
                revitGuid.substring(0, RVITGUIDDIGITS_28) + Integer.toHexString(newGuid);
        return result.toUpperCase();
    }

    /**
     *
     * Gets guid and primary keys mapping.
     *
     * @param tableName String.
     * @param restirction String.
     * @param isRevit boolean.
     * @return List<Map<String, String>>.
     */
    public static Map<String, String> getGuidPKValueMap(final String tableName,
            final String restirction, final boolean isRevit) {
        final DataSource dataSource = DataSourceFactory.createDataSource().addTable(tableName);
        dataSource.addField(RVITGUID_EHANDLE);
        final List<String> pkFields = new ArrayList<String>();
        final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> primaryKeyFields =
                ContextStore.get().getProject().loadTableDef(tableName).getPrimaryKey().getFields();
        for (final Immutable primaryKeyField : primaryKeyFields) {
            pkFields.add(primaryKeyField.getName());
            dataSource.addField(primaryKeyField.getName());
        }
        final List<DataRecord> records = dataSource.getRecords(restirction);
        final Map<String, String> result = new HashMap<String, String>();
        for (final DataRecord record : records) {
            final String ehandle = record.getNeutralValue(tableName + '.' + RVITGUID_EHANDLE);
            if (StringUtil.notNullOrEmpty(ehandle) && ehandle.length() == RVITGUIDLENGTH_45) {
                String guid = ehandle;
                if (!isRevit) {
                    guid = convertRvitGuid2ModelGuid(ehandle);
                }

                String pkValue = null;
                for (final String pkField : pkFields) {
                    if (pkValue == null) {
                        pkValue = record.getNeutralValue(tableName + '.' + pkField);
                    } else {
                        pkValue = pkValue + ';' + record.getNeutralValue(tableName + '.' + pkField);
                    }
                }

                result.put(guid, pkValue);
            }
        }
        return result;
    }

    // CHECKSTYLE:OFF Justification: Suppress "Strict duplicate code"
    /**
     *
     * Gets paired guid and database defined color map .
     *
     * @param asset String.
     * @param viewName String.
     * @param dataSourceId String.
     * @param restriction String.
     * @param isRevit boolean.
     * @return Map<String, String>.
     */
    public static Map<String, String> getGuidRGBColorMap(final String asset, final String viewName,
            final String dataSourceId, final String restriction, final boolean isRevit) {
        final Map<String, String> result = new HashMap<String, String>();
        final Map<String, String> colors =
                getRGBColors(asset, viewName, dataSourceId, restriction, null);
        final Map<String, String> guidMap = getGuidPKValueMap(asset, restriction, isRevit);
        for (final Map.Entry<String, String> entry : colors.entrySet()) {
            final String key = entry.getKey();
            final String color = entry.getValue();
            final String guid = getGuid(key, guidMap);
            if (guid != null) {
                result.put(guid, color);
            }

        }
        return result;
    }

    /**
     *
     * Gets highlight RGB Colors.
     *
     * @param asset table.
     * @param viewName view name.
     * @param dataSourceId datasource id.
     * @param restriction client restriction.
     * @param parameters Map<String, String> .
     * @return color Map.
     */
    public static Map<String, String> getRGBColors(final String asset, final String viewName,
            final String dataSourceId, final String restriction,
            final Map<String, String> parameters) {
        final DataSource highlightDataSource =
                DataSourceFactory.loadDataSourceFromFile(viewName, dataSourceId);
        highlightDataSource.setContext();

        if (parameters != null && !parameters.isEmpty()) {
            ReportUtility.applyParameters(highlightDataSource, parameters);
        }

        final ReportPropertiesDef reportPropertiesDef = ReportUtilities.getReportPropertiesDef();
        reportPropertiesDef.setAssetTables(asset);

        final HighlightImageService highlightImageService =
                new HighlightImageService(reportPropertiesDef);
        return highlightImageService.retrieveHighlightedColors(highlightDataSource,
            highlightDataSource.parseClientRestrictions(restriction), true);
    }

    /**
     *
     * Gets guid.
     *
     * @param pkValue String.
     * @param guidMap Map<String, String>.
     * @return String.
     */
    static String getGuid(final String pkValue, final Map<String, String> guidMap) {
        String result = null;
        for (final Map.Entry<String, String> entry : guidMap.entrySet()) {
            if (pkValue.equals(entry.getValue())) {
                result = entry.getKey();
                break;
            }
        }
        return result;
    }

}
