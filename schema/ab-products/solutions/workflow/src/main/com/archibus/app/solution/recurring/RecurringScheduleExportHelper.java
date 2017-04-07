package com.archibus.app.solution.recurring;

import java.text.ParseException;
import java.util.*;

import org.json.JSONArray;

import com.archibus.config.RecordLimits;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.*;
import com.archibus.model.view.form.processor.AnalysisViewDefGenerator;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.utility.*;

/**
 * 
 * Provides helper methods for recurring schedule export.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public final class RecurringScheduleExportHelper {
    
    /**
     * Constant.
     */
    public static final String NULL = "null";
    
    /**
     * Constant.
     */
    public static final String PRINT_RESTRICTION = "printRestriction";
    
    /**
     * Constant.
     */
    public static final String PRINTABLE_RESTRICTION = "printableRestriction";
    
    /**
     * Constant.
     */
    public static final String PAGE_SIZE = "pageSize";
    
    /**
     * Constant.
     */
    public static final int ONE_HUNDRED = 100;
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private RecurringScheduleExportHelper() {
        
    }
    
    /**
     * Load data source object from file and set data source parameters.
     * 
     * @param viewName view name
     * @param dataSourceId data source control id
     * @param panelReportProperties panel report properties
     * @param parameters report parameters
     * @return data source object
     */
    public static DataSource loadDataSource(final String viewName, final String dataSourceId,
            final PanelReportProperties panelReportProperties, final Map<String, Object> parameters) {
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(viewName, dataSourceId);
        dataSource.setContext();
        // set records limit
        if (panelReportProperties.getRecordLimit() == null) {
            dataSource.setMaxRecords(RecordLimits.getRecordLimitForReporting());
        } else {
            dataSource.setMaxRecords(panelReportProperties.getRecordLimit().intValue());
        }
        // set data source parameters
        if (parameters != null) {
            ReportUtility.handleParameters(dataSource, parameters);
        }
        return dataSource;
    }
    
    /**
     * 
     * Load panel properties.
     * 
     * @param viewName view name
     * @param parameters parameters object
     * @return panel properties
     */
    public static PanelReportProperties loadPanelProperties(final String viewName,
            final Map<String, Object> parameters) {
        final PanelReportProperties panelReportProperties =
                new PanelReportProperties(viewName, parameters);
        return panelReportProperties;
    }
    
    /**
     * Get totals record.
     * 
     * @param viewName view name
     * @param dataSource data source object
     * @param panelReportProperties panel properties
     * @param parameters client parameters
     * @param restriction client restriction
     * @return data record object
     */
    public static DataRecord getTotalsRecord(final String viewName, final DataSource dataSource,
            final PanelReportProperties panelReportProperties,
            final Map<String, Object> parameters, final String restriction) {
        DataRecord record = null;
        if (parameters != null && panelReportProperties.isShowTotals()) {
            record =
                    AnalysisViewDefGenerator.generateTotalsDataSourceAndGetTotals(
                        viewName,
                        dataSource.getId(),
                        dataSource.formatSqlQuery(restriction,
                            panelReportProperties.getSortValues(),
                            panelReportProperties.getFilterValues(), false, false));
        }
        return record;
    }
    
    /**
     * Get totals datasource.
     * 
     * @param viewName view name
     * @param dataSource data source object
     * @param panelReportProperties panel properties
     * @param parameters client parameters
     * @param restriction client restriction
     * @return data source object
     */
    public static DataSource getTotalsDataSource(final String viewName,
            final DataSource dataSource, final PanelReportProperties panelReportProperties,
            final Map<String, Object> parameters, final String restriction) {
        DataSource totalsDataSource = null;
        if (parameters != null) {
            totalsDataSource =
                    ReportUtility.getTotalsDataSource(
                        viewName,
                        dataSource.getId(),
                        panelReportProperties,
                        dataSource.formatSqlQuery(restriction,
                            panelReportProperties.getSortValues(),
                            panelReportProperties.getFilterValues(), false, false));
        }
        return totalsDataSource;
    }
    
    /**
     * Get printable restriction handler.
     * 
     * @param dataSource data source object
     * @param visibleFields visible fields
     * @param parameters client parameters
     * @param restriction client restriction
     * @return PrintRestrictionHandler object
     * @throws ParseException parse exception
     */
    public static com.archibus.ext.report.xls.PrintRestrictionHandler getPrintRestrictionHandler(
            final DataSource dataSource, final List<Map<String, Object>> visibleFields,
            final Map<String, Object> parameters, final String restriction) throws ParseException {
        com.archibus.ext.report.xls.PrintRestrictionHandler printRestrictionHandler = null;
        if (parameters != null) {
            // print restriction
            if (parameters.containsKey(PRINT_RESTRICTION)
                    && StringUtil.notNullOrEmpty(parameters.get(PRINT_RESTRICTION))) {
                printRestrictionHandler = new com.archibus.ext.report.xls.PrintRestrictionHandler();
                printRestrictionHandler.setUserVirtualFieldDefs(PaginatedReportsBuilder
                    .convert2UserVirtualFields(visibleFields, dataSource.getAllFields()));
            }
            
            if (parameters.containsKey(PRINTABLE_RESTRICTION) && printRestrictionHandler != null) {
                final List<Map<String, Object>> printableRestriction =
                        EventHandlerBase.fromJSONArray(StringUtil.notNull(parameters
                            .get(PRINTABLE_RESTRICTION)));
                printRestrictionHandler.setPrintableRstrictions(printableRestriction);
                
            }
            if (restriction != null && printRestrictionHandler != null) {
                printRestrictionHandler.setParsedRestrictions(dataSource
                    .parseClientRestrictions(restriction));
            }
        }
        return printRestrictionHandler;
    }
    
    /**
     * Parse parameters to set up Report properties for printing out restriction.
     * 
     * @param report - com.archibus.ext.report.docx.Report object.
     * @param parameters - Map client-side passed parameters.
     * 
     *            throws ParseException if anything is wrong during
     *            EventHandlerBase.fromJSONArray().
     */
    public static void setPrintRestriction(final com.archibus.ext.report.docx.Report report,
            final Map<String, Object> parameters) {
        try {
            if (parameters.containsKey(PRINT_RESTRICTION)) {
                final boolean printRestriction =
                        StringUtil.toBoolean(StringUtil.notNull(parameters.get(PRINT_RESTRICTION)));
                report.setPrintRestriction(printRestriction);
            }
            
            if (parameters.containsKey(PRINTABLE_RESTRICTION)) {
                @SuppressWarnings("unchecked")
                final List<Map<String, Object>> printableRestriction =
                        EventHandlerBase.fromJSONArray(new JSONArray(StringUtil.notNull(parameters
                            .get(PRINTABLE_RESTRICTION))));
                report.setPrintableRestriction(printableRestriction);
                
            }
            if (parameters.containsKey(Constants.RESTRICTION)) {
                final String restriction =
                        StringUtil.notNull(parameters.get(Constants.RESTRICTION));
                final Map<String, Object> restrictions = new HashMap<String, Object>();
                restrictions.put("", restriction);
                report.setRestrictions(restrictions);
            }
        } catch (final ParseException e) {
            // @non-translatable
            throw new ExceptionBase("Cannot parse parameters", e);
        }
    }
    
    /**
     * Check if restriction is defined and add this to parameters object if was not added.
     * 
     * @param restriction restriction string
     * @param parameters parameters object
     * @return string
     */
    public static String handleRestriction(final String restriction,
            final Map<String, Object> parameters) {
        String result = null;
        if (StringUtil.notNullOrEmpty(restriction) && !NULL.equalsIgnoreCase(restriction)) {
            result = restriction;
        }
        if (parameters != null && !parameters.containsKey(Constants.RESTRICTION)) {
            parameters.put(Constants.RESTRICTION, result);
        }
        return result;
    }
    
    /**
     * Set report properties.
     * 
     * @param report report object
     * @param panelReportProperties panel report properties
     * @param reportPropertiesDef report properties definition
     * @param parameters parameters
     * @param restriction client restriction
     */
    public static void setReportProperties(final com.archibus.ext.report.docx.Report report,
            final PanelReportProperties panelReportProperties,
            final ReportPropertiesDef reportPropertiesDef, final Map<String, Object> parameters,
            final String restriction) {
        
        if (StringUtil.notNullOrEmpty(restriction) || !NULL.equalsIgnoreCase(restriction)) {
            final Map<String, Object> restrictions = new HashMap<String, Object>();
            restrictions.put("", restriction);
            report.setRestrictions(restrictions);
        }
        
        if (panelReportProperties.getRecordLimit() == null) {
            report.setRecordLimit(RecordLimits.getRecordLimitForReporting());
        } else {
            report.setRecordLimit(panelReportProperties.getRecordLimit().intValue());
        }
        
        if (panelReportProperties.getOrientation() != null) {
            report.setPageOrientation(panelReportProperties.getOrientation());
        }
        
        if (parameters != null) {
            report.setPatameters(parameters);
            
            if (parameters.containsKey(PAGE_SIZE)) {
                final String[] sizeArray = StringUtil.notNull(parameters.get(PAGE_SIZE)).split(";");
                reportPropertiesDef.setPageSize(new ReportPropertiesDef().new PageSize(Double
                    .parseDouble(sizeArray[0]), Double.parseDouble(sizeArray[1])));
            }
        }
        
        if (panelReportProperties.getOutputType() == null) {
            report.setOutputFileType(reportPropertiesDef.getOutputFileType());
        } else {
            report.setOutputFileType(panelReportProperties.getOutputType());
        }
    }
    
}
