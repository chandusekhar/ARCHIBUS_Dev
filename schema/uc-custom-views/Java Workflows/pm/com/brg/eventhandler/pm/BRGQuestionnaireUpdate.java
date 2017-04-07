package com.brg.eventhandler.pm;

import java.io.*;
import java.text.*;
import java.util.*;

import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.commons.lang.ArrayUtils;
import org.json.JSONArray;
import org.w3c.dom.*;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.ReportUtility;
import com.archibus.ext.report.docx.DocxUtility;
import com.archibus.utility.*;
import com.aspose.cells.*;
import com.aspose.words.Table;

public class BRGQuestionnaireUpdate extends EventHandlerBase {
    private static final String ASPOSE_CELLS_LIC_FILE_NAME = "aspose.cells.lic";

    private static final String REPORTS_CELLLS_PATH = "/context/reports/xls/";

    private static final String QA_SEPARATOR = " - ";

    private static final List<String> COND_VALUE_LIST = Arrays.asList(new String[] { "Not Entered",
            "Very Good", "Good", "Fair", "Poor", "Unacceptable" });

    private static final List<String> UC_FIM_LIST = Arrays.asList(new String[] { "Not Entered",
            "No", "Yes" });

    private static final List<String> COND_PRIIORITY_LIST = Arrays.asList(new String[] {
            "Not Entered", "Maintain", "Company Image", "Def. Renovation", "Cost Effective",
            "Delayed Priority", "Mission Support", "Environ. Code", "Facility Loss",
            "Code Compliance", "Life Safety" });

    private static final List<String> REC_ACTION_LIST = Arrays.asList(new String[] { "No Action",
            "Clean", "Adjust", "Remove", "Repair", "Replace" });

    public void addDuplicateQuestions(final DataRecord newRec, final String oldQ) {
        // save the new questionnaire record
        final String[] fields =
            { "description", "field_name", "questionnaire_id", "table_name", "title" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields("questionnaire", fields);
        ds.saveRecord(newRec);

        // copy the corresponding questions to the new questionnaire
        final String newQ = newRec.getString("questionnaire.questionnaire_id");
        String insertSql =
                "INSERT INTO questions (questionnaire_id,action_response,activity_type,enum_list,format_type,freeform_width,  is_active,is_required,lookup_field,lookup_table,quest_name,quest_text,sort_order)   SELECT '";
        insertSql +=
                newQ
                + "',action_response,activity_type,enum_list,format_type,freeform_width,is_active,is_required,lookup_field,lookup_table,quest_name,quest_text,sort_order  FROM questions  WHERE questionnaire_id = '";
        insertSql += oldQ + "'";
        SqlUtils.executeUpdate("questions", insertSql);

    }

    // called by wfr to export questionnaires based on sql processing
    public String getQXLS(final String restriction, final int maxq) {
        return getXMLLink("brg-comm-project-report-ds", "ds70", restriction, maxq);

    }

    private String getXMLLink(final String viewName, final String dsName, final String restriction,
            final int maxNbQuestions) {

        final DataSource ds = DataSourceFactory.loadDataSourceFromFile(viewName, dsName);
        final List<DataRecord> records = ds.getRecords(restriction);
        final List<Map<String, Object>> visibleFields = getVisibleFields(maxNbQuestions);
        final com.archibus.ext.report.xls.GridBuilder reportBuilder =
                new com.archibus.ext.report.xls.GridBuilder();

        reportBuilder.build(records, "Project Commissioning Report", visibleFields);
        reportBuilder.getFileName();
        final String url = reportBuilder.getURL();

        return url;
    }

    private List<Map<String, Object>> getVisibleFields(final int maxNbQuestions) {
        String fields =
                "[{id:'activity_log.assessed_by',title:'Assessed By',isNumeric:false},"
                        + "{id:'activity_log.project_id',title:'Project Code', isNumeric:false},"
                        + "{id:'activity_log.description',title:'Description',isNumeric:false},"
                        + "{id:'activity_log.site_id',title:'Site Code', isNumeric:false},"
                        + "{id:'activity_log.bl_id',title:'Building Code',isNumeric:false},"
                        + "{id:'activity_log.status',title:'Status',isNumeric:false},"
                        + "{id:'activity_log.eq_id',title:'Equipment Code',isNumeric:false},"
                        + "{id:'activity_log.comments',title:'Equipment Description',isNumeric:false},"
                        + "{id:'activity_log.cost_cat_id',title:'Equipment Standard',isNumeric:false},"
                        + "{id:'activity_log.date_assessed',title:'Data Assessed',isNumeric:false},"
                        + "{id:'activity_log.cond_priority',title:'Condition Priority',isNumeric:false},"
                        + "{id:'activity_log.cond_value',title:'Condition Value',isNumeric:false},"
                        + "{id:'activity_log.rec_action',title:'Recommended Action',isNumeric:false},"
                        + "{id:'activity_log.cost_fim',title:'Cost of FIM',isNumeric:true},"
                        + "{id:'activity_log.cost_annual_save',title:'Annual Saving',isNumeric:true},"
                        + "{id:'activity_log.cost_payback',title:'Payback Period',isNumeric:true},"
                        + "{id:'activity_log.uc_fim',title:'Facility Improvement Measure(FIM)',isNumeric:false}";
        List<Map<String, Object>> visibleFields = null;
        for (int i = 1; i <= maxNbQuestions; i++) {
            fields += ",{id:'activity_log.q" + i + "',title:'Question" + i + "',isNumeric:false}";

        }
        fields += "]";
        try {
            visibleFields = EventHandlerBase.fromJSONArray(new JSONArray(fields));
        } catch (final ParseException e) {

        }
        return visibleFields;
    }

    // called by wfr in charge with exporting records and xml questionnaire to excel
    public String getXMLQReport(final String restriction, final int maxq) {
        final String path =
                getXMLQReportAspose("brg-comm-project-report", "ds0", restriction, maxq);
        return path;

    }

    private String getXMLQReportAspose(final String viewName, final String dsName,
            final String restriction, final int maxq) {
        final DataSource ds = DataSourceFactory.loadDataSourceFromFile(viewName, dsName);
        final List<DataRecord> records = ds.getRecords(restriction);
        final Iterator<DataRecord> it = records.iterator();
        while (it.hasNext()) {
            final DataRecord dr = it.next();
            final String actQuest = dr.getString("activity_log.act_quest");
            final List<DataRecordField> drfList = getQList(actQuest, maxq);
            dr.setFieldValues(drfList);
        }
        final Object[][] recordsArray = getRecordsArray(records, maxq);
        final String url = writeObjectArrayToXls(recordsArray);

        return url;
    }

    private Object[][] getRecordsArray(final List<DataRecord> records, final int maxq) {
        final String[] exportFields = getExportFields(maxq);
        final String[] headerRow = getHeaderRow(exportFields.length);
        final Object[][] dataArray = getDataArray(records, exportFields);
        final Object[][] recordsArray = new Object[records.size() + 1][exportFields.length];
        recordsArray[0] = headerRow;
        for (int i = 0; i < dataArray.length; i++) {
            recordsArray[i + 1] = dataArray[i];
        }
        return recordsArray;
    }

    private Object[][] getDataArray(final List<DataRecord> records, final String[] exportFields) {
        final Object[][] dataArray = new Object[records.size()][exportFields.length];
        for (int i = 0; i < records.size(); i++) {
            dataArray[i] = getArrayForRecord(records.get(i), exportFields);

        }
        return dataArray;
    }

    private Object[] getArrayForRecord(final DataRecord rec, final String[] exportFields) {
        final Object[] recordArray = new Object[exportFields.length];

        final List<String> enumListFields =
                Arrays.asList("activity_log.cond_value", "activity_log.uc_fim",
                    "activity_log.cond_priority", "activity_log.rec_action");
        for (int i = 0; i < exportFields.length; i++) {
            final String field = exportFields[i];
            Object value = rec.getValue(field);
            if (enumListFields.contains(field) && value != null) {
                if ("activity_log.cond_value".equals(field)) {
                    value =
                            BRGQuestionnaireUpdate.COND_VALUE_LIST.get(Integer.parseInt(value
                                .toString()));
                }
                if ("activity_log.uc_fim".equals(field)) {
                    value =
                            BRGQuestionnaireUpdate.UC_FIM_LIST.get(Integer.parseInt(value
                                .toString()));
                }
                if ("activity_log.cond_priority".equals(field)) {
                    value =
                            BRGQuestionnaireUpdate.COND_PRIIORITY_LIST.get(Integer.parseInt(value
                                .toString()));
                }
                if ("activity_log.rec_action".equals(field)) {
                    value =
                            BRGQuestionnaireUpdate.REC_ACTION_LIST.get(Integer.parseInt(value
                                .toString()));
                }

            }
            recordArray[i] = value;
        }
        return recordArray;
    }

    private String[] getHeaderRow(final int length) {
        final String[] baseFieldsHeaders =
            { "Assessed By", "Project Code", "Description", "Site Code", "Building Code",
                "Status", "Equipment Code", "Equipment Description", "Equipment Standard",
                "Data Assessed", "Condition Priority", "Condition Value",
                "Recommended Action", "Cost of FIM", "Annual Saving", "Payback Period",
            "Facility Improvement Measure(FIM)" };
        final int qFiledsNb = length - baseFieldsHeaders.length;
        final String[] qFieldsHeaders = new String[length - baseFieldsHeaders.length];
        for (int i = 1; i <= qFiledsNb; i++) {
            qFieldsHeaders[i - 1] = "Question " + i;
        }
        final String[] joinedArray =
                (String[]) ArrayUtils.addAll(baseFieldsHeaders, qFieldsHeaders);
        return joinedArray;
    }

    private String[] getExportFields(final int maxq) {
        final String[] baseFields =
            { "activity_log.assessed_by", "activity_log.project_id",
                "activity_log.description", "activity_log.site_id", "activity_log.bl_id",
                "activity_log.status", "activity_log.eq_id", "activity_log.comments",
                "activity_log.cost_cat_id", "activity_log.date_assessed",
                "activity_log.cond_priority", "activity_log.cond_value",
                "activity_log.rec_action", "activity_log.cost_fim",
                "activity_log.cost_annual_save", "activity_log.cost_payback",
            "activity_log.uc_fim" };
        final String[] qFields = new String[maxq];
        for (int i = 1; i <= maxq; i++) {
            qFields[i - 1] = "q" + i;
        }
        final String[] joinedArray = (String[]) ArrayUtils.addAll(baseFields, qFields);
        return joinedArray;
    }

    private List<DataRecordField> getQList(final String actQuest, final int maxq) {
        List<DataRecordField> drfList = new ArrayList<DataRecordField>();
        if (StringUtil.notNullOrEmpty(actQuest)) {
            Node node;
            try {
                node = convertNodesFromXml(actQuest);
                drfList = createDRFListForNode(node, maxq);
            } catch (final Exception e) {
                this.log.debug("Error while parsing xml node");
            }

        } else {
            for (int i = 1; i <= maxq; i++) {
                final DataRecordField drf = new DataRecordField();
                drf.setName("q" + i);
                drf.setValue("");
                drfList.add(drf);
            }
        }

        return drfList;
    }

    private Node convertNodesFromXml(final String xml) throws Exception {
        final InputStream is = new ByteArrayInputStream(xml.getBytes());
        final DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setNamespaceAware(false);
        final javax.xml.parsers.DocumentBuilder db = dbf.newDocumentBuilder();
        final Document document = db.parse(is);
        return document.getDocumentElement();
    }

    private List<DataRecordField> createDRFListForNode(final Node node, final int maxq) {
        new HashMap<String, String>();
        final NodeList nodeList = node.getChildNodes();
        final List<DataRecordField> drfList = new ArrayList<DataRecordField>();
        for (int i = 1; i <= maxq; i++) {
            final Node currentNode = nodeList.item(i - 1);
            if ((currentNode != null) && currentNode.hasAttributes()) {
                final Node question = currentNode.getAttributes().getNamedItem("quest_name");
                final Node answer = currentNode.getAttributes().getNamedItem("value");
                final DataRecordField drf = new DataRecordField();
                drf.setName("q" + i);
                drf.setValue(question.getNodeValue() + QA_SEPARATOR + answer.getNodeValue());
                drfList.add(drf);
            } else {
                final DataRecordField drf = new DataRecordField();
                drf.setName("q" + i);
                drf.setValue("");
                drfList.add(drf);
            }
        }
        return drfList;
    }

    private String writeObjectArrayToXls(final Object[][] records) {
        loadCellsLibraryLicense();
        final Context cnt = ContextStore.get();

        final String fileName = getFileName("xls");
        String path = cnt.getWebAppPath() + ReportUtility.getPerUserReportFilesPath(cnt);
        path += fileName;

        final Workbook workbook = new Workbook();
        final Cells cells = workbook.getWorksheets().get("Sheet1").getCells();
        cells.importTwoDimensionArray(records, 0, 0);
        try {
            workbook.save(path);
        } catch (final Exception e) {
            this.log.error(e.getMessage());
            throw new ExceptionBase(e.getLocalizedMessage(), e);
        }
        final String url =
                ReportUtility.getFileURL(cnt, ReportUtility.getPerUserReportFilesPath(cnt),
                    fileName);
        return url;
    }

    private String getFileName(final String ext) {
        final Calendar calendar = Calendar.getInstance();
        final Format formatter = new SimpleDateFormat("yyyy_MM_dd");
        final String date = formatter.format(calendar.getTime());
        final String fileName =
                "projectcommissioningreport-" + date + System.currentTimeMillis() / 1000l + "."
                        + ext;
        return fileName;
    }

    private void loadCellsLibraryLicense() {
        final String licenseFilePath =
                ReportUtility.getConfigPath() + REPORTS_CELLLS_PATH + ASPOSE_CELLS_LIC_FILE_NAME;
        loadCellsLibraryLicense(licenseFilePath);
    }

    private void loadCellsLibraryLicense(final String licenseFilePath) {
        try {
            final com.aspose.cells.License license = new com.aspose.cells.License();
            license.setLicense(new FileInputStream(licenseFilePath));
        } catch (final Exception e) {
            throw new ExceptionBase(String.format(
                "Failed to load Aspose.cells license from license file=[%s]", licenseFilePath), e);
        }
    }

    // called by wfr to export paginated report questionnaires based on sql processing
    public String getPagReport(final String restriction, final int maxq) {
        return pagRepLink("brg-comm-project-report", "ds1", restriction, maxq);
    }

    private String pagRepLink(final String viewName, final String dsName, final String restriction,
            final int maxq) {
        final DataSource ds = DataSourceFactory.loadDataSourceFromFile(viewName, dsName);
        final List<DataRecord> records = ds.getRecords(restriction);
        final Iterator<DataRecord> it = records.iterator();
        while (it.hasNext()) {
            final DataRecord dr = it.next();
            final String actQuest = dr.getString("activity_log.act_quest");
            final List<DataRecordField> drfList = getQList(actQuest, maxq);
            dr.setFieldValues(drfList);
        }
        final String url = writeRecordsToDocx(records, maxq);
        return url;
    }

    private String writeRecordsToDocx(final List<DataRecord> records, final int maxq) {
        DocxUtility.loadDocxLibraryLicense();
        final Context cnt = ContextStore.get();
        final String templatePath = ReportUtility.getTemplateFilePath() + "brg-pag-report.doc";
        final String fileName = getFileName("docx");
        final String exportPath =
                cnt.getWebAppPath() + ReportUtility.getPerUserReportFilesPath(cnt) + fileName;
        try {
            final com.aspose.words.Document doc = new com.aspose.words.Document(templatePath);
            doc.getFirstSection().getPageSetup().setRestartPageNumbering(true);
            setFooter(doc);
            com.aspose.words.Table table1 =
                    (com.aspose.words.Table) doc.getChild(com.aspose.words.NodeType.TABLE, 0, true);
            com.aspose.words.Table clonedTable1 = (Table) table1.deepClone(true);
            com.aspose.words.Table table2 =
                    (com.aspose.words.Table) doc.getChild(com.aspose.words.NodeType.TABLE, 1, true);
            com.aspose.words.Table clonedTable2 = (Table) table2.deepClone(true);
            for (int i = 0; i < records.size(); i++) {
                final DataRecord dr = records.get(i);
                if (i != 0) {
                    doc.getLastSection().getBody().appendChild(new com.aspose.words.Paragraph(doc));
                    doc.getLastSection().getBody().appendChild(clonedTable1);
                    doc.getLastSection().getBody().appendChild(new com.aspose.words.Paragraph(doc));
                    doc.getLastSection().getBody().appendChild(clonedTable2);
                    doc.getLastSection().getBody().appendChild(new com.aspose.words.Paragraph(doc));
                    table1 = clonedTable1;
                    clonedTable1 = (Table) table1.deepClone(true);
                    table2 = clonedTable2;
                    clonedTable2 = (Table) table2.deepClone(true);
                }

                fillProjectTable(table1, dr, doc);
                fillActivityLogTable(table2, dr, doc);
                if (dr.findField("q1") != null && dr.getString("q1").length() > 0) {
                    fillQuestionsTable(dr, doc, maxq);
                }
            }

            doc.save(exportPath);
        } catch (final Exception e) {
            this.log.error(e);
        }
        final String url =
                ReportUtility.getFileURL(cnt, ReportUtility.getPerUserReportFilesPath(cnt),
                    fileName);
        return url;
    }

    private void setFooter(final com.aspose.words.Document doc) {
        final Calendar calendar = Calendar.getInstance();
        final Format formatter = new SimpleDateFormat("yyyy-MM-dd");
        final String date = formatter.format(calendar.getTime());

        final com.aspose.words.DocumentBuilder builder = new com.aspose.words.DocumentBuilder(doc);
        builder.moveToHeaderFooter(com.aspose.words.HeaderFooterType.FOOTER_PRIMARY);
        builder.startTable();
        builder.getCellFormat().clearFormatting();
        builder.insertCell();
        builder.getCellFormat().setPreferredWidth(
            com.aspose.words.PreferredWidth.fromPercent(100 / 3));
        builder.write("Page ");
        builder.insertField("PAGE", "");
        builder.write(" of ");
        builder.insertField("NUMPAGES", "");
        builder.getCurrentParagraph().getParagraphFormat()
        .setAlignment(com.aspose.words.ParagraphAlignment.LEFT);
        builder.insertCell();
        builder.getCellFormat().setPreferredWidth(
            com.aspose.words.PreferredWidth.fromPercent(100 * 2 / 3));
        builder.write("University of Calgary - " + date);
        builder.getCurrentParagraph().getParagraphFormat()
        .setAlignment(com.aspose.words.ParagraphAlignment.RIGHT);
        builder.endRow();
        builder.endTable();
        builder.moveToDocumentEnd();
    }

    private void fillQuestionsTable(final DataRecord dr, final com.aspose.words.Document doc,
            final int maxq) {
        final com.aspose.words.Table table = new com.aspose.words.Table(doc);
        doc.getLastSection().getBody().appendChild(table);
        for (int i = 1; i <= maxq; i++) {
            final String qaStr = dr.getString("q" + i);
            if (StringUtil.notNullOrEmpty(qaStr)) {
                final String[] qa = qaStr.split(QA_SEPARATOR);
                if (qa.length > 0) {
                    final com.aspose.words.Row row = new com.aspose.words.Row(doc);
                    row.getRowFormat().setAllowBreakAcrossPages(true);
                    table.appendChild(row);
                    final com.aspose.words.Cell cellq = new com.aspose.words.Cell(doc);
                    cellq.appendChild(new com.aspose.words.Paragraph(doc));
                    final com.aspose.words.Paragraph firstParagraph = cellq.getFirstParagraph();
                    firstParagraph.appendChild(new com.aspose.words.Run(doc, qa[0]));
                    final com.aspose.words.ParagraphFormat pf = firstParagraph.getParagraphFormat();
                    pf.setAlignment(com.aspose.words.ParagraphAlignment.RIGHT);
                    row.appendChild(cellq);
                    final com.aspose.words.Cell cella = new com.aspose.words.Cell(doc);
                    if (qa.length != 1) {
                        cella.appendChild(new com.aspose.words.Paragraph(doc));
                        cella.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, qa[1]));
                        row.appendChild(cella);
                    } else {
                        cella.appendChild(new com.aspose.words.Paragraph(doc));
                        cella.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, ""));
                        row.appendChild(cella);
                    }

                }
            }
        }
        table.setLeftIndent(13.5);
        table.setAllowAutoFit(false);
    }

    private void fillActivityLogTable(final Table table, final DataRecord dr,
            final com.aspose.words.Document doc) {
        final String eqId = notNull(dr.getString("activity_log.eq_id"));
        final String eqStd = notNull(dr.getString("activity_log.cost_cat_id"));
        final String siteId = notNull(dr.getString("activity_log.site_id"));
        final String blId = notNull(dr.getString("activity_log.bl_id"));
        final String flId = notNull(dr.getString("activity_log.fl_id"));
        final String rmId = notNull(dr.getString("activity_log.rm_id"));
        final String assessedBy = notNull(dr.getString("activity_log.assessed_by"));
        final Date dateAssessed = dr.getDate("activity_log.date_assessed");
        final String dateAssessStr = dateAssessed == null ? "" : dateAssessed.toString();
        final Integer condPriority = dr.getInt("activity_log.cond_priority");
        final String condPriorityStr = StringUtil.notNull(COND_PRIIORITY_LIST.get(condPriority));
        final Integer condValue = dr.getInt("activity_log.cond_value");
        final String condValueStr = StringUtil.notNull(COND_VALUE_LIST.get(condValue));
        final Integer recAction = dr.getInt("activity_log.rec_action");
        final String recActionStr = StringUtil.notNull(REC_ACTION_LIST.get(recAction));
        final String location = notNull(dr.getString("activity_log.location"));
        String aLId = dr.getValue("activity_log.activity_log_id").toString();
        aLId = aLId.split("\\.")[0];
        final String status = notNull(dr.getString("activity_log.status"));
        final Double costFim = dr.getDouble("activity_log.cost_fim");
        final String costFimStr = costFim == null ? "" : costFim.toString();
        final Double costAnnualSave = dr.getDouble("activity_log.cost_annual_save");
        final String costAnnualSaveStr = costAnnualSave == null ? "" : costAnnualSave.toString();
        final Double costPayback = dr.getDouble("activity_log.cost_payback");
        final String costPaybackStr = costPayback == null ? "" : costPayback.toString();
        final Integer ucFim = dr.getInt("activity_log.uc_fim");
        final String ucFimStr = StringUtil.notNull(UC_FIM_LIST.get(ucFim));
        final String description = notNull(dr.getString("activity_log.description")); // table.getStyleOptions()

        com.aspose.words.Row row = table.getRows().get(0);
        com.aspose.words.Cell cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, eqId));
        cell = row.getCells().get(3);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, eqStd));

        row = table.getRows().get(1);
        cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, siteId));
        cell = row.getCells().get(3);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, blId));

        row = table.getRows().get(2);
        cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, flId));
        cell = row.getCells().get(3);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, rmId));

        row = table.getRows().get(3);
        cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, assessedBy));
        cell = row.getCells().get(3);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, dateAssessStr));

        row = table.getRows().get(4);
        cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, condPriorityStr));
        cell = row.getCells().get(3);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, condValueStr));

        row = table.getRows().get(5);
        cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, recActionStr));
        cell = row.getCells().get(3);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, location));

        row = table.getRows().get(6);
        cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, aLId));
        cell = row.getCells().get(3);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, status));

        row = table.getRows().get(7);
        cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, costFimStr));
        cell = row.getCells().get(3);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, costAnnualSaveStr));

        row = table.getRows().get(8);
        cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, costPaybackStr));
        cell = row.getCells().get(3);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, ucFimStr));

        row = table.getRows().get(9);
        cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, description));
    }

    private void fillProjectTable(final Table table1, final DataRecord dr,
            final com.aspose.words.Document doc) {
        com.aspose.words.Row row = table1.getRows().get(0);
        com.aspose.words.Cell cell = row.getCells().get(1);
        cell.getFirstParagraph().appendChild(
            new com.aspose.words.Run(doc, StringUtil.notNull(dr
                .getString("activity_log.project_id"))));
        cell = row.getCells().get(3);
        cell.getFirstParagraph()
            .appendChild(
                new com.aspose.words.Run(doc, StringUtil.notNull(dr
                    .getString("activity_log.ehandle"))));

        row = table1.getRows().get(1);
        cell = row.getCells().get(1);
        final Date date = dr.getDate("activity_log.date_completed");
        final String dateStr = date == null ? "" : date.toString();
        cell.getFirstParagraph().appendChild(new com.aspose.words.Run(doc, dateStr));
        cell = row.getCells().get(3);
        cell.getFirstParagraph().appendChild(
            new com.aspose.words.Run(doc, StringUtil.notNull(dr
                .getString("activity_log.completed_by"))));

    }
}
