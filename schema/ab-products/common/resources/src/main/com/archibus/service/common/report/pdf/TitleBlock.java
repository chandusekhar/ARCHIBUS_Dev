package com.archibus.service.common.report.pdf;

import java.text.SimpleDateFormat;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.ext.report.docx.DocxUtility;
import com.archibus.utility.StringUtil;
import com.aspose.words.Body;

/**
 *
 * Provides for PDF report title block.
 *
 * @author Yong Shao
 * @since 22.1
 *
 */
public class TitleBlock {
    /**
     * Constant: room table name.
     */
    private static final String RM_TABLE = "rm";

    /**
     * Constant: building table name.
     */
    private static final String BL_TABLE = "bl";
    
    /**
     * Constant: site table name.
     */
    private static final String SITE_TABLE = "site";
    
    /**
     * Constant: BL_ID.
     */
    private static final String BL_ID = "bl_id";
    
    /**
     * Constant: field name.
     */
    private static final String NAME = "name";
    
    /**
     * Constant: SITE_ID.
     */
    private static final String SITE_ID = "site_id";
    
    /**
     * Constant: FL_ID.
     */
    private static final String FL_ID = "fl_id";
    
    /**
     * Constant: DWGNAME.
     */
    private static final String DWGNAME = "dwgname";

    /**
     *
     * Gets Room Record restricted by dwgname.
     *
     * @param dwgname drawing name.
     * @return DataRecord.
     */
    public DataRecord getRoomRecord(final String dwgname) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(RM_TABLE,
                    new String[] { BL_ID, FL_ID, DWGNAME }).addRestriction(
                        new Restrictions.Restriction.Clause(RM_TABLE, DWGNAME, dwgname.toUpperCase(),
                            Restrictions.OP_EQUALS));
        dataSource.setDistinct(true);
        return dataSource.getRecord();
    }
    
    /**
     *
     * Gets Building id from specified record.
     *
     * @param record DataRecord.
     * @return Building code.
     */
    public String getBuildingId(final DataRecord record) {
        return record.getString(RM_TABLE + '.' + BL_ID);
    }

    /**
     *
     * Gets floor id from specified record.
     *
     * @param record DataRecord.
     * @return floor code.
     */
    public String getFloorId(final DataRecord record) {
        return record.getString(RM_TABLE + '.' + FL_ID);
    }
    
    /**
     *
     * Gets Building Record restricted by bl_id.
     *
     * @param buildingCode bl_id value.
     * @return DataRecord.
     */
    public DataRecord getBuildingRecord(final String buildingCode) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(BL_TABLE,
                    new String[] { BL_ID, NAME, SITE_ID }).addRestriction(
                        new Restrictions.Restriction.Clause(BL_TABLE, BL_ID, buildingCode,
                            Restrictions.OP_EQUALS));
        dataSource.setDistinct(true);
        return dataSource.getRecord();
    }
    
    /**
     *
     * Gets Building Name from specified record.
     *
     * @param record DataRecord.
     * @return Building Name.
     */
    public String getBuildingName(final DataRecord record) {
        return record.getString(BL_TABLE + '.' + NAME);
    }
    
    /**
     *
     * Gets Site Code from specified record.
     *
     * @param record DataRecord.
     * @return Site code.
     */
    public String getSiteId(final DataRecord record) {
        return record.getString(BL_TABLE + '.' + SITE_ID);
    }
    
    /**
     *
     * Gets Site Name from specified record.
     *
     * @param record DataRecord.
     * @return Site Name.
     */
    public String getSiteName(final DataRecord record) {
        return record.getString(SITE_TABLE + '.' + NAME);
    }
    
    /**
     *
     * Gets Site Record restricted by site_id.
     *
     * @param siteCode site_id value.
     * @return DataRecord.
     */
    public DataRecord getSiteRecord(final String siteCode) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(SITE_TABLE,
                    new String[] { SITE_ID, NAME }).addRestriction(
                        new Restrictions.Restriction.Clause(SITE_TABLE, SITE_ID, siteCode,
                            Restrictions.OP_EQUALS));
        dataSource.setDistinct(true);
        return dataSource.getRecord();
    }
    
    /**
     *
     * Displays title block with predefined macros in template.
     *
     * @param scale string.
     * @param displayInfo DisplayInfo.
     */
    public void display(final String scale, final DisplayInfo displayInfo) {
        final Body body = displayInfo.getBody();
        DocxUtility.replaceText(body, "{DRAWING.TITLE}",
            StringUtil.notNull(displayInfo.getDrawingInfo().getTitle()));

        final String currentDate =
                SimpleDateFormat.getDateInstance(SimpleDateFormat.SHORT,
                    ContextStore.get().getLocale()).format(new java.util.Date());
        DocxUtility.replaceText(body, "{DATE}", currentDate);

        DocxUtility.replaceText(body, "{USER}", displayInfo.getUserName());

        if (scale != null) {
            DocxUtility.replaceText(body, "{SCALE}",
                String.format(displayInfo.getScaleInfo().getScaleDisplayPattern(), scale));
            int indexing = displayInfo.getStandardScaleIndexing(scale);
            final String[] scaleBarNumbersArray =
                    displayInfo.getScaleInfo().getScaleBarNumbers()[indexing].split(";");
            indexing = 0;
            for (final String displayedNumber : scaleBarNumbersArray) {
                DocxUtility.replaceText(body, "{N" + indexing + "}", displayedNumber);
                indexing++;
            }
        }

        final DataRecord rmRecord = this.getRoomRecord(displayInfo.getDrawingInfo().getName());
        if (rmRecord != null) {
            final String buildingId = this.getBuildingId(rmRecord);
            DocxUtility.replaceText(body, "{bl_id}", StringUtil.notNull(buildingId));
            DocxUtility.replaceText(body, "{fl_id}", StringUtil.notNull(this.getFloorId(rmRecord)));
            
            final DataRecord blRecord = this.getBuildingRecord(buildingId);
            DocxUtility.replaceText(body, "{bl_name}",
                StringUtil.notNull(this.getBuildingName(blRecord)));
            
            final String siteId = this.getSiteId(blRecord);
            DocxUtility.replaceText(body, "{site_id}", StringUtil.notNull(siteId));
            final DataRecord siteRecord = this.getSiteRecord(siteId);
            if (siteRecord != null) {
                DocxUtility.replaceText(body, "{site_name}",
                    StringUtil.notNull(this.getSiteName(siteRecord)));
            }
        }
    }
}
