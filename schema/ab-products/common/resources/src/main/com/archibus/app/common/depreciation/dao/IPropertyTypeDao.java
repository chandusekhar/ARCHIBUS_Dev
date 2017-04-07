package com.archibus.app.common.depreciation.dao;

import com.archibus.core.dao.IDao;

/**
 * DAO for property type.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 * @param <PropertyType> type of the persistent object
 */
public interface IPropertyTypeDao<PropertyType> extends IDao<PropertyType> {

    /**
     * Returns property type object for specified property type.
     *
     * @param propertyType property type name
     * @return {@link com.archibus.app.common.depreciation.domain.PropertyType}
     */
    PropertyType getPropertyTypeByName(final String propertyType);

}
