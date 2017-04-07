<%@ taglib prefix="ab" uri="/WEB-INF/tld/ab-system.tld" %>
<%@ taglib prefix="ex" uri="/WEB-INF/tld/ab-solutions-view-examples.tld"%>
<%@ page contentType="text/html" %>

<ab:view version="2.0" showLoadProgress="true">
	<ab:title translatable="true">Edit Multiple - Equipment</ab:title>
	<ab:js file="/archibus/schema/ab-products/move/management/manage-gp/ab-mo-gp-list-edit-multiple.js"/>
	
	<ab:message name="msg_saving" translatable="true">Saving data...</ab:message>
	<ab:message name="msg_data_title" translatable="true">Data Jack</ab:message>
	<ab:message name="msg_voice_title" translatable="true">Voice Jack</ab:message>
	<ab:message name="msg_from_location_title" translatable="true">From Location{0}Bldg | Floor | Room</ab:message>
	
	<ab:dataSource id="ds_abMoGroupListEditMultiple">
		<ab:table name="mo" role="main"/>
		<ab:field table="mo" name="mo_id"/>
		<ab:field table="mo" name="em_id"/>
		<ab:field table="mo" name="from_location" dataType="text">
			<ab:sql dialect="generic">
				( mo.from_bl_id%{sql.concat}'|'%{sql.concat}mo.from_fl_id%{sql.concat}'|'%{sql.concat}mo.from_rm_id )			
			</ab:sql>
		</ab:field>
		<ab:field table="mo" name="to_bl_id"/>
		<ab:field table="mo" name="to_fl_id"/>
		<ab:field table="mo" name="to_rm_id"/>
		<ab:field table="mo" name="to_jk_id_data"/>
		<ab:field table="mo" name="to_jk_id_voice"/>
		<ab:field table="mo" name="date_start_req"/>
		<ab:field table="mo" name="date_to_perform"/>
		<ab:field table="mo" name="description"/>
		<ab:sortField table="mo" name="mo_id" ascending="true"/>
	</ab:dataSource>
	
	<ex:multiForm id="form_abMoGroupListEditMultiple" dataSource="ds_abMoGroupListEditMultiple" columns="11" labelsPosition="top">
		<ab:title translatable="true">Edit Moves</ab:title>
		<ab:action id="save">
			<ab:title translatable="true">Save</ab:title>
		</ab:action>
		<ab:action id="saveClose">
			<ab:title translatable="true">Save and Close</ab:title>
		</ab:action>
		<ab:action id="cancel">
			<ab:title translatable="true">Cancel</ab:title>
			<ab:command type="closeDialog"/>
		</ab:action>
		<ab:field table="mo" name="mo_id" readOnly="true" style="width:70"/>
		<ab:field table="mo" name="em_id" readOnly="true">
			<ab:title translatable="true">Equipment</ab:title>
		</ab:field>
		<ab:field table="mo" name="from_location" readOnly="true">
			<ab:title translatable="false"></ab:title>
		</ab:field>
		<ab:field table="mo" name="to_bl_id" style="width:70"/>
		<ab:field table="mo" name="to_fl_id" style="width:50"/>
		<ab:field table="mo" name="to_rm_id" style="width:50"/>
		<ab:field table="mo" name="to_jk_id_data" style="width:100">
			<ab:action id="selectValue">
				<ab:title translatable="false">...</ab:title>
				<ab:command type="callFunction" functionName="openSelectValue('row', 'data', this)"/>
			</ab:action>
		</ab:field>
		<ab:field table="mo" name="to_jk_id_voice" style="width:100">
			<ab:action id="selectValue">
				<ab:title translatable="false">...</ab:title>
				<ab:command type="callFunction" functionName="openSelectValue('row', 'voice', this)"/>
			</ab:action>
		</ab:field>
		<ab:field table="mo" name="date_start_req" readOnly="true">
			<ab:title translatable="true">Requested Move Date</ab:title>
		</ab:field>
		<ab:field table="mo" name="date_to_perform">
			<ab:title translatable="true">Move Date</ab:title>
		</ab:field>
		<ab:field table="mo" name="description" style="width: 350px; height: 25px;"/>
	</ex:multiForm>
</ab:view>
