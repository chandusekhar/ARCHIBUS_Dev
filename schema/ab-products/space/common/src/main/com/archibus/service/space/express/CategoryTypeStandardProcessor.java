package com.archibus.service.space.express;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.service.space.SpaceConstants;
import com.archibus.utility.*;
import com.aspose.cells.*;

/**
 * Space Express - Process Standard Room Categories and Types.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Space Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public class CategoryTypeStandardProcessor {
    
    /**
     * Indicates the number 3.
     * 
     */
    public static final int THREE = 3;
    
    /**
     * Indicates the number 4.
     * 
     */
    public static final int FOUR = 4;
    
    /**
     * Indicates the number 5.
     * 
     */
    public static final int FIVE = 5;
    
    /**
     * Indicates the String constant 'Category'.
     * 
     */
    public static final String CATEGORY = "Category";
    
    /**
     * Indicates the TABLE name 'rmtype' .
     * 
     */
    public static final String RMTYPE = "rmtype";
    
    /**
     * standard of Room Categories and Types.
     */
    private String standard;
    
    /**
     * Room Category Records list.
     */
    private List<DataRecord> caterogies;
    
    /**
     * Room Type Records list.
     */
    private List<DataRecord> types;
    
    /**
     * DataSource of table rmcat.
     */
    private final DataSource rmcatDS = DataSourceFactory.createDataSourceForFields(
        SpaceConstants.RMCAT, new String[] { SpaceConstants.RM_CAT, SpaceConstants.SUPERCAT,
                SpaceConstants.DESCRIPTION, SpaceConstants.OCCUPIABLE, "hpattern_acad",
                "used_in_calcs" });
    
    /**
     * DataSource of table rmtype.
     */
    private final DataSource rmtypeDS = DataSourceFactory.createDataSourceForFields(RMTYPE,
        new String[] { SpaceConstants.RM_TYPE, SpaceConstants.RM_CAT, SpaceConstants.DESCRIPTION });
    
    /**
     * 
     * Constructor: set the passed standard.
     * 
     * @param std standard of Room Categories and Types
     * 
     */
    public CategoryTypeStandardProcessor(final String std) {
        
        this.standard = std;
        
    }
    
    /**
     * 
     * Construct records from spreadsheet file.
     * 
     */
    public void prepareRecords() {
        
        this.caterogies = new ArrayList<DataRecord>();
        this.types = new ArrayList<DataRecord>();
        
        final String fullFileName = this.getFullXlsFileName();
        final Cells cells = readCellsFromXlsFile(fullFileName);
        
        boolean isReadingCategoryRow = false;
        boolean isReadingTypeRow = false;
        
        for (final Object rowObj : cells.getRows()) {
            
            final Row row = (Row) rowObj;
            final Cell first = row.get(0);
            if (isReadingCategoryRow) {
                
                isReadingCategoryRow = this.readCategoryRow(row);
                
            } else if (isReadingTypeRow) {
                
                isReadingTypeRow = this.readTypeRow(row);
                
            } else {
                
                if (first != null && "rm_cat".equalsIgnoreCase(first.getStringValue())) {
                    
                    isReadingCategoryRow = true;
                    
                } else if (first != null && CATEGORY.equalsIgnoreCase(first.getStringValue())) {
                    
                    isReadingTypeRow = true;
                    
                }
                continue;
            }
            
        }
        
    }
    
    /**
     * *
     * 
     * @return full file name of xls.
     * 
     */
    private String getFullXlsFileName() {
        
        // construct the full spread sheet file name by system file folder and standard name.
        
        final String prefix =
                ContextStore.get().getWebAppPath() + "/schema/ab-products/space/common/other/";
        
        String xlsFileName = "";
        
        if ("gsa".equalsIgnoreCase(this.standard)) {
            
            xlsFileName = "GSA BIM.xlsx";
            
        } else {
            xlsFileName = this.standard.toUpperCase() + ".xlsx";
        }
        
        return prefix + xlsFileName;
        
    }
    
    /**
     * @return cells of xls file.
     * 
     * @param fullFileName String full name of xls file
     */
    private Cells readCellsFromXlsFile(final String fullFileName) {
        
        Workbook workBook;
        Cells cells = null;
        try {
            workBook = new Workbook(fullFileName);
            final Worksheet sheet = workBook.getWorksheets().get(0);
            cells = sheet.getCells();
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            final ExceptionBase exception =
                    ExceptionBaseFactory.newNonTranslatableException("Read Xls File Error", null);
            exception.setNested(originalException);
            
            throw exception;
        }
        
        return cells;
    }
    
    /**
     * 
     * Read and Parse category row, and return a boolean sign indicate that if passed row is the
     * category row.
     * 
     * @param row Row of category in spreadsheet
     * 
     * @return isCategory if current is the category row
     * 
     */
    public boolean readCategoryRow(final Row row) {
        
        boolean isCategory = true;
        if (row == null || row.get(0) == null
                || StringUtil.isNullOrEmpty(row.get(0).getStringValue())
                || "#Room Types".equalsIgnoreCase(row.get(0).getStringValue())) {
            
            isCategory = false;
            
        } else {
            
            createCategoryRecord(row);
        }
        
        return isCategory;
    }
    
    /**
     * 
     * Create new category record from parsed category row.
     * 
     * @param row Row of category in spreadsheet
     * 
     */
    private void createCategoryRecord(final Row row) {
        
        final DataRecord record = this.rmcatDS.createNewRecord();
        
        record.setValue("rmcat.rm_cat", row.get(0).getStringValue());
        record.setValue("rmcat.description", row.get(1).getStringValue());
        record.setValue("rmcat.hpattern_acad", row.get(2).getStringValue());
        record.setValue("rmcat.occupiable", Integer.valueOf(row.get(THREE).getStringValue()));
        record.setValue("rmcat.supercat", row.get(FOUR).getStringValue());
        record.setValue("rmcat.used_in_calcs", row.get(FIVE).getStringValue());
        
        this.caterogies.add(record);
    }
    
    /**
     * 
     * Read and Parse type row, and return a boolean sign indicate that if passed row is the type
     * row.
     * 
     * @param row Row of type in spreadsheet
     * 
     * @return isType if current is the type row
     * 
     */
    public boolean readTypeRow(final Row row) {
        
        boolean isType = true;
        if (row == null || row.get(0) == null
                || StringUtil.isNullOrEmpty(row.get(0).getStringValue())) {
            isType = false;
        } else {
            createTypeRecord(row);
        }
        
        return isType;
    }
    
    /**
     * 
     * Create new type record from parsed type row.
     * 
     * @param row Row of type in spreadsheet
     * 
     */
    private void createTypeRecord(final Row row) {
        
        final DataRecord record = this.rmtypeDS.createNewRecord();
        record.setValue("rmtype.rm_cat", row.get(0).getStringValue());
        record.setValue("rmtype.rm_type", row.get(1).getStringValue());
        record.setValue("rmtype.description", row.get(2).getStringValue());
        
        this.types.add(record);
    }
    
    /**
     * 
     * check the rmcat and rmtype tables and make sure they are empty.
     * 
     * Justification: Case #1 : : Statement with Select ... exists count(*).
     * 
     * @return true if both of tables rmcat and rmtype are empty.
     */
    public Boolean isRmcatAndRmtypeEmpty() {
        
        return (this.rmcatDS.getRecord() == null) && (this.rmtypeDS.getRecord() == null);
        
    }
    
    /**
     * 
     * Save Room's categories and types record to DaaBase.
     * 
     */
    public void importRecords() {
        
        for (final DataRecord categoryRecord : this.caterogies) {
            this.rmcatDS.saveRecord(categoryRecord);
        }
        
        for (final DataRecord typeRecord : this.types) {
            this.rmtypeDS.saveRecord(typeRecord);
        }
        
    }
    
    /**
     * Getter for the standard property.
     * 
     * @see standard
     * @return the standard property.
     */
    public String getStandard() {
        return this.standard;
    }
    
    /**
     * Setter for the standard property.
     * 
     * @see standard
     * @param standard the standard to set
     */
    
    public void setStandard(final String standard) {
        this.standard = standard;
    }
    
    /**
     * Getter for the categories property.
     * 
     * @see caterogies
     * @return the categories property.
     */
    public List<DataRecord> getCaterogies() {
        return this.caterogies;
    }
    
    /**
     * Getter for the types property.
     * 
     * @see types
     * @return the types property.
     */
    public List<DataRecord> getTypes() {
        return this.types;
    }
    
}