package com.archibus.app.common.drawing.svg.service.dao.datasource;

import com.archibus.app.common.drawing.svg.service.dao.ISiteDao;
import com.archibus.app.common.drawing.svg.service.domain.Site;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecordField;
import com.archibus.utility.ExceptionBase;

/**
 * DataSource for Site.
 * <p>
 * A bean class named as "svgSiteDataSource".
 * <p>
 * configured in /schema/ab-products/common/resources/appContext-services.xml
 * <p>
 * Designed to have prototype scope.
 * 
 * @author Shao
 * @since 21.1
 */
public class SiteDataSource extends ObjectDataSourceImpl<Site> implements ISiteDao {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { Constants.SITE_DETAIL_DWG, "detailDrawingName" }, { Constants.SITE_ID, "siteId" } };
    
    /**
     * Constructs SiteDataSource, mapped to <code>Site</code> table, using <code>svgSite</code>
     * bean.
     */
    public SiteDataSource() {
        super("svgSite", Constants.SITE_TABLE);
    }
    
    /**
     * 
     * Gets Site object by specified site_id.
     * 
     * @param siteId site id.
     * @return Site object.
     * 
     * @throws ExceptionBase if DataSource throws an exception.
     */
    public Site getBySiteId(final String siteId) throws ExceptionBase {
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(Constants.SITE_TABLE + '.' + Constants.SITE_ID);
            pkField.setValue(siteId);
            
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        return this.get(primaryKeysValues);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
