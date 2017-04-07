package com.archibus.app.solution.common.webservice.employee.client;

import java.util.List;

import com.archibus.utility.ExceptionBase;

public interface EmployeeServiceClient {
    List<Employee> getEmployees(String divisionId, String departmentId) throws ExceptionBase;
}