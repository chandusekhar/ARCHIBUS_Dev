package com.archibus.app.common.drawing.svg.service.dao;

import com.archibus.app.common.drawing.svg.service.domain.Drawing;
import com.archibus.utility.ExceptionBase;

/**
 * DAO for Site.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public interface IDrawingDao {
    /**
     * 
     * Gets Drawing object by specified space field Hierarchy Values.
     * 
     * @param spaceHierarchyValues space field Hierarchy Values.
     * @return Drawing object.
     * 
     * @throws ExceptionBase if DataSource throws an exception.
     */
    Drawing getBySpaceHierarchyValues(final String spaceHierarchyValues) throws ExceptionBase;
}
