package com.archibus.app.solution.recurring;

import java.util.*;

import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.report.xls.GridBuilder;
import com.archibus.utility.StringUtil;

/**
 * Grid XLS builder for grids that display recurring pattern.
 * 
 * @author Ioan Draghici
 * @since 21.2
 */
public class GridXLSBuilder extends GridBuilder {
    /**
     * Constant.
     */
    public static final String CONTROLTYPEPROPERTY = "controlType";
    
    /**
     * Constant.
     */
    public static final String RECURRING = "recurring";
    
    @Override
    public int buildRecord(final List<Map<String, Object>> visibleFields, final int rIndex,
            final DataRecord dataRecord, final List<String> skippedFieldNames) {
        final RecurringScheduleService recurringScheduleService = new RecurringScheduleService();
        // localize recurring pattern field
        for (final Map<String, Object> field : visibleFields) {
            final String fieldName = getStringValue(IDPROPERTY, field, dataRecord);
            final String controlType = getStringValue(CONTROLTYPEPROPERTY, field, dataRecord);
            if (RECURRING.equals(controlType)) {
                final String xmlPattern = dataRecord.getString(fieldName);
                final String localizedValue =
                        (StringUtil.notNullOrEmpty(xmlPattern)) ? recurringScheduleService
                            .getRecurringPatternDescription(xmlPattern) : "";
                dataRecord.setValue(fieldName, localizedValue);
            }
        }
        return super.buildRecord(visibleFields, rIndex, dataRecord, skippedFieldNames, 0);
    }
    
}
