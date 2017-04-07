package com.archibus.eventhandler.clean;

import java.util.*;

import org.json.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.ext.report.ReportUtility;
import com.archibus.ext.report.xls.*;
import com.archibus.ext.report.xls.XlsBuilder.Color;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.model.view.datasource.converter.SortFieldRuntimeConverter;
import com.archibus.model.view.datasource.field.SortFieldDef;

/**
 * Produce custom reports.
 * 
 * @author Yong Shao.
 * 
 */
public class ExportReport {
    /**
     * Based on client-side custom dataSet object to produce a custom 2d cross-tab XLS report. 1).
     * Reassemble java DataSet2D from client-side data; 2). Create CustomCrossTab2DBuilder to color
     * data. Called by WFR - AbRiskCleanBuilding-CleanBuildingService-exportXLS.
     * 
     * @param viewName - view name.
     * @param title - title.
     * @param dataSourceId - dataSourceId.
     * @param groupByFields - List<Map<String, String>>.
     * @param calculatedFields - List<Map<String, Object>>.
     * @param sortFields - List<Map<String, Object>>.
     * @param data - Map<String, Object> client-side dataSet JSON object.
     * @return JobResult.
     */
    public JobResult exportXLS(final String viewName, final String title,
            final String dataSourceId, final List<Map<String, String>> groupByFields,
            final List<Map<String, Object>> calculatedFields,
            final List<Map<String, Object>> sortFields, final Map<String, Object> data) {
        
        final JSONArray groupByFieldNames = ReportUtility.getGroupByFieldNames(groupByFields);
        
        final DataSource dataSource = DataSourceFactory.loadDataSourceFromFile(viewName,
            dataSourceId);
        
        final DataSet2D dataSet = getDataSet(ReportUtility.getSortFieldDefs(sortFields),
            groupByFieldNames);
        
        // assemble records
        dataSet.addRecords(getRecords(dataSource, data, "records"));
        // assemble totals
        dataSet.addTotals(getRecords(dataSource, data, "totals").get(0));
        // assemble rowSubtotals
        dataSet.addRowSubtotals(getRecords(dataSource, data, "rowSubtotals"));
        // assemble columnSubtotals
        dataSet.addColumnSubtotals(getRecords(dataSource, data, "columnSubtotals"));
        // assemble columnValues
        dataSet.clearColumnValues();
        dataSet.addColumnValues(getDataValues(dataSource, data, "columnValues",
            groupByFieldNames.getString(1)));
        // assemble rowValues
        dataSet.clearRowValues();
        dataSet.addRowValues(getDataValues(dataSource, data, "rowValues",
            groupByFieldNames.getString(0)));
        
        final CrossTab2DBuilder builder = new CustomCrossTab2DBuilder();
        builder.setFileName(builder.createFileName(viewName));
        // build XSL based on custom dataSet
        builder.build(dataSet, title, groupByFields, calculatedFields);
        
        final String fileName = builder.getFileName();
        final String url = builder.getURL();
        return new JobResult(title, fileName, url);
        
    }
    
    /**
     * Retreat List<DataRecord> from client-side dataSet.
     * 
     * @param dataSource - DataSource.
     * @param data - Map<String, Object> client-side dataSet.
     * @param key - String.
     * @return - List<DataRecord>.
     */
    private List<DataRecord> getRecords(final DataSource dataSource,
            final Map<String, Object> data, final String key) {
        final List<DataRecord> result = new ArrayList<DataRecord>();
        final JSONArray records = (JSONArray) data.get(key);
        if (records != null) {
            for (int i = 0; i < records.length(); i++) {
                final DataRecord record = dataSource.createRecord();
                record.fromJSON(records.getJSONObject(i));
                result.add(record);
            }
        }
        return result;
    }
    
    /**
     * Retreat List<DataValue> from client-side dataSet.
     * 
     * @param dataSource - DataSource.
     * @param data - Map<String, Object> client-side dataSet.
     * @param key - String.
     * @param fieldName - String.
     * @return List<DataValue>.
     */
    private List<DataValue> getDataValues(final DataSource dataSource,
            final Map<String, Object> data, final String key, final String fieldName) {
        final List<DataValue> result = new ArrayList<DataValue>();
        final JSONArray records = (JSONArray) data.get(key);
        if (records != null) {
            for (int i = 0; i < records.length(); i++) {
                final DataValue dataValue = new DataValue(dataSource.findField(fieldName));
                dataValue.setUiValue(records.getJSONObject(i).getString("n"));
                result.add(dataValue);
            }
        }
        
        return result;
    }
    
    /**
     * Get 2D dataSet.
     * 
     * @param sortFieldDefs - JSONArray.
     * @param groupByFieldNames - JSONArray.
     * @return DataSet2D.
     */
    private DataSet2D getDataSet(final JSONArray sortFieldDefs, final JSONArray groupByFieldNames) {
        final DataSet2D dataSet = new DataSet2D(groupByFieldNames.getString(0),
            groupByFieldNames.getString(1));
        
        final List<DataSourceImpl.SortField> sortFields = new ArrayList<DataSourceImpl.SortField>();
        if (sortFieldDefs != null) {
            for (int i = 0; i < sortFieldDefs.length(); i++) {
                final JSONObject rowFieldDef = sortFieldDefs.getJSONObject(i);
                final String table = rowFieldDef.getString("table");
                final String name = rowFieldDef.getString("name");
                final boolean ascending = rowFieldDef.getBoolean("ascending");
                final SortFieldDef rowSortFieldDef = new SortFieldDef(name, table, ascending);
                sortFields.add(SortFieldRuntimeConverter.toRuntime(rowSortFieldDef));
            }
            
        }
        dataSet.setSortFieldDefs(sortFields);
        
        return dataSet;
    }
    
    /**
     * Custom Coloring XLS report by implementing CrossTab2DBuilder's doEdition().
     * 
     * @author Shao Yong.
     * 
     */
    static class CustomCrossTab2DBuilder extends CrossTab2DBuilder {
        /**
         * Start coloring row.
         */
        private static final int STARTROW = 6;
        
        /**
         * Start coloring column.
         */
        private static final int STARTCOLUMN = 3;
        
        /**
         * FF6500.
         */
        private static final Color COLOR1 = new Color(255, 101, 0);
        
        /**
         * FF9A00.
         */
        private static final Color COLOR2 = new Color(255, 154, 0);
        
        /**
         * FFCF00.
         */
        private static final Color COLOR3 = new Color(255, 207, 0);
        
        /**
         * FFFF00.
         */
        private static final Color COLOR4 = new Color(255, 255, 0);
        
        /**
         * FFFFCE.
         */
        private static final Color COLOR5 = new Color(255, 255, 206);
        
        /**
         * colors.
         */
        private final Color[][] colors = { { COLOR1, COLOR1, COLOR2, COLOR3, COLOR4, COLOR5 },
                { COLOR1, COLOR2, COLOR2, COLOR3, COLOR4, COLOR5 },
                { COLOR2, COLOR2, COLOR2, COLOR3, COLOR4, COLOR5 },
                { COLOR2, COLOR2, COLOR3, COLOR3, COLOR4, COLOR5 },
                { COLOR3, COLOR3, COLOR3, COLOR3, COLOR4, COLOR5 },
                { COLOR3, COLOR3, COLOR3, COLOR3, COLOR4, COLOR5 },
                { COLOR4, COLOR4, COLOR4, COLOR4, COLOR4, COLOR5 },
                { COLOR4, COLOR4, COLOR4, COLOR4, COLOR5, COLOR5 },
                { COLOR4, COLOR4, COLOR4, COLOR5, COLOR5, COLOR5 },
                { COLOR4, COLOR4, COLOR5, COLOR5, COLOR5, COLOR5 },
                { COLOR5, COLOR5, COLOR5, COLOR5, COLOR5, COLOR5 } };
        
        @Override
        public void doEdition() {
            // XXX: overwrite standard API to color data cells in report
            int row = STARTROW;
            for (Color[] color : this.colors) {
                for (int j = 0; j < this.colors[0].length; j++) {
                    setColor(row, j + STARTCOLUMN, color[j]);
                    setColor(row + 1, j + STARTCOLUMN, color[j]);
                }
                row++;
                row++;
            }
        }
    }
}
