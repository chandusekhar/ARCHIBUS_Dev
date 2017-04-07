package com.archibus.eventhandler.green.footprint;

import java.text.ParseException;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.green.*;
import com.archibus.ext.report.ReportUtility;
import com.archibus.ext.report.xls.GridBuilder;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.*;
import com.aspose.cells.*;

/**
 * Carbon Footprint Handler.
 * 
 * @author Ioan Draghici
 * 
 */
public class FootprintHandler extends JobBase {
    /**
     * Job Status Message.
     */
    // @translatable
    private static String MESSAGE_SUMMARIZE_EMISSION = "Summarizing Emissions";
    
    /**
     * Job Status Message.
     */
    // @translatable
    private static String MESSAGE_CALCULATE_EMISSION = "Calculate Emissions";
    
    /**
     * Job Status Message
     */
    // @translatable
    private static String MESSAGE_EXPORT_ENERGY_STAR_DATA = "Export Energy Star Data";
    
    /**
     * Job Status Message
     */
    // @translatable
    private static String MESSAGE_ERROR_EXPORT_ENERGY_STAR_DATA =
            "Error when export energy star data for";
    
    /**
     * Job Status Message
     */
    // @translatable
    private static String MESSAGE_EXPORT_ENERGY_STAR_DATA_FOR = "Export Energy Star Data for";
    
    /**
     * File name for Energy Star Data export
     */
    // @translatable
    private static String FILE_NAME_ENERGY_STAR_DATA_FOR = "Energy Star Data for";
    
    /**
     * Get default unit for unit type.
     * 
     * @param unit_type_id string unit type
     * @return string
     */
    public String getDefaultUnit(final String unit_type_id) {
        return GbUnits.getDefaultUnit(unit_type_id);
    }
    
    /**
     * Convert user entry to unit.
     * 
     * @param unit_type_id string unit type
     * @param unit_id string unit
     * @param entered_value double user entry
     * @return double
     */
    public double getConvertedValue(final String unit_type_id, final String unit_id,
            final double entered_value, final boolean isDivision) {
        return GbUnits.getConvertedValue(unit_type_id, unit_id, entered_value, isDivision);
    }
    
    /**
     * Reset the "old" default value for a unit type
     * 
     * @param unit_type_id unit type
     * @param unit_id "new" default unit
     */
    public void resetDefaultUnit(final String unit_type_id, final String unit_id) {
        GbUnits.resetDefaultUnit(unit_type_id, unit_id);
    }
    
    /**
     * Summarize emissions for specified sources from gb_fp_setup table.
     * 
     * @param bl_id selected building codes
     * @param calc_year selected calculation years
     * @param scenario_id selected scenarios
     */
    public void summarizeEmissions(final List<String> bl_id, final List<String> calc_year,
            final List<String> scenario_id) {
        
        this.status.setMessage(EventHandlerBase.localizeString(ContextStore.get()
            .getCurrentContext(), MESSAGE_SUMMARIZE_EMISSION, this.getClass().getName()));
        
        // get gb_fp_setup records
        final List<DataRecord> records = getEmissionSources(bl_id, calc_year, scenario_id);
        
        final Iterator<DataRecord> it = records.iterator();
        int current = 0;
        this.status.setTotalNumber(records.size() * 10);
        this.status.setCurrentNumber(current);
        while (it.hasNext() && !this.status.isStopRequested()) {
            final DataRecord row = it.next();
            final String blId = row.getString("gb_fp_setup.bl_id");
            final int calcYear = row.getInt("gb_fp_setup.calc_year");
            final String scenarioId = row.getString("gb_fp_setup.scenario_id");
            
            final Footprint gbFootprint = new Footprint(blId, calcYear, scenarioId);
            gbFootprint.summarizeEmissions(this.status);
            
            this.status.setMessage(EventHandlerBase.localizeString(ContextStore.get()
                .getCurrentContext(), MESSAGE_SUMMARIZE_EMISSION, this.getClass().getName()));
            this.status.setCurrentNumber(++current);
        }
        
        if (this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
    
    /**
     * Summarize emissions for all sources from gb_fp_setup table. Called from the Pnav Summarize
     * Emission Totals tasks to update all the footprint building records
     */
    public void summarizeEmissionsAll() {
        
        summarizeEmissions(null, null, null);
    }
    
    /**
     * Calculate Emissions for all records.
     */
    public void calculateEmissionsAll() {
        calculateEmissions(null, null, null);
    }
    
    /**
     * Calculate emissions for selected buildings, calculation years and scenarios
     * 
     * @param bl_id list with selected building id's
     * @param calc_year list with selected calculation years
     * @param scenario_id list with selected scenarios
     */
    public void calculateEmissions(final List<String> bl_id, final List<String> calc_year,
            final List<String> scenario_id) {
        this.status.setMessage(EventHandlerBase.localizeString(ContextStore.get()
            .getCurrentContext(), MESSAGE_CALCULATE_EMISSION, this.getClass().getName()));
        
        // get gb_fp_setup records
        final List<DataRecord> records = getEmissionSources(bl_id, calc_year, scenario_id);
        
        final Iterator<DataRecord> it = records.iterator();
        int current = 0;
        this.status.setTotalNumber(records.size());
        this.status.setCurrentNumber(current);
        while (it.hasNext() && !this.status.isStopRequested()) {
            final DataRecord row = it.next();
            final String blId = row.getString("gb_fp_setup.bl_id");
            final int calcYear = row.getInt("gb_fp_setup.calc_year");
            final String scenarioId = row.getString("gb_fp_setup.scenario_id");
            
            final Footprint gbFootprint = new Footprint(blId, calcYear, scenarioId);
            gbFootprint.calculateEmissions(this.status);
            
            this.status.setMessage(EventHandlerBase.localizeString(ContextStore.get()
                .getCurrentContext(), MESSAGE_CALCULATE_EMISSION, this.getClass().getName()));
            this.status.setCurrentNumber(++current);
        }
        
        if (this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
    
    /**
     * Calculate Scope 1 Fuel Combustion for building, year, scenario and source
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     */
    public JSONObject calculateScope1FuelCombustion(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id) {
        
        final FootprintScope1 footprintScope1 = new FootprintScope1();
        final JSONObject jsonExpression =
                footprintScope1.calculateScope1FuelCombustion(bl_id, calc_year, scenario_id,
                    source_id, this.status);
        
        return jsonExpression;
    }
    
    /**
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     * @param scope_cat
     * @return
     */
    public JSONObject calculateScope1Scope3Mobile(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id, final String scope_cat) {
        
        final FootprintScope1 footprintScope1 = new FootprintScope1();
        final JSONObject jsonExpression =
                footprintScope1.calculateScope1Scope3Mobile(bl_id, calc_year, scenario_id,
                    source_id, scope_cat, this.status);
        
        return jsonExpression;
    }
    
    /**
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     * @return
     */
    public JSONObject calculateScope1CompanyOwnedAircraft(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id) {
        
        final FootprintScope1 footprintScope1 = new FootprintScope1();
        final JSONObject jsonExpression =
                footprintScope1.calculateScope1CompanyOwnedAircraft(bl_id, calc_year, scenario_id,
                    source_id, this.status);
        return jsonExpression;
    }
    
    /**
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     * @return
     */
    public JSONObject calculateScope1RefrigerantAC(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id) {
        
        final FootprintScope1 footprintScope1 = new FootprintScope1();
        final JSONObject jsonExpression =
                footprintScope1.calculateScope1RefrigerantAC(bl_id, calc_year, scenario_id,
                    source_id, this.status);
        return jsonExpression;
    }
    
    /**
     * Calculate Scope 2 Purchased Electricity, Heat and Steam for building, year, scenario and
     * source
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     */
    public JSONObject calculateScope2PurchasedElectricity(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id) {
        
        final FootprintScope2 footprintScope2 = new FootprintScope2();
        final JSONObject jsonExpression =
                footprintScope2.calculateScope2PurchasedElectricity(bl_id, calc_year, scenario_id,
                    source_id, this.status);
        
        return jsonExpression;
    }
    
    /**
     * Calculate Scope 3 Waste Solid for building, year, scenario and source
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     */
    public JSONObject calculateScope3WasteSolid(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id) {
        
        final FootprintScope3 footprintScope3 = new FootprintScope3();
        final JSONObject jsonExpression =
                footprintScope3.calculateScope3WasteSolid(bl_id, calc_year, scenario_id, source_id,
                    this.status);
        
        return jsonExpression;
    }
    
    /**
     * Calculate Scope 3 Waste Liquid for building, year, scenario and source
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     */
    public JSONObject calculateScope3WasteLiquid(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id) {
        
        final FootprintScope3 footprintScope3 = new FootprintScope3();
        final JSONObject jsonExpression =
                footprintScope3.calculateScope3WasteLiquid(bl_id, calc_year, scenario_id,
                    source_id, this.status);
        
        return jsonExpression;
    }
    
    /**
     * Calculate Scope 3 Employee Aircraft for building, year, scenario and source
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     */
    public JSONObject calculateScope3EmployeeAircraft(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id) {
        
        final FootprintScope3 footprintScope3 = new FootprintScope3();
        final JSONObject jsonExpression =
                footprintScope3.calculateScope3EmployeeAircraft(bl_id, calc_year, scenario_id,
                    source_id, this.status);
        
        return jsonExpression;
    }
    
    /**
     * Calculate Scope 3 Purchased Materials for building, year, scenario and source
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     */
    public JSONObject calculateScope3PurchasedMaterials(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id) {
        
        final FootprintScope3 footprintScope3 = new FootprintScope3();
        final JSONObject jsonExpression =
                footprintScope3.calculateScope3PurchasedMaterials(bl_id, calc_year, scenario_id,
                    source_id, this.status);
        
        return jsonExpression;
    }
    
    /**
     * Calculate Scope 3 Outsourced for building, year, scenario and source
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     */
    public JSONObject calculateScope3Outsourced(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id) {
        
        final FootprintScope3 footprintScope3 = new FootprintScope3();
        final JSONObject jsonExpression =
                footprintScope3.calculateScope3Outsourced(bl_id, calc_year, scenario_id, source_id,
                    this.status);
        
        return jsonExpression;
    }
    
    /**
     * Calculate Scope 3 Off-site servers for building, year, scenario and source
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     * @param source_id
     */
    public JSONObject calculateScope3OffSiteServers(final String bl_id, final int calc_year,
            final String scenario_id, final int source_id) {
        
        final FootprintScope3 footprintScope3 = new FootprintScope3();
        final JSONObject jsonExpression =
                footprintScope3.calculateScope3OffSiteServers(bl_id, calc_year, scenario_id,
                    source_id, this.status);
        
        return jsonExpression;
    }
    
    /**
     * Custom refresh WFR for Footprint by Source Detail report - scope grid.
     * 
     * @param parameters
     * @return
     * @throws ParseException
     */
    public DataSetList getScopeDataBySourceDetails(final JSONObject parameters)
            throws ParseException {
        final FootprintReporting reportingHandler = new FootprintReporting();
        return reportingHandler.getScopesData(parameters);
    }
    
    /**
     * Custom refresh WFR for pie chart
     */
    public void getPieChartData() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final FootprintReporting reportingHandler = new FootprintReporting();
        reportingHandler.getPieChartData(context);
    }
    
    /**
     * Check is exists valid license for activity
     * 
     * @param activityId
     * @return
     */
    public boolean isActivityLicense(final String activityId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        return (EventHandlerBase.isActivityLicenseEnabled(context, activityId));
    }
    
    // --------------------- private methods ----------------
    
    /**
     * Get emissions sources from gb_fp_setup table.
     * 
     * @param bl_id selected buildings
     * @param calc_year selected years
     * @param scenario_id selected scenarios
     * @return gb_fp_setup records
     */
    private List<DataRecord> getEmissionSources(final List<String> bl_id,
            final List<String> calc_year, final List<String> scenario_id) {
        // get gb_fp_setup records
        final DataSource dsSources = DataSourceFactory.createDataSource();
        dsSources.addTable("gb_fp_setup");
        dsSources.addField("scenario_id");
        dsSources.addField("bl_id");
        dsSources.addField("calc_year");
        if (bl_id != null && !bl_id.isEmpty()) {
            final String value = getRestrictionValue(bl_id);
            dsSources.addRestriction(Restrictions.in("gb_fp_setup", "bl_id", value));
        }
        if (calc_year != null && !calc_year.isEmpty()) {
            final String value = getRestrictionValue(calc_year);
            dsSources.addRestriction(Restrictions.in("gb_fp_setup", "calc_year", value));
        }
        if (scenario_id != null && !scenario_id.isEmpty()) {
            final String value = getRestrictionValue(scenario_id);
            dsSources.addRestriction(Restrictions.in("gb_fp_setup", "scenario_id", value));
        }
        return (dsSources.getRecords());
    }
    
    /**
     * Convert list to restriction string.
     * 
     * @param input value list
     * @return string
     */
    private String getRestrictionValue(final List<String> input) {
        String result = "";
        if (!input.isEmpty()) {
            final Iterator<String> it = input.iterator();
            while (it.hasNext()) {
                final String value = it.next().toString();
                result += (result != "" ? "," : "") + value;
            }
        }
        return result;
    }
    
    /**
     * Export energt star data.
     * 
     * @param records JSONArray selected row records from view
     * @return void
     */
    public void exportEnergyStarData(final JSONArray records, final JSONArray dataSourcesDefFromView) {
        final Map<String, String> blUseMap = getBlUseMap(records);
        final Iterator<Map.Entry<String, String>> it = blUseMap.entrySet().iterator();
        while (it.hasNext()) {
            final Map.Entry<String, String> blUseEntry = it.next();
            final String blUse = blUseEntry.getKey();
            final String restriction = blUseEntry.getValue();
            try {
                exportDataByBlUse(blUse, restriction, dataSourcesDefFromView);
            } catch (final Exception e) {
                
                final String errorMessage =
                        EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
                            MESSAGE_ERROR_EXPORT_ENERGY_STAR_DATA, this.getClass().getName())
                                + " "
                                + blUse;
                throw new ExceptionBase(null, errorMessage, e);
            }
        }
        
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setResult(new JobResult(EventHandlerBase.localizeString(ContextStore.get()
                .getCurrentContext(), MESSAGE_EXPORT_ENERGY_STAR_DATA, this.getClass().getName())));
        }
    }
    
    /**
     * get building use and stored as a map.
     * 
     * @param records JSONArray selected row records from view
     * @return Map the building use map
     */
    private Map<String, String> getBlUseMap(final JSONArray records) {
        final Map<String, String> blUseMap = new HashMap<String, String>();
        String blUse = records.getJSONObject(0).getJSONObject("values").getString("bl.use1");
        String restrictionForBluse = "";
        for (int i = 0; i < records.length(); i++) {
            final JSONObject record = records.getJSONObject(i).getJSONObject("values");
            final String blUseTemp = record.getString("bl.use1");
            final String blId = record.getString("gb_fp_setup.bl_id");
            final String year = record.getString("gb_fp_setup.calc_year");
            final String scenarioId = record.getString("gb_fp_setup.scenario_id");
            if (StringUtil.notNullOrEmpty(blUseTemp)) {
                if (blUseTemp.equals(blUse)) {
                    restrictionForBluse +=
                            "OR (gb_fp_setup.bl_id ='" + blId + "'"
                                    + " AND gb_fp_setup.calc_year =" + year
                                    + " AND gb_fp_setup.scenario_id ='" + scenarioId + "'" + ")";
                } else {
                    blUseMap.put(blUse, restrictionForBluse.substring(2));
                    blUse = blUseTemp;
                    restrictionForBluse =
                            "OR (gb_fp_setup.bl_id ='" + blId + "'"
                                    + " AND gb_fp_setup.calc_year =" + year
                                    + " AND gb_fp_setup.scenario_id ='" + scenarioId + "'" + ")";
                }
            }
        }
        
        blUseMap.put(blUse, restrictionForBluse.substring(2));
        return blUseMap;
    }
    
    /**
     * export energy star data by building use, every use will generate to single file.
     * 
     * @param blUse String building use
     * @param restriction String the selected building list restricted the records
     * @param dataSourcesDefFromView JSONArray dataSource definition from the view
     *            ab-gb-fp-es-exp.axvw
     * @return void
     */
    private void exportDataByBlUse(final String blUse, final String restriction,
            final JSONArray dataSourcesDefFromView) throws Exception {
        final List<JSONObject> dataSouceList =
                getEnergyStarDataSourceListByBlUse(blUse, dataSourcesDefFromView);
        final Workbook workBook = new Workbook();
        final WorksheetCollection sheets = workBook.getWorksheets();
        for (final JSONObject ds : dataSouceList) {
            final Worksheet sheet = createSheetByDataSource(ds, restriction);
            sheets.add(sheet.getName()).copy(sheet);
        }
        sheets.removeAt(0);
        
        final String fileName =
                EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
                    FILE_NAME_ENERGY_STAR_DATA_FOR, this.getClass().getName())
                        + " "
                        + blUse.replaceAll("/", "-") + ".xls";
        final String folder =
                ContextStore.get().getWebAppPath()
                        + ReportUtility.getPerUserReportFilesPath(ContextStore.get());
        
        FileUtil.createFoldersIfNot(folder);
        workBook.save(folder + fileName);
        
        final String jobTitle =
                EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
                    MESSAGE_EXPORT_ENERGY_STAR_DATA_FOR, this.getClass().getName()) + " " + blUse;
        this.status.addPartialResult(new JobResult(jobTitle, fileName, ContextStore.get()
            .getContextPath()
                + ReportUtility.getPerUserReportFilesPath(ContextStore.get())
                + fileName));
    }
    
    /**
     * get dataSource list for selected building use. Every datasource will generate data to one
     * sheet in xls file.
     * 
     * @param blUse String building use
     * @return dataSource list for selected building use
     */
    private List<JSONObject> getEnergyStarDataSourceListByBlUse(final String blUse,
            final JSONArray dataSourcesDefFromView) {
        final List<JSONObject> dataSouceNameList = new ArrayList<JSONObject>();
        for (int i = 0; i < dataSourcesDefFromView.length(); i++) {
            final JSONObject dataSourceDef = dataSourcesDefFromView.getJSONObject(i);
            
            if (!dataSourceDef.getString("blUse").equals("")) {
                final String[] blUseArray = dataSourceDef.getString("blUse").split("\\|");
                for (final String element : blUseArray) {
                    if (element.equals("ALL") || element.equals(blUse)) {
                        dataSouceNameList.add(dataSourceDef);
                    }
                }
            }
        }
        
        return dataSouceNameList;
    }
    
    /**
     * create sheet by the data source.
     * 
     * @param id String dataSource id
     * @param dsDef JSONObject datasource definition come from view ab-gb-fp-es-exp.axvw
     * @return sheet Worksheet
     */
    private Worksheet createSheetByDataSource(final JSONObject ds, final String restriction)
            throws Exception {
        final String viewFile = "ab-gb-fp-es-exp.axvw";
        final String dataSourceName = ds.getString("id");
        final String fileName = dataSourceName + ".xls";
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(viewFile, dataSourceName);
        final List<DataRecord> records = dataSource.getRecords(restriction);
        final GridBuilder reportBuilder = new GridBuilder();
        reportBuilder.setFileName(fileName);
        final List<Map<String, Object>> visibleFields = getVisibleFieldsByDataSource(ds);
        reportBuilder.build(records, "", visibleFields);
        final String filePath =
                ContextStore.get().getWebAppPath()
                        + ReportUtility.getPerUserReportFilesPath(ContextStore.get()) + fileName;
        final Workbook workBook = new Workbook(filePath);
        
        final Worksheet sheet = workBook.getWorksheets().get(0);
        sheet.getCells().deleteRows(0, 2, true);
        sheet.setName(ds.getString("title"));
        FileUtil.deleteFile(filePath);
        return sheet;
    }
    
    /**
     * get visible fields by datasource.
     * 
     * @param id String dataSource id
     * @param dsDef JSONObject datasource definition come from view ab-gb-fp-es-exp.axvw
     * @return VisibleFieldsList List
     */
    private List<Map<String, Object>> getVisibleFieldsByDataSource(final JSONObject dsDef)
            throws ParseException {
        String visibleFieldString = "";
        final JSONArray visibleFields = dsDef.getJSONArray("fieldDefs");
        for (int i = 0; i < visibleFields.length(); i++) {
            final JSONObject field = visibleFields.getJSONObject(i);
            // add to fix KB3030445, not show the hidden field in the export datasource
            if (!field.getBoolean("hidden")) {
                visibleFieldString +=
                        ",{id:'" + field.getString("fullName") + "',title:'"
                                + field.getString("title") + "',isNumeric:false}";
            }
        }
        visibleFieldString = "[" + visibleFieldString.substring(1) + "]";
        return EventHandlerBase.fromJSONArray(new JSONArray(visibleFieldString));
    }
    
    /**
     * Copies footprint sources records from the given footprint to the given footprint
     * 
     * @param srcBl_id
     * @param srcCalc_year
     * @param srcScenario_id
     * @param destBl_id
     * @param destCalc_year
     * @param destScenario_id
     * @param setEmissionsZero true if the consumptions and emissions should be set to zero, false
     *            otherwise
     */
    public void copyFootprintSources(final String srcBl_id, final int srcCalc_year,
            final String srcScenario_id, final String destBl_id, final int destCalc_year,
            final String destScenario_id, final boolean setEmissionsZero) {
        final Footprint gbFootprint = new Footprint(srcBl_id, srcCalc_year, srcScenario_id);
        gbFootprint.copyFootprintSources(destBl_id, destCalc_year, destScenario_id,
            setEmissionsZero);
    }
    
    /**
     * Save Scenario. Handles the scenario renaming in cascade (tables: gb_fp_setup, gb_fp_totals,
     * gb_fp_s1_*, gb_fp_s2_*, gb_fp_s3*, gb_fp_s_other).
     * 
     * @param viewName The view where the dataSource is defined
     * @param dataSourceId dataSource ID for scenario records
     * @param record The scenario record to save
     */
    public void saveScenario(final String viewName, final String dataSourceId,
            final DataRecord record) {
        // save the scenario record
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(viewName, dataSourceId);
        dataSource.saveRecord(record);
        
        /*
         * If the scenario_id changed, update gb_fp_setup (which will update child tables also)
         */
        final String oldScenarioId = (String) record.getOldValue("scenario.proj_scenario_id");
        final String newScenarioId = (String) record.getValue("scenario.proj_scenario_id");
        if (!record.isNew() && !newScenarioId.equals(oldScenarioId)) {
            final DataSource setupDataSource =
                    DataSourceFactory.createDataSourceForFields("gb_fp_setup", new String[] {
                            "bl_id", "calc_year", "scenario_id" });
            setupDataSource.addRestriction(Restrictions.eq("gb_fp_setup", "scenario_id",
                oldScenarioId));
            final List<DataRecord> records = setupDataSource.getRecords();
            for (final DataRecord dataRecord : records) {
                dataRecord.setValue("gb_fp_setup.scenario_id", newScenarioId);
                setupDataSource.saveRecord(dataRecord);
            }
        }
    }
    
    /**
     * Delete carbon footprint scenario with all dependent data.
     * 
     * @param viewName The view where the dataSource is defined
     * @param dataSourceId dataSource ID for scenario records
     * @param record The scenario record to delete
     */
    public void deleteScenario(final String viewName, final String dataSourceId,
            final DataRecord record) {
        // delete scenario records from gb_fp_setup table, cascade handler should delete child
        // records also
        final String scenarioId = (String) record.getValue("scenario.proj_scenario_id");
        final DataSource setupDataSource =
                DataSourceFactory.createDataSourceForFields("gb_fp_setup", new String[] { "bl_id",
                        "calc_year", "scenario_id" });
        setupDataSource.addRestriction(Restrictions.eq("gb_fp_setup", "scenario_id", scenarioId));
        final List<DataRecord> records = setupDataSource.getRecords();
        for (final DataRecord dataRecord : records) {
            setupDataSource.deleteRecord(dataRecord);
        }
        // delete scenario record
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(viewName, dataSourceId);
        dataSource.deleteRecord(record);
    }
    
    /**
     * Delete Factor version
     * 
     * @param record
     */
    public void deleteVersion(final DataRecord record) {
        
        final String versionType = record.getString("gb_fp_versions.version_type");
        final String versionName = record.getString("gb_fp_versions.version_name");
        
        Restriction restriction = null;
        if (versionType.equals("gb_fp_airc_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "airc_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "airc_version", versionName));
        } else if (versionType.equals("gb_fp_waste_liq_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "waste_liq_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "waste_liq_version", versionName));
        } else if (versionType.equals("gb_fp_refrig_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "refrig_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "refrig_version", versionName));
        } else if (versionType.equals("gb_fp_oxid_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "oxid_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "oxid_version", versionName));
        } else if (versionType.equals("gb_fp_mobile_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "mobile_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "mobile_version", versionName));
        } else if (versionType.equals("gb_fp_heat_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "heat_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "heat_version", versionName));
        } else if (versionType.equals("gb_fp_gwp_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "gwp_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "gwp_version", versionName));
        } else if (versionType.equals("gb_fp_fuel_dens_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "fuel_dens_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "fuel_dens_version", versionName));
        } else if (versionType.equals("gb_fp_emiss_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "emiss_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "emiss_version", versionName));
        } else if (versionType.equals("gb_fp_egrid_subregions")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "egrid_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "egrid_version", versionName));
        } else if (versionType.equals("gb_fp_comm_airc_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "comm_airc_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "comm_airc_version", versionName));
        } else if (versionType.equals("gb_fp_carbon_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "carbon_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "carbon_version", versionName));
        } else if (versionType.equals("gb_fp_waste_sol_data")) {
            restriction =
                    Restrictions.and(
                        Restrictions.eq("gb_fp_setup", "waste_sol_version_type", versionType),
                        Restrictions.eq("gb_fp_setup", "waste_sol_version", versionName));
        }
        String sqlQuery = "";
        // get setup record
        final DataSource dsSetup = DataSourceFactory.createDataSource();
        dsSetup.addTable("gb_fp_setup");
        dsSetup.addField("bl_id");
        dsSetup.addField("calc_year");
        dsSetup.addField("scenario_id");
        dsSetup.addRestriction(restriction);
        final List<DataRecord> recSetup = dsSetup.getRecords();
        final Iterator<DataRecord> it_setup = recSetup.iterator();
        
        while (it_setup.hasNext()) {
            final DataRecord setup = it_setup.next();
            final String bl_id = setup.getString("gb_fp_setup.bl_id");
            final String scenario_id = setup.getString("gb_fp_setup.scenario_id");
            final int calc_year = setup.getInt("gb_fp_setup.calc_year");
            // delete from gb_fp_totals
            sqlQuery =
                    "DELETE FROM gb_fp_totals WHERE gb_fp_totals.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_totals.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_totals.calc_year = " + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_totals", sqlQuery);
            
            // delete from gb_fp_s1_co_airc
            sqlQuery =
                    "DELETE FROM gb_fp_s1_co_airc WHERE gb_fp_s1_co_airc.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s1_co_airc.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s1_co_airc.calc_year = "
                            + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s1_co_airc", sqlQuery);
            
            // delete from gb_fp_s1_fuel_comb
            sqlQuery =
                    "DELETE FROM gb_fp_s1_fuel_comb WHERE gb_fp_s1_fuel_comb.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s1_fuel_comb.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s1_fuel_comb.calc_year = "
                            + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s1_fuel_comb", sqlQuery);
            
            // delete from gb_fp_s1_refrig_ac
            sqlQuery =
                    "DELETE FROM gb_fp_s1_refrig_ac WHERE gb_fp_s1_refrig_ac.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s1_refrig_ac.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s1_refrig_ac.calc_year = "
                            + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s1_refrig_ac", sqlQuery);
            
            // delete from gb_fp_s1_s3_mobile
            sqlQuery =
                    "DELETE FROM gb_fp_s1_s3_mobile WHERE gb_fp_s1_s3_mobile.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s1_s3_mobile.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s1_s3_mobile.calc_year = "
                            + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s1_s3_mobile", sqlQuery);
            
            // delete from gb_fp_s2_purch_e
            sqlQuery =
                    "DELETE FROM gb_fp_s2_purch_e WHERE gb_fp_s2_purch_e.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s2_purch_e.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s2_purch_e.calc_year = "
                            + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s2_purch_e", sqlQuery);
            
            // delete from gb_fp_s3_em_air
            sqlQuery =
                    "DELETE FROM gb_fp_s3_em_air WHERE gb_fp_s3_em_air.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s3_em_air.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s3_em_air.calc_year = "
                            + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s3_em_air", sqlQuery);
            
            // delete from gb_fp_s3_mat
            sqlQuery =
                    "DELETE FROM gb_fp_s3_mat WHERE gb_fp_s3_mat.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s3_mat.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id)
                            + "' AND gb_fp_s3_mat.calc_year = "
                            + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s3_mat", sqlQuery);
            
            // delete from gb_fp_s3_outs
            sqlQuery =
                    "DELETE FROM gb_fp_s3_outs WHERE gb_fp_s3_outs.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s3_outs.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s3_outs.calc_year = " + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s3_outs", sqlQuery);
            
            // delete from gb_fp_s3_serv
            sqlQuery =
                    "DELETE FROM gb_fp_s3_serv WHERE gb_fp_s3_serv.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s3_serv.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s3_serv.calc_year = " + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s3_serv", sqlQuery);
            
            // delete from gb_fp_s3_waste_liq
            sqlQuery =
                    "DELETE FROM gb_fp_s3_waste_liq WHERE gb_fp_s3_waste_liq.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s3_waste_liq.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s3_waste_liq.calc_year = "
                            + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s3_waste_liq", sqlQuery);
            
            // delete from gb_fp_s3_waste_sol
            sqlQuery =
                    "DELETE FROM gb_fp_s3_waste_sol WHERE gb_fp_s3_waste_sol.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s3_waste_sol.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s3_waste_sol.calc_year = "
                            + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s3_waste_sol", sqlQuery);
            
            // delete from gb_fp_s_other
            sqlQuery =
                    "DELETE FROM gb_fp_s_other WHERE gb_fp_s_other.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_s_other.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_s_other.calc_year = " + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_s_other", sqlQuery);
            
            // delete from gb_fp_setup
            sqlQuery =
                    "DELETE FROM gb_fp_setup WHERE gb_fp_setup.bl_id = '"
                            + SqlUtils.makeLiteralOrBlank(bl_id) + "' "
                            + "AND gb_fp_setup.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(scenario_id) + "' AND "
                            + "gb_fp_setup.calc_year = " + Integer.valueOf(calc_year).toString();
            
            SqlUtils.executeUpdate("gb_fp_setup", sqlQuery);
            
        }
        
        // delete other data
        if (versionType.equals("gb_fp_egrid_subregions")) {
            sqlQuery =
                    "DELETE FROM gb_fp_egrid_zip WHERE gb_fp_egrid_zip.version_type = '"
                            + SqlUtils.makeLiteralOrBlank(versionType) + "' "
                            + "AND gb_fp_egrid_zip.version_name = '"
                            + SqlUtils.makeLiteralOrBlank(versionName) + "'";
            
            SqlUtils.executeUpdate("gb_fp_egrid_zip", sqlQuery);
            
            sqlQuery =
                    "DELETE FROM gb_fp_egrid_subregions WHERE gb_fp_egrid_subregions.version_type = '"
                            + SqlUtils.makeLiteralOrBlank(versionType) + "' "
                            + "AND gb_fp_egrid_subregions.version_name = '"
                            + SqlUtils.makeLiteralOrBlank(versionName) + "'";
            
            SqlUtils.executeUpdate("gb_fp_egrid_subregions", sqlQuery);
        } else {
            sqlQuery =
                    "DELETE FROM " + versionType + " WHERE " + versionType + ".version_type = '"
                            + SqlUtils.makeLiteralOrBlank(versionType) + "' " + "AND "
                            + versionType + ".version_name = '"
                            + SqlUtils.makeLiteralOrBlank(versionName) + "'";
            
            SqlUtils.executeUpdate(versionType, sqlQuery);
        }
        
        // delete version record
        sqlQuery =
                "DELETE FROM gb_fp_versions WHERE gb_fp_versions.version_type = '"
                        + SqlUtils.makeLiteralOrBlank(versionType) + "' "
                        + "AND gb_fp_versions.version_name = '"
                        + SqlUtils.makeLiteralOrBlank(versionName) + "'";
        
        SqlUtils.executeUpdate("gb_fp_versions", sqlQuery);
        
        // execute commit
        SqlUtils.commit();
    }
    
    /**
     * WFR - called to export XLS report
     * 
     * @param reportViewName
     * @param dataSourceId
     * @param reportTitle
     * @param visibleFieldDefs
     * @param restriction
     * @param parameters
     * @param isPerArea
     * @param isAtTheBottom
     */
    public void generateGridXLSReport(final String reportViewName, final String dataSourceId,
            final String reportTitle, final List<Map<String, Object>> visibleFieldDefs,
            final String restriction, final Map<String, Object> parameters,
            final boolean isPerArea, final boolean isAtTheBottom, final String areaExtFieldName) {
        try {
            this.status.setTotalNumber(100);
            this.status.setCurrentNumber(0);
            
            final DataSource dataSource =
                    DataSourceFactory.loadDataSourceFromFile(reportViewName, dataSourceId);
            if (parameters != null) {
                ReportUtility.handleParameters(dataSource, parameters);
            }
            final List<DataRecord> records = dataSource.getRecords(restriction);
            
            this.status.setCurrentNumber(50);
            final GbGridXLSBuilder reportBuilder = new GbGridXLSBuilder();
            reportBuilder.setPerArea(isPerArea);
            reportBuilder.setAtTheBottom(isAtTheBottom);
            reportBuilder.setAreaExtFieldName(areaExtFieldName);
            
            reportBuilder.setFileName(reportBuilder.createFileName(reportViewName));
            
            reportBuilder.build(records, reportTitle, visibleFieldDefs);
            
            final String fileName = reportBuilder.getFileName();
            final String url = reportBuilder.getURL();
            final JobResult result = new JobResult(reportTitle, fileName, url);
            this.status.setResult(result);
            
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setCurrentNumber(100);
        } catch (final Exception e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(String.format(
                "Fail to export a XLS report with a view name [%s]", reportViewName), e);
        }
    }
    
    /**
     * Custom export to XLS WFR for Footprint by Source Detail report
     * 
     * @param reportViewName
     * @param reportTitle
     * @param visibleFieldDefs
     * @param parameters
     * @param isPerArea
     * @param isAtTheBottom
     * @param areaExtFieldName
     */
    public void exportFootprintBySourceDetail(final String reportViewName,
            final String reportTitle, final List<Map<String, Object>> visibleFieldDefs,
            final JSONObject parameters) {
        try {
            this.status.setTotalNumber(100);
            this.status.setCurrentNumber(0);
            
            final FootprintReporting reportingHandler = new FootprintReporting();
            final List<DataRecord> records =
                    reportingHandler.getScopesData(parameters).getRecords();
            
            this.status.setCurrentNumber(50);
            
            final GbGridXLSBuilder reportBuilder = new GbGridXLSBuilder();
            reportBuilder.setLastRowTotal(true);
            reportBuilder.setFileName(reportBuilder.createFileName(reportViewName));
            
            reportBuilder.build(records, reportTitle, visibleFieldDefs);
            
            final String fileName = reportBuilder.getFileName();
            final String url = reportBuilder.getURL();
            final JobResult result = new JobResult(reportTitle, fileName, url);
            this.status.setResult(result);
            
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setCurrentNumber(100);
        } catch (final Exception e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(String.format(
                "Fail to export a XLS report with the view name [%s]", reportViewName), e);
        }
    }
}
