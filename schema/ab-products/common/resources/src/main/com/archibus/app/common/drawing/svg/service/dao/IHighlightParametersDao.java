package com.archibus.app.common.drawing.svg.service.dao;

import java.util.List;

import com.archibus.app.common.drawing.svg.service.domain.HighlightParameters;
import com.archibus.utility.ExceptionBase;

/**
 * DAO for HighlightParameters.
 *
 * @author shao
 * @since 21.1
 *
 */

public interface IHighlightParametersDao {
    /**
     *
     * Gets list of HighlightParameters by a plan type.
     *
     * @param planType plan type value.
     * @return list of HighlightParameters.
     *
     * @throws ExceptionBase if DataSource throws an exception.
     */
    List<HighlightParameters> getByPlanType(final String planType) throws ExceptionBase;
}
