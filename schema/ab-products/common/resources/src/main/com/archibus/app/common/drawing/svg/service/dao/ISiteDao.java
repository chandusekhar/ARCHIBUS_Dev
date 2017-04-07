package com.archibus.app.common.drawing.svg.service.dao;

import com.archibus.app.common.drawing.svg.service.domain.Site;
import com.archibus.utility.ExceptionBase;

/**
 * DAO for Site.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public interface ISiteDao {
    /**
     * 
     * Gets Site object by specified site_id.
     * 
     * @param siteId site id.
     * @return Site object.
     * 
     * @throws ExceptionBase if DataSource throws an exception.
     */
    Site getBySiteId(final String siteId) throws ExceptionBase;
}
