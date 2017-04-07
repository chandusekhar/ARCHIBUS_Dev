package com.archibus.eventhandler.green.footprint;

import java.text.ParseException;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.AbstractDataSourceDef;
import com.archibus.model.view.datasource.field.*;
import com.archibus.model.view.form.ViewDef;
import com.archibus.model.view.form.processor.ViewDefLoader;

public class FootprintReporting {
    // @translatable
    private static String S1_TOTAL = "Scope 1 Emissions";
    
    // @translatable
    private static String S1_FUEL_COMB = "Stationary Fuel Combustion";
    
    // @translatable
    private static String S1_CO_AIRC = "Company Air Transportation";
    
    // @translatable
    private static String S1_CO_ROAD = "Company Road Transportation";
    
    // @translatable
    private static String S1_REFRIG_AIRC = "Refrigeration & A/C";
    
    // @translatable
    private static String S2_TOTAL = "Scope 2 Emissions";
    
    // @translatable
    private static String S2_PURCH_E = "Purchased Electricity";
    
    // @translatable
    private static String S3_TOTAL = "Scope 3 Emissions";
    
    // @translatable
    private static String S3_WASTE_SOL = "Solid Waste";
    
    // @translatable
    private static String S3_WASTE_LIQ = "Liquid Waste";
    
    // @translatable
    private static String S3_EM_ROAD = "Employee Road Transportation";
    
    // @translatable
    private static String S3_EM_RAIL = "Employee Rail Transportation";
    
    // @translatable
    private static String S3_EM_AIR = "Employee Air Transportation";
    
    // @translatable
    private static String S3_MAT = "Purchased Materials";
    
    // @translatable
    private static String S3_CONT = "Contractor-Owned Vehicles";
    
    // @translatable
    private static String S3_OUTS = "Outsourced Activities";
    
    // @translatable
    private static String S3_SERV = "Off-site Servers";
    
    // @translatable
    private static String OTHER_TOTAL = "Other Emissions";
    
    // @translatable
    private static String S_OTHER = "Other";
    
    private final List<DataRecord> records = null;
    
    /**
     * Get data for pie charts.
     */
    public void getPieChartData(EventHandlerContext context) {
        /*
         * read config parameter
         */
        String viewName = context.getString("viewName");
        String restriction = "";
        if (context.parameterExists("restriction")) {
            restriction = context.getString("restriction");
        }
        JSONArray groupingAxisJson = context.getJSONArray("groupingAxis");
        
        JSONArray dataAxisJson = null;
        if (context.parameterExists("dataAxis")) {
            dataAxisJson = context.getJSONArray("dataAxis");
        }
        
        JSONArray jsonRecords = new JSONArray();
        if (groupingAxisJson != null && groupingAxisJson.length() > 0) {
            JSONObject groupingAxis = (JSONObject) groupingAxisJson.get(0);
            String groupingAxisDataSourceId = groupingAxis.get("dataSourceId").toString();
            String groupingAxisFieldName = groupingAxis.get("id").toString();
            
            DataSource groupingAxisDataSource = DataSourceFactory.loadDataSourceFromFile(viewName,
                groupingAxisDataSourceId);
            List groupingAxisRecords = groupingAxisDataSource.getRecords(restriction);
            
            /*
             * We also need datasource view definition to get titles from there.
             */
            ViewDefLoader viewDefLoader = new ViewDefLoader();
            ViewDef viewDef = viewDefLoader.load(viewName);
            AbstractDataSourceDef dataSourceDef = viewDef
                .getDataSourceDefById(groupingAxisDataSourceId);
            
            JSONObject dataAxis = dataAxisJson.getJSONObject(0);
            String dataAxisFieldName = dataAxis.get("id").toString();
            String dataAxisTableName = dataAxis.getString("table").toString();
            
            if (!groupingAxisRecords.isEmpty()) {
                DataRecord record = (DataRecord) groupingAxisRecords.get(0);
                List dataValueFields = record.getFields();
                for (int i = 0; i < dataValueFields.size(); i++) {
                    JSONObject data = new JSONObject();
                    DataValue recDataValue = (DataValue) dataValueFields.get(i);
                    // save this value if .....
                    String fieldName = recDataValue.getName();
                    if (fieldName.indexOf(dataAxisTableName) == 0
                            && !fieldName.equals(dataAxisFieldName)
                            && !fieldName.equals(groupingAxisFieldName)
                            && (fieldName.indexOf(".scenario_id") == -1
                                    && fieldName.indexOf(".site_id") == -1
                                    && fieldName.indexOf(".bl_id") == -1 && fieldName
                                .indexOf(".calc_year") == -1)) {
                        // find field title in
                        for (AbstractDataSourceFieldDef abstractField : dataSourceDef
                            .getFieldDefs()) {
                            if (abstractField instanceof AbstractVirtualFieldDef) {
                                AbstractVirtualFieldDef abstractVirtualFieldDef = (AbstractVirtualFieldDef) abstractField;
                                
                                if (abstractVirtualFieldDef.getFullName().equals(fieldName)) {
                                    
                                    String groupingValue = abstractVirtualFieldDef.getTitle()
                                        .getTranslatedString();
                                    Double dataValue = (Double) recDataValue.getValue();
                                    data.put(groupingAxisFieldName, groupingValue);
                                    data.put(dataAxisFieldName, dataValue);
                                    jsonRecords.put(data);
                                }
                            }
                        }
                    }
                }
            }
        }
        context.addResponseParameter("jsonExpression", jsonRecords.toString());
    }
    
    public DataSetList getScopesData(JSONObject parameters) throws ParseException {
        // read parameters
        String viewName = "";
        if (parameters.has("viewName")) {
            viewName = parameters.getString("viewName");
        }
        String dataSourceId = "";
        if (parameters.has("dataSourceId")) {
            dataSourceId = parameters.getString("dataSourceId");
        }
        
        String sortValues = "";
        if (parameters.has("sortValues")) {
            sortValues = parameters.getString("sortValues");
        }
        JSONArray jsonSortValues = new JSONArray(sortValues);
        boolean isTotalPerArea = false;
        if (parameters.has("isTotalPerArea")) {
            isTotalPerArea = parameters.getBoolean("isTotalPerArea");
        }
        boolean isScopeGrid = false;
        if (parameters.has("isScopeGrid")) {
            isScopeGrid = parameters.getBoolean("isScopeGrid");
        }
        boolean isScope1 = false;
        if (parameters.has("isScope1")) {
            isScope1 = parameters.getBoolean("isScope1");
        }
        boolean isScope2 = false;
        if (parameters.has("isScope2")) {
            isScope2 = parameters.getBoolean("isScope2");
        }
        boolean isScope3 = false;
        if (parameters.has("isScope3")) {
            isScope3 = parameters.getBoolean("isScope3");
        }
        boolean isOther = false;
        if (parameters.has("isOther")) {
            isOther = parameters.getBoolean("isOther");
        }
        String restriction = "";
        if (parameters.has("restriction")) {
            restriction = parameters.getString("restriction");
        }
        // load control datasource from view
        DataSource controlDataSource = DataSourceFactory.loadDataSourceFromFile(viewName,
            dataSourceId);
        
        // check if is building or site report
        boolean isBuildingReport = false;
        JSONObject jsonRestriction = new JSONObject(restriction);
        JSONArray jsonClauses = jsonRestriction.getJSONArray("clauses");
        for (int i = 0; i < jsonClauses.length(); i++) {
            JSONObject clause = jsonClauses.getJSONObject(i);
            if (clause.getString("name").equals(new String("gb_fp_totals.bl_id"))) {
                isBuildingReport = true;
                break;
            }
        }
        List<DataRecord> outputRecords = new ArrayList<DataRecord>();
        DataRecord totalsRec = controlDataSource.createRecord();
        // i must add virtual fields
        for (int i = 0; i < controlDataSource.getVirtualFields().size(); i++) {
            totalsRec.addField(controlDataSource.getVirtualFields().get(i));
        }
        // we need to get all records and rotate some dimensions
        List<DataRecord> records = getScopeDbRecords(isBuildingReport, jsonSortValues, restriction);
        Iterator<DataRecord> it = records.iterator();
        double dblTotal = 0.0;
        double sumGrossArea = 0.0;   // Get total gross area to compute total per area correctly
        while (it.hasNext()) {
            DataRecord scopeRec = it.next();
            String siteId = scopeRec.getString("gb_fp_totals.site_id");
            String siteName = scopeRec.getString("gb_fp_totals.site_name");
            String blId = (isBuildingReport) ? scopeRec.getString("gb_fp_totals.bl_id") : "";
            String scenarioId = scopeRec.getString("gb_fp_totals.scenario_id");
            int calcYear = scopeRec.getInt("gb_fp_totals.calc_year");
            double totalArea = scopeRec.getDouble("gb_fp_totals.area_gross_ext");
            sumGrossArea = sumGrossArea + totalArea;
            Iterator<Source> it_source = sourcesList.iterator();
            while (it_source.hasNext()) {
                Source source = it_source.next();
                String sourceField = source.getFieldName();
                String sourceName = source.getSourceName();
                String scopeName = source.getScopeName();
                double sourceValue;
                String fieldName = "gb_fp_totals." + sourceField;
                if (((isScopeGrid && sourceName.equals(scopeName)) || (!isScopeGrid && !sourceName
                    .equals(scopeName)))
                        && ((source.isScope1() && isScope1) || (source.isScope2() && isScope2)
                                || (source.isScope3() && isScope3) || (source.isOther() && isOther))) {
                    sourceValue = scopeRec.getDouble(fieldName);
                    dblTotal = dblTotal + sourceValue;
                    if (isTotalPerArea) {
                        sourceValue = (1000 * sourceValue) / totalArea; // multiply by 10^3 to
                        // convert unit output to
                        // kilograms
                    }
                    
                    DataRecord outputRec = controlDataSource.createRecord();
                    // i must add virtual fields
                    for (int i = 0; i < controlDataSource.getVirtualFields().size(); i++) {
                        outputRec.addField(controlDataSource.getVirtualFields().get(i));
                    }
                    outputRec.setValue("bl.site_id", siteId);
                    outputRec.setValue("gb_fp_totals.vf_site_name", siteName);
                    outputRec.setValue("gb_fp_totals.bl_id", blId);
                    outputRec.setValue("gb_fp_totals.scenario_id", scenarioId);
                    outputRec.setValue("gb_fp_totals.calc_year", calcYear);
                    outputRec.setValue("gb_fp_totals.vf_scope_type", sourceField);
                    outputRec.setValue("gb_fp_totals.vf_total_emiss", sourceValue);
                    outputRec.setValue("gb_fp_totals.vf_scope", EventHandlerBase.localizeString(
                        ContextStore.get().getCurrentContext(), scopeName, this.getClass()
                            .getName()));
                    outputRec.setValue("gb_fp_totals.vf_source", EventHandlerBase.localizeString(
                        ContextStore.get().getCurrentContext(), sourceName, this.getClass()
                            .getName()));
                    outputRecords.add(outputRec);
                }
                
            }
        }
        if (isTotalPerArea && sumGrossArea>0) {  // If per Area, calculate per Area total
        	dblTotal = (1000 * dblTotal) / sumGrossArea;
        }
        totalsRec.setValue("gb_fp_totals.vf_total_emiss", dblTotal);
        outputRecords.add(totalsRec);
        // totalsRec.setValue("gb_fp_totals.vf_total_emiss", dblTotal);
        return new DataSetList(outputRecords);
    }
    
    private List<DataRecord> getScopeDbRecords(boolean isBuildingReport, JSONArray sortValues,
            String restriction) {
        
        String sqlQuery = "SELECT bl.site_id, (SELECT site.name FROM site WHERE site.site_id = bl.site_id) ${sql.as} site_name, "
                + (isBuildingReport ? "gb_fp_totals.bl_id, " : "")
                + "gb_fp_totals.calc_year, gb_fp_totals.scenario_id, "
                + "SUM(gb_fp_totals.s1_co_airc) ${sql.as} s1_co_airc, SUM(gb_fp_totals.s1_co_road) ${sql.as} s1_co_road, SUM(gb_fp_totals.s1_fuel_comb) ${sql.as} s1_fuel_comb, "
                + "SUM(gb_fp_totals.s1_refrig_airc) ${sql.as} s1_refrig_airc, (SUM(gb_fp_totals.s1_co_airc)+ SUM(gb_fp_totals.s1_co_road)+ SUM(gb_fp_totals.s1_fuel_comb) + SUM(gb_fp_totals.s1_refrig_airc))${sql.as} s1_total, "
                + "SUM(gb_fp_totals.s2_purch_e) ${sql.as} s2_purch_e, SUM(gb_fp_totals.s2_purch_e) ${sql.as} s2_total, SUM(gb_fp_totals.s3_cont) ${sql.as} s3_cont,"
                + "SUM(gb_fp_totals.s3_em_air) ${sql.as} s3_em_air, SUM(gb_fp_totals.s3_em_rail) ${sql.as} s3_em_rail, SUM(gb_fp_totals.s3_em_road) ${sql.as} s3_em_road,"
                + "SUM(gb_fp_totals.s3_mat) ${sql.as} s3_mat, SUM(gb_fp_totals.s3_outs) ${sql.as} s3_outs, SUM(gb_fp_totals.s3_serv) ${sql.as} s3_serv, "
                + "SUM(gb_fp_totals.s3_waste_liq) ${sql.as} s3_waste_liq, SUM(gb_fp_totals.s3_waste_sol) ${sql.as} s3_waste_sol,"
                + "(SUM(gb_fp_totals.s3_cont)+ SUM(gb_fp_totals.s3_em_air) + SUM(gb_fp_totals.s3_em_rail) + SUM(gb_fp_totals.s3_em_road) + SUM(gb_fp_totals.s3_mat) + SUM(gb_fp_totals.s3_outs) + SUM(gb_fp_totals.s3_serv) + SUM(gb_fp_totals.s3_waste_liq) + SUM(gb_fp_totals.s3_waste_sol)) ${sql.as} s3_total,"
                + "SUM(gb_fp_totals.s_other) ${sql.as} s_other,SUM(gb_fp_totals.s_other) ${sql.as} other_total,"
                + "(SELECT SUM(gb_fp_setup.area_gross_ext) FROM gb_fp_setup, bl bl_int WHERE gb_fp_setup.bl_id = bl_int.bl_id AND gb_fp_setup.calc_year = gb_fp_totals.calc_year "
                + "AND gb_fp_setup.scenario_id = gb_fp_totals.scenario_id  AND bl_int.site_id = bl.site_id "
                + (isBuildingReport ? "AND gb_fp_setup.bl_id = gb_fp_totals.bl_id" : "")
                + ") ${sql.as} area_gross_ext "
                + "FROM gb_fp_totals LEFT OUTER JOIN bl ON bl.bl_id = gb_fp_totals.bl_id "
                + "GROUP BY bl.site_id,"
                + (isBuildingReport ? "gb_fp_totals.bl_id, " : "")
                + " gb_fp_totals.calc_year, gb_fp_totals.scenario_id";
        
        DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addQuery(sqlQuery);
        dataSource.addTable("gb_fp_totals", DataSource.ROLE_MAIN);
        dataSource.addVirtualField("gb_fp_totals", "site_id", DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField("gb_fp_totals", "site_name", DataSource.DATA_TYPE_TEXT);
        if (isBuildingReport) {
            dataSource.addVirtualField("gb_fp_totals", "bl_id", DataSource.DATA_TYPE_TEXT);
        }
        dataSource.addVirtualField("gb_fp_totals", "calc_year", DataSource.DATA_TYPE_INTEGER);
        dataSource.addVirtualField("gb_fp_totals", "scenario_id", DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField("gb_fp_totals", "s1_total", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "s2_total", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "s3_total", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "other_total", DataSource.DATA_TYPE_NUMBER, 10,
            1);
        dataSource
            .addVirtualField("gb_fp_totals", "s1_co_airc", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource
            .addVirtualField("gb_fp_totals", "s1_co_road", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "s1_fuel_comb", DataSource.DATA_TYPE_NUMBER, 10,
            1);
        dataSource.addVirtualField("gb_fp_totals", "s1_refrig_airc", DataSource.DATA_TYPE_NUMBER,
            10, 1);
        dataSource
            .addVirtualField("gb_fp_totals", "s2_purch_e", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "s3_cont", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "s3_em_air", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource
            .addVirtualField("gb_fp_totals", "s3_em_rail", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource
            .addVirtualField("gb_fp_totals", "s3_em_road", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "s3_mat", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "s3_outs", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "s3_serv", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "s3_waste_liq", DataSource.DATA_TYPE_NUMBER, 10,
            1);
        dataSource.addVirtualField("gb_fp_totals", "s3_waste_sol", DataSource.DATA_TYPE_NUMBER, 10,
            1);
        dataSource.addVirtualField("gb_fp_totals", "s_other", DataSource.DATA_TYPE_NUMBER, 10, 1);
        dataSource.addVirtualField("gb_fp_totals", "area_gross_ext", DataSource.DATA_TYPE_NUMBER,
            12, 2);
        // add sort values
        for (int i = 0; i < sortValues.length(); i++) {
            JSONObject sortField = sortValues.getJSONObject(i);
            String fieldName = sortField.getString("fieldName");
            if (isBuildingReport
                    || (!isBuildingReport && !fieldName.equals(new String("gb_fp_totals.bl_id")))) {
                String table = "gb_fp_totals";// fieldName.substring(0, fieldName.indexOf("."));
                String field = fieldName.substring(fieldName.indexOf(".") + 1);
                String order = (sortField.getInt("sortOrder") == 1) ? DataSource.SORT_ASC
                        : DataSource.SORT_DESC;
                dataSource.addSort(table, field, order);
            }
        }
        return dataSource.getRecords(restriction.replace("bl.", "gb_fp_totals."));
    }
    
    /**
     * List with used scopes.
     */
    private static List<Source> sourcesList = new ArrayList<Source>();
    static {
        // scope 1
        sourcesList.add(new Source("s1_total", "scope1", S1_TOTAL, S1_TOTAL));
        sourcesList.add(new Source("s1_fuel_comb", "scope1", S1_FUEL_COMB, S1_TOTAL));
        sourcesList.add(new Source("s1_co_road", "scope1", S1_CO_ROAD, S1_TOTAL));
        sourcesList.add(new Source("s1_co_airc", "scope1", S1_CO_AIRC, S1_TOTAL));
        sourcesList.add(new Source("s1_refrig_airc", "scope1", S1_REFRIG_AIRC, S1_TOTAL));
        // scope 2
        sourcesList.add(new Source("s2_total", "scope2", S2_TOTAL, S2_TOTAL));
        sourcesList.add(new Source("s2_purch_e", "scope2", S2_PURCH_E, S2_TOTAL));
        // scope 3
        sourcesList.add(new Source("s3_total", "scope3", S3_TOTAL, S3_TOTAL));
        sourcesList.add(new Source("s3_waste_sol", "scope3", S3_WASTE_SOL, S3_TOTAL));
        sourcesList.add(new Source("s3_waste_liq", "scope3", S3_WASTE_LIQ, S3_TOTAL));
        sourcesList.add(new Source("s3_em_road", "scope3", S3_EM_ROAD, S3_TOTAL));
        sourcesList.add(new Source("s3_em_rail", "scope3", S3_EM_RAIL, S3_TOTAL));
        sourcesList.add(new Source("s3_em_air", "scope3", S3_EM_AIR, S3_TOTAL));
        sourcesList.add(new Source("s3_mat", "scope3", S3_MAT, S3_TOTAL));
        sourcesList.add(new Source("s3_cont", "scope3", S3_CONT, S3_TOTAL));
        sourcesList.add(new Source("s3_outs", "scope3", S3_OUTS, S3_TOTAL));
        sourcesList.add(new Source("s3_serv", "scope3", S3_SERV, S3_TOTAL));
        // other
        sourcesList.add(new Source("other_total", "other", OTHER_TOTAL, OTHER_TOTAL));
        sourcesList.add(new Source("s_other", "other", S_OTHER, OTHER_TOTAL));
    }
    
    /**
     * Scope class.
     * 
     */
    public static class Source {
        
        private boolean isScope1 = false;
        
        private boolean isScope2 = false;
        
        private boolean isScope3 = false;
        
        private boolean isOther = false;
        
        private final String fieldName;
        
        private final String sourceName;
        
        private final String scopeName;
        
        /**
         * Define scope object.
         * 
         * @param fieldName field name from gb_fp_totals table
         * @param scope scope type
         * @param tableName sources table name
         * @param totalFieldName total emission field name
         * @param restriction custom scope restriction
         * @param sourceName scope name
         */
        public Source(String fieldName, String scope, String sourceName, String scopeName) {
            this.fieldName = fieldName;
            this.sourceName = sourceName;
            this.scopeName = scopeName;
            this.isScope1 = scope.equals(new String("scope1"));
            this.isScope2 = scope.equals(new String("scope2"));
            this.isScope3 = scope.equals(new String("scope3"));
            this.isOther = scope.equals(new String("other"));
        }
        
        public boolean isScope1() {
            return this.isScope1;
        }
        
        public boolean isScope2() {
            return this.isScope2;
        }
        
        public boolean isScope3() {
            return this.isScope3;
        }
        
        public boolean isOther() {
            return this.isOther;
        }
        
        public String getFieldName() {
            return this.fieldName;
        }
        
        public String getScopeName() {
            return this.scopeName;
        }
        
        public String getSourceName() {
            return this.sourceName;
        }
    }
    
}
