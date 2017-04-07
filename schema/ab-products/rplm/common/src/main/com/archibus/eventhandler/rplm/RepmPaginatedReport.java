package com.archibus.eventhandler.rplm;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;

import org.json.*;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.DataSourceImpl.Parameter;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.ExceptionBase;

/**
 * Generate complex paginated report assembling paginated report parts into one file.
 * 
 * @author Ioan Draghici
 * 
 */
public class RepmPaginatedReport extends JobBase {
    
    /**
     * view data source - when is called from overview page.
     */
    private DataSource dataSource = null;
    
    /**
     * Report configuration object.
     */
    private JSONObject reportConfig = null;
    
    /**
     * Report title.
     */
    private String reportTitle = "";
    
    /**
     * Report file name.
     */
    private String reportFileName = "";
    
    /**
     * Report date - formated as string.
     */
    private String dateString = "";
    
    /**
     * counter.
     */
    private int counter = 0;
    
    /**
     * List with partial report files.
     */
    private List<String> reportFiles = null;
    
    /**
     * List with permanent restriction.
     */
    private final List<Restriction> permanentRestriction = new ArrayList<Restriction>();
    
    /**
     * Constructor.
     * 
     * @param objDataSource - data source object
     * @param rptConfig - report configuration object
     */
    public RepmPaginatedReport(final DataSource objDataSource, final JSONObject rptConfig) {
        this.dataSource = objDataSource;
        this.reportConfig = rptConfig;
        this.reportTitle = this.reportConfig.getString("title");
        this.reportFileName = this.reportConfig.getString("fileName");
        final Date currentDate = new Date();
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyMMddHHmmss");
        this.dateString = dateFormat.format(currentDate);
        this.reportFiles = new ArrayList<String>();
    }
    
    @Override
    public void run() {
        
        // clone data source permanent restriction
        copyDatasourceRestriction();
        
        final PaginatedReportsBuilder builder = new PaginatedReportsBuilder();
        final Context context = ContextStore.get();
        final JSONArray files = (JSONArray) this.reportConfig.get("files");
        boolean printRestriction = false;
        List<Map<String, Object>> printableRestriction = null;
        if (this.reportConfig.has("printableRestriction")) {
            printableRestriction =
                    EventHandlerBase.fromJSONArray((JSONArray) this.reportConfig
                        .get("printableRestriction"));
        }
        if (printableRestriction != null && !printableRestriction.isEmpty()) {
            printRestriction = true;
        }
        
        this.counter = 0;
        
        final String mainFileName = this.reportFileName + "-" + this.dateString + ".docx";
        final String finalFileFullname =
                ReportUtility.getReportFilesStorePath(context) + mainFileName;
        
        this.status.setResult(new JobResult(this.reportTitle, mainFileName, context
            .getContextPath() + ReportUtility.getPerUserReportFilesPath(context) + mainFileName));
        
        long jobProgress = Integer.parseInt("20") + files.length();
        this.status.setTotalNumber(jobProgress);
        
        JSONObject dataSourceParameters = new JSONObject();
        if (this.reportConfig.has("dataSourceParameters")) {
            dataSourceParameters = this.reportConfig.getJSONObject("dataSourceParameters");
        }
        
        for (int i = 0; i < files.length(); i++) {
            if (this.status.isStopRequested()) {
                break;
            }
            final JSONObject file = files.getJSONObject(i);
            // clear restriction
            this.dataSource.clearRestrictions();
            this.dataSource.setMaxRecords(0);
            
            // add permanent restriction
            for (final Restriction permRestr : this.permanentRestriction) {
                this.dataSource.addRestriction(permRestr);
            }
            
            final Map<String, Parameter> parameters = this.dataSource.getParameters();
            final Iterator<String> keys = parameters.keySet().iterator();
            while (keys.hasNext()) {
                final String key = keys.next();
                final Parameter param = parameters.get(key);
                if (dataSourceParameters.has(param.name)) {
                    this.dataSource.addParameter(param.name,
                        dataSourceParameters.getString(param.name), param.dataType);
                }
            }
            
            if (file.has("fileRestriction") && !file.isNull("fileRestriction")) {
                addRestrictions(file.getJSONObject("fileRestriction"));
            }
            
            final String fieldName = file.getString("fieldRestriction");
            final String sortTable = fieldName.substring(0, fieldName.indexOf('.'));
            final String sortField = fieldName.substring(fieldName.indexOf('.') + 1);
            this.dataSource.addSort(sortTable, sortField, DataSource.SORT_ASC);
            final List<DataRecord> records = this.dataSource.getRecords();
            
            jobProgress = jobProgress + records.size() - files.length();
            this.status.setTotalNumber(jobProgress);
            
            Object crtValue = null;
            for (final DataRecord record : records) {
                if ((record.getValue(fieldName) != null && (crtValue == null || !record.getValue(
                    fieldName).equals(crtValue)))
                        || (record.getValue(fieldName) == null && crtValue != null)) {
                    
                    // create parent band report
                    createReportPart(context, builder, record, file, printRestriction,
                        printableRestriction);
                    // remove printable restriction
                    if (printRestriction) {
                        printRestriction = false;
                    }
                    
                    crtValue = record.getValue(fieldName);
                }
                if (file.has("files") && !file.isNull("files")) {
                    final JSONArray childs = file.getJSONArray("files");
                    // generate child reports
                    for (int j = 0; j < childs.length(); j++) {
                        final JSONObject child = childs.getJSONObject(j);
                        createReportPart(context, builder, record, child, printRestriction,
                            printableRestriction);
                    }
                }
            }
        }
        if (this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            if (this.reportFiles.size() > 0) {
                // merging files into one file
                ReportUtility.appendDocxFiles(this.reportFiles, finalFileFullname);
                
                deletePartialFiles();
                this.status.setCurrentNumber(jobProgress);
            }
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
    
    /**
     * Clone restriction object.
     * 
     * @param original - current restriction object.
     * @return copy of original restriction object.
     */
    public Restriction cloneRestriction(final Restriction original) {
        Restriction copy = null;
        final String cloneRelOp = original.relOp;
        if (original.type.equals(Restriction.RESTRICTION_TYPE_PARSED)) {
            final List<Clause> cloneClauses = new ArrayList<Clause>();
            for (final Clause clause : original.clauses) {
                final Clause cloneClause =
                        new Clause(clause.table, clause.name, clause.value, clause.op, clause.relOp);
                cloneClauses.add(cloneClause);
            }
            copy = new Restriction(cloneRelOp, cloneClauses);
        }
        if (original.type.equals(Restriction.RESTRICTION_TYPE_SQL)) {
            copy = new Restriction(original.sql);
        }
        return copy;
    }
    
    /**
     * Delete intermediary files to save space on hdd.
     */
    private void deletePartialFiles() {
        // delete partial results to save space on hd
        for (final String fullPath : this.reportFiles) {
            final File crtFile = new File(fullPath);
            if (crtFile.exists()) {
                try {
                    crtFile.delete();
                } catch (final ExceptionBase originalException) {
                    throw originalException;
                }
            }
        }
    }
    
    /**
     * Copy datasource restriction.
     */
    private void copyDatasourceRestriction() {
        for (final Restriction restriction : this.dataSource.getRestrictions()) {
            final Restriction clone = cloneRestriction(restriction);
            this.permanentRestriction.add(clone);
        }
    }
    
    /**
     * Generate partial report from axvw report def.
     * 
     * @param context - job context
     * @param builder - report builder
     * @param record - current record
     * @param fileConfig - current file configuration object
     * @param printRestriction - if restriction is shown or not, boolean
     * @param printableRestriction - current restriction, printable (localized) format
     */
    private void createReportPart(final Context context, final PaginatedReportsBuilder builder,
            final DataRecord record, final JSONObject fileConfig, final boolean printRestriction,
            final List<Map<String, Object>> printableRestriction) {
        
        this.status.setCurrentNumber(this.counter);
        final Map<String, Object> paramRestriction = getRestrictionParameters(record, fileConfig);
        final com.archibus.ext.report.docx.Report report =
                new com.archibus.ext.report.docx.Report();
        report.setTitle(this.reportTitle);
        report.setFilename(this.reportFileName + "-" + this.counter + "-" + this.dateString
                + ".docx");
        // print user restriction
        if (printRestriction) {
            report.setPrintRestriction(printRestriction);
            report.setPrintableRestriction(printableRestriction);
        }
        if (!paramRestriction.isEmpty()) {
            report.setPatameters(paramRestriction);
        }
        final String viewName = fileConfig.getString("fileName");
        builder.buildDocxFromView(context, report, viewName, null);
        this.reportFiles.add(report.getFileFullName());
        this.counter++;
    }
    
    /**
     * Get restriction parameter from config object.
     * 
     * @param record - data record
     * @param fileConfig - report config object
     * @return paramRestriction - Map<String, Object>
     */
    private Map<String, Object> getRestrictionParameters(final DataRecord record,
            final JSONObject fileConfig) {
        final Map<String, Object> paramRestriction = new HashMap<String, Object>();
        final JSONArray parameters =
                fileConfig.getJSONObject("reportRestriction").getJSONArray("parameters");
        for (int i = 0; i < parameters.length(); i++) {
            final JSONObject param = parameters.getJSONObject(i);
            final String name = param.getString("name");
            final String type = param.getString("type");
            Object value = param.get("value");
            if (String.valueOf("value").equals(type)) {
                value = record.getValue(value.toString());
            }
            paramRestriction.put(name, value);
        }
        return paramRestriction;
    }
    
    /**
     * Add JSON restriction object to datasource.
     * 
     * @param jsonRestriction - JSON restriction object
     */
    private void addRestrictions(final JSONObject jsonRestriction) {
        
        final List<Clause> clauses = new ArrayList<Clause>();
        
        if (jsonRestriction.has("permanent") && !jsonRestriction.isNull("permanent")) {
            final Object permanentRestr = jsonRestriction.get("permanent");
            if (permanentRestr.getClass().getName().equals("java.lang.String")) {
                this.dataSource.addRestriction(Restrictions.sql(permanentRestr.toString()));
            } else {
                addClauses(clauses, (JSONObject) permanentRestr);
            }
        }
        
        if (jsonRestriction.has("temporary") && !jsonRestriction.isNull("temporary")) {
            final Object temporaryRestr = jsonRestriction.get("temporary");
            if (temporaryRestr.getClass().getName().equals("java.lang.String")) {
                this.dataSource.addRestriction(Restrictions.sql(temporaryRestr.toString()));
            } else {
                addClauses(clauses, (JSONObject) temporaryRestr);
            }
        }
        
        if (!clauses.isEmpty()) {
            final Restriction restriction = new Restriction("AND", clauses);
            this.dataSource.addRestriction(restriction);
        }
        
        if (jsonRestriction.has("parameters") && !jsonRestriction.isNull("parameters")) {
            final JSONObject jsonParameters = jsonRestriction.getJSONObject("parameters");
            for (final Iterator<String> keys = jsonParameters.keys(); keys.hasNext();) {
                final String param = keys.next();
                final String value = jsonParameters.getString(param);
                this.dataSource.setParameter(param, value);
            }
            
        }
    }
    
    /**
     * Add clauses to JSON restriction object.
     * 
     * @param clauses - list of clauses that will be added
     * @param objRestriction - JSON restriction object
     */
    private void addClauses(final List<Clause> clauses, final JSONObject objRestriction) {
        final JSONArray jsonClauses = objRestriction.getJSONArray("clauses");
        for (int i = 0; i < jsonClauses.length(); i++) {
            final JSONObject jsonClause = jsonClauses.getJSONObject(i);
            String name = jsonClause.getString("name");
            final String table = name.substring(0, name.indexOf('.'));
            name = name.substring(name.indexOf('.') + 1);
            final String op = jsonClause.getString("op");
            final String relOp = jsonClause.getString("relOp");
            String value = jsonClause.getString("value");
            if (op.equals(Restrictions.OP_IN)) {
                final JSONArray jsValue = jsonClause.getJSONArray("value");
                final StringBuffer buffer = new StringBuffer();
                for (int j = 0; j < jsValue.length(); j++) {
                    buffer.append(jsValue.getString(j) + (j < jsValue.length() - 1 ? "," : ""));
                }
                value = buffer.toString();
            }
            final Clause clause = new Clause(table, name, value, op, relOp);
            clauses.add(clause);
        }
    }
}
