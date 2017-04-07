package com.archibus.app.common.connectors.translation.xls.outbound;

import org.json.JSONObject;

import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.schema.DataType;
import com.archibus.utility.StringUtil;
import com.aspose.cells.*;

/**
 * 
 * Class that provides methods which creates an Excel workbook and its elements.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class XlsGenerator extends XlsBuilder {
    
    /**
     * Row header red color.
     */
    private static final int ROW_HEADER_COLOR_RED = 216;
    
    /**
     * Row header green color.
     */
    private static final int ROW_HEADER_COLOR_GREEN = 228;
    
    /**
     * Row header blue color.
     */
    private static final int ROW_HEADER_COLOR_BLUE = 255;
    
    /**
     * Data cell red color.
     */
    private static final int DATA_CELL_COLOR_RED = 255;
    
    /**
     * Data cell green color.
     */
    private static final int DATA_CELL_COLOR_GREEN = 255;
    
    /**
     * Data cell blue color.
     */
    private static final int DATA_CELL_COLOR_BLUE = 255;
    
    /**
     * Row height.
     */
    private static final int ROW_HEIGHT = 45;
    
    /**
     * Constant.
     */
    private static final String SHOW_BORDER = "showBorder";
    
    /**
     * Color for data cell.
     */
    private XlsBuilder.Color dataCellColoring;
    
    /**
     * Color for row header.
     */
    private XlsBuilder.Color rowHeaderColoring;
    
    /**
     * Cell style.
     */
    private Style style;
    
    /**
     * Connector parameters.
     */
    private final JSONObject parameters;
    
    /**
     * Source table.
     */
    private final String worksheetName;
    
    /**
     * 
     * Constructor. Creates the workbook.
     * 
     * @param worksheetName The name of the worksheet that records will be written to.
     * 
     * @param parameters connector parameters
     */
    public XlsGenerator(final String worksheetName, final JSONObject parameters) {
        super();
        this.worksheetName = worksheetName;
        this.parameters = parameters;
        this.rowHeaderColoring =
                new XlsBuilder.Color(ROW_HEADER_COLOR_RED, ROW_HEADER_COLOR_GREEN,
                    ROW_HEADER_COLOR_BLUE);
        this.dataCellColoring =
                new XlsBuilder.Color(DATA_CELL_COLOR_RED, DATA_CELL_COLOR_GREEN,
                    DATA_CELL_COLOR_BLUE);
    }
    
    /**
     * Initialize Excel Workbook.
     */
    public void initWorkbook() {
        final JSONObject jsonParams = this.parameters;
        
        this.style = createCellBorderStyle(jsonParams);
        this.rowHeaderColoring =
                createCellColor(jsonParams, "rowHeaderColor", this.rowHeaderColoring);
        this.dataCellColoring = createCellColor(jsonParams, "cellDataColor", this.dataCellColoring);
    }
    
    /**
     * Create an Excel Worksheet from a connector bean.
     * 
     * @return Excel builder
     */
    public XlsBuilder createWorksheet() {
        
        final Workbook workbook = getWorkBook();
        
        if (workbook.getWorksheets().get(this.worksheetName) == null) {
            
            workbook.getWorksheets().get(workbook.getWorksheets().getActiveSheetIndex())
                .setName(this.worksheetName);
            
        } else {
            workbook.getWorksheets().get(this.worksheetName);
        }
        
        return this;
    }
    
    /**
     * 
     * Create cell border style.
     * 
     * @param params parameters
     * @return Style
     */
    private Style createCellBorderStyle(final JSONObject params) {
        final Style sStyle = this.getWorkBook().createStyle();
        if (params.has(SHOW_BORDER)) {
            if (params.getBoolean(SHOW_BORDER)) {
                sStyle.setBorder(BorderType.TOP_BORDER, CellBorderType.THIN,
                    com.aspose.cells.Color.getBlack());
                sStyle.setBorder(BorderType.BOTTOM_BORDER, CellBorderType.THIN,
                    com.aspose.cells.Color.getBlack());
                sStyle.setBorder(BorderType.LEFT_BORDER, CellBorderType.THIN,
                    com.aspose.cells.Color.getBlack());
                sStyle.setBorder(BorderType.RIGHT_BORDER, CellBorderType.THIN,
                    com.aspose.cells.Color.getBlack());
                this.setShowBorders(true);
            } else {
                sStyle.setBorder(BorderType.TOP_BORDER, CellBorderType.NONE,
                    com.aspose.cells.Color.getBlack());
                sStyle.setBorder(BorderType.BOTTOM_BORDER, CellBorderType.NONE,
                    com.aspose.cells.Color.getBlack());
                sStyle.setBorder(BorderType.LEFT_BORDER, CellBorderType.NONE,
                    com.aspose.cells.Color.getBlack());
                sStyle.setBorder(BorderType.RIGHT_BORDER, CellBorderType.NONE,
                    com.aspose.cells.Color.getBlack());
                this.setShowBorders(false);
            }
        }
        return sStyle;
        
    }
    
    /**
     * 
     * Get cell color.
     * 
     * @param params parameters
     * @param cellType cell type
     * @param defaultColor default color
     * @return XlsBuilder.Color object
     */
    private XlsBuilder.Color createCellColor(final JSONObject params, final String cellType,
            final XlsBuilder.Color defaultColor) {
        XlsBuilder.Color rowHeaderColor = defaultColor;
        if (params.has(cellType)) {
            final JSONObject color = params.getJSONObject(cellType);
            rowHeaderColor =
                    new XlsBuilder.Color(color.getInt("red"), color.getInt("green"),
                        color.getInt("blue"));
        }
        
        return rowHeaderColor;
        
    }
    
    @Override
    public void writeCellTitle(final int rowIndex, final int colIndex, final String title) {
        this.getWorksheet().getCells().setRowHeight(0, ROW_HEIGHT);
        this.writeCellTitle(rowIndex, colIndex, title, this.rowHeaderColoring);
    }
    
    /**
     * 
     * Write cell data.
     * 
     * @param rowIndex row index
     * @param colIndex column index
     * @param fieldValue field value
     * @param dataType data type
     */
    public void writeCellData(final int rowIndex, final int colIndex, final Object fieldValue,
            final DataType dataType) {
        
        if (StringUtil.notNullOrEmpty(fieldValue)) {
            
            final String textData = String.valueOf(fieldValue);
            
            switch (dataType) {
                case CHAR:
                case VARCHAR:
                    this.writeCellData(rowIndex, colIndex, textData, false, 0,
                        this.dataCellColoring, this.style);
                    break;
                case NUMERIC:
                case FLOAT:
                case DOUBLE:
                case INTEGER:
                case SMALLINT:
                    final Double convertValue = Double.valueOf(textData);
                    this.writeCellNumericData(rowIndex, colIndex, convertValue, 0,
                        this.dataCellColoring);
                    break;
                default:
                    this.writeCellData(rowIndex, colIndex, textData, false, 0,
                        this.dataCellColoring, this.style);
                    
            }
        } else {
            this.writeCellData(rowIndex, colIndex, null, false, 0, this.dataCellColoring,
                this.style);
        }
    }
    
    /**
     * Getter for the dataCellColoring property.
     * 
     * @see dataCellColoring
     * @return the dataCellColoring property.
     */
    public XlsBuilder.Color getDataCellColoring() {
        return this.dataCellColoring;
    }
    
    /**
     * Setter for the dataCellColoring property.
     * 
     * @see dataCellColoring
     * @param dataCellColoring the dataCellColoring to set
     */
    
    public void setDataCellColoring(final XlsBuilder.Color dataCellColoring) {
        this.dataCellColoring = dataCellColoring;
    }
    
    /**
     * Getter for the rowHeaderColoring property.
     * 
     * @see rowHeaderColoring
     * @return the rowHeaderColoring property.
     */
    public XlsBuilder.Color getRowHeaderColoring() {
        return this.rowHeaderColoring;
    }
    
    /**
     * Setter for the rowHeaderColoring property.
     * 
     * @see rowHeaderColoring
     * @param rowHeaderColoring the rowHeaderColoring to set
     */
    
    public void setRowHeaderColoring(final XlsBuilder.Color rowHeaderColoring) {
        this.rowHeaderColoring = rowHeaderColoring;
    }
    
    /**
     * Getter for the style property.
     * 
     * @see style
     * @return the style property.
     */
    public Style getStyle() {
        return this.style;
    }
    
    /**
     * Setter for the style property.
     * 
     * @see style
     * @param style the style to set
     */
    
    public void setStyle(final Style style) {
        this.style = style;
    }
    
    /**
     * Getter for the parameters property.
     * 
     * @see parameters
     * @return the parameters property.
     */
    public JSONObject getParameters() {
        return this.parameters;
    }
    
    /**
     * Getter for the sourceTable property.
     * 
     * @see sourceTable
     * @return the sourceTable property.
     */
    public String getSourceTable() {
        return this.worksheetName;
    }
}
