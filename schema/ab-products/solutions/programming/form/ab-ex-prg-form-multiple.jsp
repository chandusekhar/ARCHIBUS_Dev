<%@ taglib prefix="ab" uri="/WEB-INF/tld/ab-system.tld"%>
<%@ taglib prefix="ex" uri="/WEB-INF/tld/ab-solutions-view-examples.tld"%>
<%@ page contentType="text/html"%>

<ab:view version="2.0">
	<ab:title>Form panel with multiple rows of fields</ab:title>

	<ab:dataSource>
		<ab:table name="project"/>
		<ab:field name="project_id" />
		<ab:field name="requestor" />
		<ab:field name="date_commence_work" />
		<ab:field name="date_target_end" />
	</ab:dataSource>

	<ex:multiForm columns="4" id="multiForm" labelsPosition="top">
		<ab:title>Projects</ab:title>
        <ab:instructions>To display more than one row of fields, add the URL query parameter: [br/][br/]http://localhost:8080/archibus/ab-ex-prg-form-multiple.jsp?rows=3</ab:instructions>
	</ex:multiForm>
</ab:view>