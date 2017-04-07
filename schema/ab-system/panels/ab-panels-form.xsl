<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 2006-01-30 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="panel_form">
		<xsl:param name="panel"/>
		<xsl:param name="panel_id"/>
		<xsl:param name="type"/>
 		<xsl:param name="afmTableGroup"/>
        <xsl:param name="tabIndex"/>
	 <xsl:param name="isConsole"/>
			<xsl:variable name="panelName">
				<xsl:choose>
					<xsl:when test="$panel/@name!=''"><xsl:value-of select="$panel/@name"/></xsl:when>
					<xsl:otherwise><xsl:value-of select="$panel/@id"/></xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
        
		<xsl:if test="$panel/title!='' or count($panel/afmAction) &gt; 0">
			<xsl:variable name="useHeaderClass">
				<xsl:choose>
					<xsl:when test="$panel/@headerClass!=''"><xsl:value-of select="$panel/@headerClass"/></xsl:when>
					<xsl:otherwise>panelHeader</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<xsl:call-template name="afmTableGroup_header_footer_handler">
				<xsl:with-param name="name" select="$panelName"/>
				<xsl:with-param name="title" select="$panel/title"/>
				<xsl:with-param name="actions" select="$panel/afmAction"/>
				<xsl:with-param name="form_name" select="$panel_id"/>
				<xsl:with-param name="actions_style" select="'text-align:right;'"/>
				<xsl:with-param name="table_class" select="$useHeaderClass"/>
				<xsl:with-param name="showActions" select="'true'"/>
				<xsl:with-param name="tabIndex" select="$tabIndex"/>
			</xsl:call-template>
		</xsl:if>
		<xsl:call-template name="panel_form_body">
			<xsl:with-param name="panel" select="$panel"/>
			<xsl:with-param name="panel_id" select="$panel_id"/>
	        <xsl:with-param name="panelName" select="$panelName"/>
            <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
		 <xsl:with-param name="isConsole" select="$isConsole"/>
		</xsl:call-template>
	</xsl:template>

	<xsl:template name="preparation_form">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroup_id"/>
		<xsl:variable name="renderAction" select="$afmTableGroup/afmAction[@id='cancel']"/>
		<xsl:variable name="actionIn" select="/afmXmlView/actionIn"/>
		<xsl:variable name="targetRefreshXML">
			<xsl:choose>
				<xsl:when test="(count($actionIn) &gt; 0) and (count($actionIn/restrictions) &gt; 0) and ($actionIn/@xml!='')"><xsl:value-of select="$actionIn/@xml"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$renderAction/@serialized"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<input style="display:none;" name="documentManagerTargetRefresh" id="documentManagerTargetRefresh" type="hidden" value="{$targetRefreshXML}" title="{$targetRefreshXML}"/>
		<script language="javascript">
			setupArrAllUsersInputFormNames('<xsl:value-of select="$afmTableGroup_id"/>');
		</script>
		<xsl:call-template name="SetUpFieldsInformArray">
			<xsl:with-param name="fieldNodes" select="$afmTableGroup/panels//fields"/>
		</xsl:call-template>
	</xsl:template>

	<xsl:template name="panel_form_body">
		<xsl:param name="panel"/>
		<xsl:param name="panel_id"/>
		<xsl:param name="panelName"/>
 		<xsl:param name="afmTableGroup"/>
		<xsl:param name="isConsole"/>

		<xsl:variable name="columns">
			<xsl:choose>
				<xsl:when test="$panel/@columns!=''"><xsl:value-of select="$panel/@columns"/></xsl:when>
				<xsl:otherwise>1</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="panel_class">
			<xsl:choose>
				 <xsl:when test="$panel/@class!=''"><xsl:value-of select="$panel/@class"/></xsl:when>
				 <xsl:when test="$panel/@labelsPosition='top'">panelTop</xsl:when>
				<xsl:otherwise>panel</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="panel_style">
			<xsl:choose>
				<xsl:when test="$panel/@showOnLoad='false'">display:none;</xsl:when>
				<xsl:otherwise></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="showOnLoad">
			<xsl:choose>
				<xsl:when test="$panel/@showOnLoad='false'">false</xsl:when>
				<xsl:otherwise>true</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="newRecord">
			<xsl:choose>
				<xsl:when test="$panel/@newRecord='true'">true</xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
        	<xsl:variable name="isAConsole">
			<xsl:choose>
				<xsl:when test="$isConsole='true'">true</xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="viewFile">
            <xsl:value-of select="//afmXmlView/target/key/@name"/>
		</xsl:variable>
        <xsl:variable name="afmTableGroupIndex">
            <xsl:choose>
                <xsl:when test="$afmTableGroup/@index">
                    <xsl:value-of select="$afmTableGroup/@index"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>0</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="controlId">
            <xsl:choose>
                <xsl:when test="$panelName != ''"><xsl:value-of select="$panelName"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="generate-id()"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        
        <!-- Generate Form constructor JS code, with nested commands -->
        <script language="javascript">
            system_form_onload_handlers.push(
                function() {
		    var configObj = new AFM.view.ConfigObject();
		    configObj['viewDef'] = '<xsl:value-of select="$viewFile"/>';
		    configObj['groupIndex'] = <xsl:value-of select="$afmTableGroupIndex"/>;
		    configObj['panelId'] = '<xsl:value-of select="$panel_id"/>';
		    configObj['newRecord'] = <xsl:value-of select="$newRecord"/>;
		    configObj['isConsole'] = <xsl:value-of select="$isAConsole"/>;
		    <xsl:choose>
			  <xsl:when test="$showOnLoad and $showOnLoad!=''">
		    configObj['showOnLoad'] = <xsl:value-of select="$showOnLoad"/>;
			  </xsl:when>
		    </xsl:choose>
		    <xsl:choose>
			  <xsl:when test="$panel/@afterRefresh and $panel/@afterRefresh!=''">
		    configObj['afterRefreshListener'] = '<xsl:value-of select="$panel/@afterRefresh"/>';
			  </xsl:when>
		    </xsl:choose>
		    <xsl:choose>
			  <xsl:when test="$panel/@beforeSave and $panel/@beforeSave!=''">
		    configObj['beforeSaveListener'] = '<xsl:value-of select="$panel/@beforeSave"/>';
			  </xsl:when>
		    </xsl:choose>
		    <xsl:choose>
			  <xsl:when test="$panel/@beforeDelete and $panel/@beforeDelete!=''">
		    configObj['beforeDeleteListener'] = '<xsl:value-of select="$panel/@beforeDelete"/>';
			  </xsl:when>
		    </xsl:choose>
		    <xsl:choose>
			  <xsl:when test="$panel/@refreshWorkflowRuleId and $panel/@refreshWorkflowRuleId!=''">
		    configObj['refreshWorkflowRuleId'] = '<xsl:value-of select="$panel/@refreshWorkflowRuleId"/>';
			  </xsl:when>
		    </xsl:choose>
		    <xsl:choose>
			  <xsl:when test="$panel/@saveWorkflowRuleId and $panel/@saveWorkflowRuleId!=''">
		    configObj['saveWorkflowRuleId'] = '<xsl:value-of select="$panel/@saveWorkflowRuleId"/>';
			  </xsl:when>
		    </xsl:choose>
		    <xsl:choose>
			  <xsl:when test="$panel/@deleteWorkflowRuleId and $panel/@deleteWorkflowRuleId!=''">
		    configObj['deleteWorkflowRuleId'] = '<xsl:value-of select="$panel/@deleteWorkflowRuleId"/>';
			  </xsl:when>
		    </xsl:choose>
		    <xsl:choose>
			  <xsl:when test="$panel/@clearWorkflowRuleId and $panel/@clearWorkflowRuleId!=''">
		    configObj['clearWorkflowRuleId'] = '<xsl:value-of select="$panel/@clearWorkflowRuleId"/>';
			  </xsl:when>
		    </xsl:choose>
                    var control = new AFM.form.Form('<xsl:value-of select="$controlId"/>', configObj);
            <xsl:call-template name="addActionCommands">
                <xsl:with-param name="panel" select="$panel"/>
                <xsl:with-param name="controlId" select="$controlId"/>
            </xsl:call-template>
                });
        </script>

		<table width="100%" class="{$panel_class}" id="{$controlId}_body" style="{$panel_style}">
			<xsl:call-template name="panel_form_body_visibleFields">
				<xsl:with-param name="table" select="$panel/table"/>
				<xsl:with-param name="panel_id" select="$panel_id"/>
				<xsl:with-param name="columns" select="$columns"/>
				<xsl:with-param name="label_position" select="$panel/@labelsPosition"/>
				<xsl:with-param name="panel" select="$panel"/>
				<xsl:with-param name="isConsole" select="$isAConsole"/>
			</xsl:call-template>
			<xsl:call-template name="panel_form_body_hiddenFields">
				<xsl:with-param name="hiddenFields" select="$panel/hiddenFields"/>
				<xsl:with-param name="panel_id" select="$panel_id"/>
				<xsl:with-param name="columns" select="$columns"/>
			</xsl:call-template>
		</table>
	</xsl:template>

	<xsl:template name="panel_form_body_visibleFields">
		<xsl:param name="table"/>
		<xsl:param name="panel_id"/>
		<xsl:param name="columns"/>
		<xsl:param name="label_position"/>
		<xsl:param name="panel"/>
		<xsl:param name="isConsole"/>
		
		<xsl:variable name="position">
			<xsl:choose>
				<xsl:when test="$label_position!=''"><xsl:value-of select="$label_position"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$panel_form_label_default_position"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="$position='left'">
				<xsl:call-template name="panel_form_body_visibleFields_label_left_of_control">
					<xsl:with-param name="table" select="$table"/>
					<xsl:with-param name="panel_id" select="$panel_id"/>
					<xsl:with-param name="columns" select="$columns"/>
					<xsl:with-param name="panel" select="$panel"/>
					<xsl:with-param name="isConsole" select="$isConsole"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="panel_form_body_visibleFields_label_top_of_control">
					<xsl:with-param name="table" select="$table"/>
					<xsl:with-param name="panel_id" select="$panel_id"/>
					<xsl:with-param name="columns" select="$columns"/>
					<xsl:with-param name="panel" select="$panel"/>
					<xsl:with-param name="isConsole" select="$isConsole"/>
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="panel_form_body_visibleFields_label_top_of_control">
		<xsl:param name="table"/>
		<xsl:param name="panel_id"/>
		<xsl:param name="columns"/>
		<xsl:param name="panel"/>
		<xsl:param name="isConsole"/>
		
		<xsl:variable name="column_width" select="100 div $columns"/>
		<tr class="space"><td colspan="{$columns}" class="formTopSpace"></td></tr>
		<xsl:for-each select="$table/row">
			<tr>
				<xsl:for-each select="cell">
					<xsl:variable name="field" select="key('panel_fields_array',@ref)"/>
					<xsl:variable name="temp_colspan" select="$columns div last()"/>
					<xsl:variable name="colspan">
						<xsl:choose>
							<xsl:when test="$temp_colspan &gt; 1"><xsl:value-of select="$temp_colspan * 2"/></xsl:when>
							<xsl:otherwise><xsl:value-of select="$temp_colspan"/></xsl:otherwise>
						</xsl:choose>
					</xsl:variable>

					<xsl:call-template name="label_container">
					    <xsl:with-param name="panel_id" select="$panel_id"/>
					    <xsl:with-param name="field" select="$field"/>
					    <xsl:with-param name="top" select="'true'"/>
					    <xsl:with-param name="colspan" select="$colspan"/>
					    <xsl:with-param name="column_width" select="$column_width"/>
					     <xsl:with-param name="panel" select="$panel"/>
					     <xsl:with-param name="isConsole" select="$isConsole"/>
					</xsl:call-template>
				</xsl:for-each>
			</tr>
			<tr>
				<xsl:for-each select="cell">
					<xsl:variable name="field" select="key('panel_fields_array',@ref)"/>
					<xsl:variable name="temp_colspan" select="$columns div last()"/>
					<xsl:variable name="colspan">
						<xsl:choose>
							<xsl:when test="$temp_colspan &gt; 1"><xsl:value-of select="$temp_colspan * 2"/></xsl:when>
							<xsl:otherwise><xsl:value-of select="$temp_colspan"/></xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					<xsl:choose>
						<xsl:when test="$field/@fullName=''">
							<td colspan="{$colspan}" nowrap="1"><br /></td>
						</xsl:when>
						<xsl:otherwise>
							<td colspan="{$colspan}" nowrap="1">
                                <xsl:attribute name="style">
                                    <xsl:if test="$field/@format='Memo' and $field/@readOnly='true'">white-space: normal;</xsl:if>
                                </xsl:attribute>	
								<xsl:call-template name="cell_body">
									<xsl:with-param name="panel_id" select="$panel_id"/>
									<xsl:with-param name="cell" select="."/>
									<xsl:with-param name="columns" select="$columns"/>
									<xsl:with-param name="field" select="$field"/>
									<xsl:with-param name="panel" select="$panel"/>
									<xsl:with-param name="isConsole" select="$isConsole"/>
								</xsl:call-template>
							</td>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:for-each>
			</tr>
		</xsl:for-each>
		<tr class="space"><td colspan="{$columns}" class="formBottomSpace"></td></tr>
	</xsl:template>

	<xsl:template name="panel_form_body_visibleFields_label_left_of_control">
		<xsl:param name="table"/>
		<xsl:param name="panel_id"/>
		<xsl:param name="columns"/>
		<xsl:param name="panel"/>
		<xsl:param name="isConsole"/>
		
		<!-- std column widths, equal for all label & cell columns (default) -->
		<xsl:variable name="column_width" select="100 div ($columns * 2)"/>

		<!-- adjust label column width if <panel formLabelWidth="xx"> attribute is given -->
		<xsl:variable name="panel_formLabelWidth" select="$panel/@formLabelWidth"/>
		<xsl:variable name="label_width">
			<xsl:choose>
				<xsl:when test="$panel_formLabelWidth!=''"><xsl:value-of select="$panel_formLabelWidth div $columns"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$column_width"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="cell_width">
			<xsl:choose>
				<xsl:when test="$panel_formLabelWidth!=''"><xsl:value-of select="(100 - $panel_formLabelWidth) div $columns"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$column_width"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

        <xsl:if test="count($table/row) > 0">
            <tr class="space"><td colspan="{$columns * 2}" class="formTopSpace"></td></tr>
        </xsl:if>
		<xsl:for-each select="$table/row">
			<tr>
				<xsl:for-each select="cell">
					<xsl:variable name="field" select="key('panel_fields_array',@ref)"/>
					<xsl:variable name="temp_colspan" select="$columns div last()"/>
					<xsl:variable name="colspan">
						<xsl:choose>
							<xsl:when test="$temp_colspan &gt; 1"><xsl:value-of select="$temp_colspan * 2"/></xsl:when>
							<xsl:otherwise><xsl:value-of select="$temp_colspan"/></xsl:otherwise>
						</xsl:choose>
					</xsl:variable>

					<xsl:call-template name="label_container">
					    <xsl:with-param name="panel_id" select="$panel_id"/>
					    <xsl:with-param name="field" select="$field"/>
					    <xsl:with-param name="top" select="'false'"/>
					    <xsl:with-param name="colspan" select="$colspan"/>
					    <xsl:with-param name="column_width" select="$label_width"/>
					    <xsl:with-param name="isConsole" select="$isConsole"/>
					</xsl:call-template>

					<td nowrap="1" width="{$cell_width}%">
						<xsl:attribute name="colspan">
							<xsl:choose>
								<xsl:when test="$field/@showLabel='false'"><xsl:value-of select="number($colspan + 1)"/></xsl:when>
								<xsl:otherwise><xsl:value-of select="$colspan"/></xsl:otherwise>
							</xsl:choose>
						</xsl:attribute>
						<xsl:attribute name="align"><xsl:if test="$field/@showLabel='false'">left</xsl:if></xsl:attribute>
                        <xsl:attribute name="style">
                            <xsl:if test="$field/@format='Memo' and $field/@readOnly='true'">white-space: normal;</xsl:if>
                        </xsl:attribute>
						<xsl:call-template name="cell_body">
							<xsl:with-param name="panel_id" select="$panel_id"/>
							<xsl:with-param name="cell" select="."/>
							<xsl:with-param name="columns" select="$columns"/>
							<xsl:with-param name="field" select="$field"/>
							<xsl:with-param name="panel" select="$panel"/>
							<xsl:with-param name="isConsole" select="$isConsole"/>
						</xsl:call-template>
					</td>						
				</xsl:for-each>
			</tr>
		</xsl:for-each>
        <xsl:if test="count($table/row) > 0">
            <tr class="space"><td colspan="{$columns * 2}" class="formBottomSpace"></td></tr>
        </xsl:if>
	</xsl:template>

	<xsl:template name="label_container">
		<xsl:param name="panel_id"/>
		<xsl:param name="field"/>
		<xsl:param name="top"/>
		<xsl:param name="colspan"/>
		<xsl:param name="column_width"/>
		<xsl:param name="panel"/>
		<xsl:param name="isConsole"/>
		
		<xsl:choose>
			<xsl:when test="(count($field/ui) &lt; 0) and ($field/@fullName='')">
				<td colspan="{$colspan}" nowrap="1" width="{$column_width}%"><br /></td>
				<xsl:if test="$top='false'"><td colspan="{$colspan}" nowrap="1" width="{$column_width}%"><br /></td></xsl:if>
			</xsl:when>
			<xsl:when test="$field/@showLabel='false'"></xsl:when>
			<xsl:otherwise>
				<td nowrap="1" width="{$column_width}%">
					<xsl:attribute name="colspan"><xsl:if test="$top='true'"><xsl:value-of select="$colspan"/></xsl:if></xsl:attribute>
					<!-- cell label -->
					<xsl:call-template name="cell_label">
					    <xsl:with-param name="field" select="$field"/>
					    <xsl:with-param name="top" select="$top"/>
					    <xsl:with-param name="isConsole" select="$isConsole"/>
					</xsl:call-template>
					<xsl:variable name="format" select="$field/@format"/>
					<xsl:variable name="readOnly">
						<xsl:choose>
							<xsl:when test="$field/@readOnly"><xsl:value-of select="$field/@readOnly"/></xsl:when>
							<xsl:otherwise>false</xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					<xsl:if test="$format='Memo' and $readOnly='false'">
						<xsl:call-template name="form_field_actions_handler">
							<xsl:with-param name="panel_id" select="$panel_id"/>
							<xsl:with-param name="field" select="$field"/>
							<xsl:with-param name="cell" select="."/>
							<xsl:with-param name="fullName" select="$field/@fullName"/>
							<xsl:with-param name="defaultSelectVAction" select="'false'"/>
							<xsl:with-param name="panel" select="$panel"/>
						</xsl:call-template>
					</xsl:if>
				</td>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="panel_form_body_hiddenFields">
		<xsl:param name="hiddenFields"/>
		<xsl:param name="panel_id"/>
		<xsl:param name="columns"/>
		<tr style="display:none">
			<xsl:for-each select="$hiddenFields/cell">
				<xsl:variable name="field" select="key('panel_fields_array',@ref)"/>
				<td>
					<xsl:call-template name="cell_body">
						<xsl:with-param name="cell" select="."/>
						<xsl:with-param name="panel_id" select="$panel_id"/>
						<xsl:with-param name="columns" select="$columns"/>
						<xsl:with-param name="field" select="$field"/>
					</xsl:call-template>
				</td>
			</xsl:for-each>
			<td><br /></td>
		</tr>
	</xsl:template>

	<xsl:template name="cell_label">
		<xsl:param name="field"/>
		<xsl:param name="top"/>
		<xsl:param name="isConsole"/>
		
		<xsl:variable name="foreignKey">
                        <xsl:choose>
                                <xsl:when test="$field/@foreignKey"><xsl:value-of select="$field/@foreignKey"/></xsl:when>
                                <xsl:otherwise>false</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
                <xsl:variable name="validate_data">
                        <xsl:choose>
                                <xsl:when test="$field/@validate_data"><xsl:value-of select="$field/@validate_data"/></xsl:when>
                                <xsl:otherwise>false</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
                <xsl:variable name="inputFieldLabelCSS">
                        <xsl:choose>
                                <xsl:when test="$foreignKey='true' and $validate_data='true'">
                                    <xsl:choose>
                                        <xsl:when test="$top='true'">labelValidatedTop</xsl:when>
                                        <xsl:otherwise>labelValidated</xsl:otherwise>
                                    </xsl:choose>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:choose>
                                        <xsl:when test="$top='true'">labelTop</xsl:when>
                                        <xsl:otherwise>label</xsl:otherwise>
                                    </xsl:choose>
                                </xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<xsl:attribute name="class">
			<xsl:choose>
				<xsl:when test="$field/@labelClass!=''"><xsl:value-of select="$field/@labelClass"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$inputFieldLabelCSS"/></xsl:otherwise>
			</xsl:choose>
		</xsl:attribute>
		<xsl:attribute name="style">
			<xsl:value-of select="$field/@labelStyle"/>
		</xsl:attribute>

		<xsl:variable name="fullName">
			<xsl:choose>
				<xsl:when test="$field/@alias!=''"><xsl:value-of select="$field/@alias"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$field/@fullName"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:if test="$field/@singleLineHeading!='' or $field/title/text()!=''">
		      <xsl:choose>
			<xsl:when test="$field/title/text()!=''"><label for="{$fullName}"><xsl:value-of select="$field/title"/></label></xsl:when>
			<xsl:otherwise><label for="{$fullName}"><xsl:value-of select="$field/@singleLineHeading"/></label></xsl:otherwise>
		     </xsl:choose>
		     <xsl:if test="$field/@required='true'">
			<span style="font-size:10;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;color:red">*</span>
		     </xsl:if>
		     <xsl:text>:</xsl:text>
		</xsl:if>

	</xsl:template>

	<xsl:template name="cell_body">
		<xsl:param name="cell"/>
		<xsl:param name="panel_id"/>
		<xsl:param name="columns"/>
		<xsl:param name="field"/>
		<xsl:param name="panel"/>
		<xsl:param name="isConsole"/>
	
		<xsl:variable name="type" select="$field/@type"/>
		<xsl:variable name="format" select="$field/@format"/>
		<xsl:variable name="fullName">
			<xsl:choose>
				<xsl:when test="$field/@alias!=''"><xsl:value-of select="$field/@alias"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$field/@fullName"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="afmType" select="$field/@afmType"/>
		<xsl:choose>
			<!-- ui field -->
			<xsl:when test="count($field/ui) &gt; 0">
				<xsl:for-each select="$field/ui/*">
					<xsl:copy-of select="."/>
				</xsl:for-each>
			</xsl:when>
            
				<!-- normal -->
				<xsl:when test="$afmType!='2165' and $format!='Memo' and (count($field/enumeration/item) &lt;= 0) and $type!='java.sql.Date' and $type!='java.sql.Time' and $type!='java.lang.Double' and $type!='java.lang.Float' and $type!='java.lang.Integer'">
					<xsl:call-template name="normal_field_handler">
						<xsl:with-param name="panel_id" select="$panel_id"/>
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="value" select="$cell/@value"/>
						<xsl:with-param name="fieldClass" select="$field/@class"/>
						<xsl:with-param name="fieldStyle" select="$field/@style"/>
						<xsl:with-param name="cell" select="$cell"/>
						<xsl:with-param name="fullName" select="$fullName"/>
						<xsl:with-param name="panel" select="$panel"/>
					</xsl:call-template>
				</xsl:when>

				<!-- date -->
				<xsl:when test="$type='java.sql.Date'">
					<xsl:call-template name="date_field_handler">
						<xsl:with-param name="panel_id" select="$panel_id"/>
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="value" select="$cell/@value"/>
						<xsl:with-param name="fieldClass" select="$field/@class"/>
						<xsl:with-param name="fieldStyle" select="$field/@style"/>
						<xsl:with-param name="cell" select="$cell"/>
						<xsl:with-param name="fullName" select="$fullName"/>
						<xsl:with-param name="panel" select="$panel"/>
					</xsl:call-template>
				</xsl:when>

				<!-- time -->
				<xsl:when test="$type='java.sql.Time'">
					<xsl:call-template name="time_field_handler">
						<xsl:with-param name="panel_id" select="$panel_id"/>
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="value" select="$cell/@value"/>
						<xsl:with-param name="fieldClass" select="$field/@class"/>
						<xsl:with-param name="fieldStyle" select="$field/@style"/>
						<xsl:with-param name="cell" select="$cell"/>
						<xsl:with-param name="fullName" select="$fullName"/>
						<xsl:with-param name="panel" select="$panel"/>
					</xsl:call-template>
				</xsl:when>

				<!-- numeric -->
				<xsl:when test="(count($field/enumeration/item) = 0) and ($type='java.lang.Double' or $type='java.lang.Float' or $type='java.lang.Integer')">
					<xsl:call-template name="numeric_field_handler">
						<xsl:with-param name="panel_id" select="$panel_id"/>
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="value" select="$cell/@value"/>
						<xsl:with-param name="fieldClass" select="$field/@class"/>
						<xsl:with-param name="fieldStyle" select="$field/@style"/>
						<xsl:with-param name="cell" select="$cell"/>
						<xsl:with-param name="fullName" select="$fullName"/>
						<xsl:with-param name="panel" select="$panel"/>
					</xsl:call-template>
				</xsl:when>

				<!-- enum -->
				<xsl:when test="count($field/enumeration/item) &gt; 0">
					<xsl:call-template name="enum_field_handler">
						<xsl:with-param name="panel_id" select="$panel_id"/>
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="value" select="$cell/@value"/>
						<xsl:with-param name="fieldClass" select="$field/@class"/>
						<xsl:with-param name="fieldStyle" select="$field/@style"/>
						<xsl:with-param name="cell" select="$cell"/>
						<xsl:with-param name="fullName" select="$fullName"/>
						<xsl:with-param name="panel" select="$panel"/>
						<xsl:with-param name="isConsole" select="$isConsole"/>
					</xsl:call-template>
				</xsl:when>

				<!-- memo -->
				<xsl:when test="$format='Memo'">
					<xsl:call-template name="memo_field_handler">
						<xsl:with-param name="panel_id" select="$panel_id"/>
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="fieldClass" select="$field/@class"/>
						<xsl:with-param name="fieldStyle" select="$field/@style"/>
						<xsl:with-param name="value" select="$cell/@value"/>
						<xsl:with-param name="columns" select="$columns"/>
						<xsl:with-param name="cell" select="$cell"/>
						<xsl:with-param name="fullName" select="$fullName"/>
						<xsl:with-param name="panel" select="$panel"/>
					</xsl:call-template>
				</xsl:when>

				<!-- DOC -->
				<xsl:when test="$afmType='2165'">
					<xsl:call-template name="doc_field_handler">
						<xsl:with-param name="panel_id" select="$panel_id"/>
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="value" select="$cell/@value"/>
						<xsl:with-param name="fieldClass" select="$field/@class"/>
						<xsl:with-param name="fieldStyle" select="$field/@style"/>
						<xsl:with-param name="cell" select="$cell"/>
						<xsl:with-param name="fullName" select="$fullName"/>
						<xsl:with-param name="panel" select="$panel"/>
					</xsl:call-template>
				</xsl:when>

            <!-- custom field -->            
			<xsl:otherwise>
					<xsl:call-template name="custom_field_handler">
						<xsl:with-param name="panel_id" select="$panel_id"/>
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="value" select="$cell/@value"/>
						<xsl:with-param name="fieldClass" select="$field/@class"/>
						<xsl:with-param name="fieldStyle" select="$field/@style"/>
						<xsl:with-param name="cell" select="$cell"/>
						<xsl:with-param name="fullName" select="$fullName"/>
						<xsl:with-param name="panel" select="$panel"/>
					</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="custom_field_handler">
		<xsl:param name="panel_id"/>
		<xsl:param name="field"/>
		<xsl:param name="value"/>
		<xsl:param name="fieldClass"/>
        <xsl:param name="fieldStyle"/>
		<xsl:param name="cell"/>
		<xsl:param name="fullName"/>
		<xsl:param name="panel"/>

		 <xsl:variable name="useFieldClass">
                        <xsl:choose>
                                <xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
                                <xsl:otherwise>inputField</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>

        <input  name="{$fullName}" id="{$fullName}" type="hidden" size="20"  value="{$value}" title="{$fullName}"/>
        <span name="Show{$fullName}" id="Show{$fullName}" class="{$useFieldClass}" style="{$fieldStyle}"><xsl:value-of select="$value"/><xsl:value-of select="$whiteSpace"/></span>
        <!-- field's actions -->
        <xsl:call-template name="form_field_actions_handler">
            <xsl:with-param name="panel_id" select="$panel_id"/>
            <xsl:with-param name="field" select="$field"/>
            <xsl:with-param name="cell" select="$cell"/>
            <xsl:with-param name="fullName" select="$fullName"/>
            <xsl:with-param name="defaultSelectVAction" select="'false'"/>
            <xsl:with-param name="panel" select="$panel"/>
        </xsl:call-template>
	</xsl:template>

	<xsl:template name="normal_field_handler">
		<xsl:param name="panel_id"/>
		<xsl:param name="field"/>
		<xsl:param name="value"/>
		<xsl:param name="fieldClass"/>
                <xsl:param name="fieldStyle"/>
		<xsl:param name="cell"/>
		<xsl:param name="fullName"/>
		<xsl:param name="panel"/>

		 <xsl:variable name="useFieldClass">
                        <xsl:choose>
                                <xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
                                <xsl:otherwise>inputField</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>

		<xsl:variable name="readOnly">
                        <xsl:choose>
                                <xsl:when test="$field/@readOnly"><xsl:value-of select="$field/@readOnly"/></xsl:when>
                                <xsl:otherwise>false</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		 <xsl:variable name="maxlength" select="$field/@size"/>
		 <xsl:choose>
			<xsl:when test="$readOnly='false'">
				<xsl:choose>
					<xsl:when test="count($field/ui) &gt; 0">
						<xsl:for-each select="$field/ui/*">
							<xsl:copy-of select="."/>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<input maxlength="{$maxlength}" class="{$useFieldClass}" style="{$fieldStyle}" name="{$fullName}" id="{$fullName}" title="{$fullName}" type="text"   value="{$value}" tabIndex_off="{$cell/@tabIndex}">
							<xsl:variable name="onblur">validationInputs('<xsl:value-of select="$panel_id"/>','<xsl:value-of select="$fullName"/>');if(window.temp!=this.value)afm_form_values_changed=true;<xsl:value-of select="$field/@onblur"/></xsl:variable>
							<xsl:variable name="onchange">afm_form_values_changed=true;<xsl:value-of select="$field/@onchange"/></xsl:variable>
							<xsl:variable name="onfocus">window.temp=this.value;<xsl:value-of select="$field/@onfocus"/></xsl:variable>
							<xsl:call-template name="form_field_event_handlers">
								<xsl:with-param name="field" select="$field"/>
								<xsl:with-param name="onblur" select="$onblur"/>
								<xsl:with-param name="onchange" select="$onchange"/>
								<xsl:with-param name="onfocus" select="$onfocus"/>
							</xsl:call-template>
						</input>
					</xsl:otherwise>
				</xsl:choose>
				<!-- field's actions -->
				<xsl:call-template name="form_field_actions_handler">
					<xsl:with-param name="panel_id" select="$panel_id"/>
					<xsl:with-param name="field" select="$field"/>
					<xsl:with-param name="cell" select="$cell"/>
					<xsl:with-param name="fullName" select="$fullName"/>
					<xsl:with-param name="defaultSelectVAction" select="'false'"/>
					<xsl:with-param name="panel" select="$panel"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<input  name="{$fullName}" id="{$fullName}" type="hidden" size="20"  value="{$value}" title="{$fullName}"/>
				<span name="Show{$fullName}" id="Show{$fullName}" class="{$useFieldClass}" style="{$fieldStyle}"><xsl:value-of select="$value"/><xsl:value-of select="$whiteSpace"/></span>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="date_field_handler">
		<xsl:param name="panel_id"/>
		<xsl:param name="field"/>
		<xsl:param name="value"/>
		<xsl:param name="fieldClass"/>
                <xsl:param name="fieldStyle"/>
		<xsl:param name="cell"/>
		<xsl:param name="fullName"/>
		<xsl:param name="panel"/>

		 <xsl:variable name="useFieldClass">
                        <xsl:choose>
                                <xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
                                <xsl:otherwise>inputField</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>

		<xsl:variable name="readOnly">
                        <xsl:choose>
                                <xsl:when test="$field/@readOnly"><xsl:value-of select="$field/@readOnly"/></xsl:when>
                                <xsl:otherwise>false</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<xsl:variable name="hidden">
                        <xsl:choose>
                                <xsl:when test="$field/@hidden"><xsl:value-of select="$field/@hidden"/></xsl:when>
                                <xsl:otherwise>false</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>

		<xsl:choose>
			<xsl:when test="$readOnly='false'">
				<input class="{$useFieldClass}" style="{$fieldStyle}" type="text" size="20" name="{$fullName}" id="{$fullName}" value="{$value}" title="{$fullName}" tabIndex_off="{$cell/@tabIndex}">
					<xsl:variable name="onblur">validationAndConvertionDateInput(this, '<xsl:value-of select="$fullName"/>', null,'false', true,true);if(window.temp!=this.value)afm_form_values_changed=true;<xsl:value-of select="$field/@onblur"/></xsl:variable>
					<xsl:variable name="onchange">validationAndConvertionDateInput(this, '<xsl:value-of select="$fullName"/>', null,'false', true,true);afm_form_values_changed=true;<xsl:value-of select="$field/@onchange"/></xsl:variable>
					<xsl:variable name="onfocus">window.temp=this.value;<xsl:value-of select="$field/@onfocus"/></xsl:variable>
					<xsl:call-template name="form_field_event_handlers">
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="onblur" select="$onblur"/>
						<xsl:with-param name="onchange" select="$onchange"/>
						<xsl:with-param name="onfocus" select="$onfocus"/>
					</xsl:call-template>
				</input>
				<!-- field's actions such as select value -->
                <xsl:if test="$hidden='false'">
                    <xsl:call-template name="form_field_actions_handler">
                        <xsl:with-param name="panel_id" select="$panel_id"/>
                        <xsl:with-param name="field" select="$field"/>
                        <xsl:with-param name="cell" select="$cell"/>
                        <xsl:with-param name="fullName" select="$fullName"/>
                        <xsl:with-param name="defaultSelectVAction" select="'true'"/>
                        <xsl:with-param name="panel" select="$panel"/>
                    </xsl:call-template>
                </xsl:if>
                <!-- new line -->
				<br />
				<!-- show date in its long format: id and name must be fixed pattern which will be used in javascript -->
				<span id="Show{$fullName}_long" name="Show{$fullName}_long" class="showingDateAndTimeLongFormat"><xsl:value-of select="$whiteSpace"/></span>
			</xsl:when>
			<xsl:otherwise>
				<input type="hidden" size="20" NAME="{$fullName}" id="{$fullName}" value="{$value}" title="{$fullName}"/>
				<span  id="Show{$fullName}_long" name="Show{$fullName}_long" class="inputField"><xsl:value-of select="$whiteSpace"/></span>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	 <xsl:template name="time_field_handler">
		<xsl:param name="panel_id"/>
		<xsl:param name="field"/>
		<xsl:param name="value"/>
		<xsl:param name="fieldClass"/>
		<xsl:param name="fieldStyle"/>
		<xsl:param name="cell"/>
		<xsl:param name="fullName"/>
		<xsl:param name="panel"/>

		 <xsl:variable name="useFieldClass">
                        <xsl:choose>
                                <xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
                                <xsl:otherwise>inputField</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<xsl:variable name="readOnly">
                        <xsl:choose>
                                <xsl:when test="$field/@readOnly"><xsl:value-of select="$field/@readOnly"/></xsl:when>
                                <xsl:otherwise>false</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>

		<!-- trucate time value to only get HH:MM -->
		<xsl:variable name="original_time_value" select="$value"/>
		<xsl:variable name="trucated_time_value">
			<xsl:choose>
				<xsl:when test="$original_time_value=''">
					<xsl:value-of select="$original_time_value"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="substring($original_time_value,1,5)"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:choose>
			<xsl:when test="$readOnly='false'">
				<input class="{$useFieldClass}" style="{$fieldStyle}" type="text" size="20" name="{$fullName}" id="{$fullName}" value="{$trucated_time_value}" title="{$fullName}" tabIndex_off="{$cell/@tabIndex}">
					<xsl:variable name="onchange">validationAndConvertionTimeInput(this, '<xsl:value-of select="$fullName"/>', null,"false",true, true);afm_form_values_changed=true;<xsl:value-of select="$field/@onchange"/></xsl:variable>
					<xsl:variable name="onfocus">window.temp=this.value;<xsl:value-of select="$field/@onfocus"/></xsl:variable>
					<xsl:call-template name="form_field_event_handlers">
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="onchange" select="$onchange"/>
						<xsl:with-param name="onfocus" select="$onfocus"/>
					</xsl:call-template>
				</input>
				<xsl:call-template name="form_field_actions_handler">
					<xsl:with-param name="panel_id" select="$panel_id"/>
					<xsl:with-param name="field" select="$field"/>
					<xsl:with-param name="cell" select="$cell"/>
					<xsl:with-param name="fullName" select="$fullName"/>
					<xsl:with-param name="defaultSelectVAction" select="'false'"/>
					<xsl:with-param name="panel" select="$panel"/>
				</xsl:call-template>
				<!-- new line -->
				<br />
				<!-- show time with AM/PM:  id and name must be fixed pattern which will be used in javascript -->
				<span id="Show{$fullName}" name="Show{$fullName}"  class="showingDateAndTimeLongFormat"><xsl:value-of select="$whiteSpace"/></span>
			</xsl:when>
			<xsl:otherwise>
				<input type="hidden" size="20" name="{$fullName}" id="{$fullName}" value="{$trucated_time_value}" title="{$fullName}"/>
				<span class="{$useFieldClass}" style="{$fieldStyle}" id="Show{$fullName}_short" name="Show{$fullName}_short"><xsl:value-of select="$trucated_time_value"/><xsl:value-of select="$whiteSpace"/></span>
			</xsl:otherwise>
		</xsl:choose>
		<!-- Hidden field to store time in 24 hour format -->
		<input type="hidden" size="20" id="Stored{$fullName}" name="Stored{$fullName}" value="{$original_time_value}" title="Stored{$fullName}"/>
	</xsl:template>	

	<xsl:template name="numeric_field_handler">
		<xsl:param name="panel_id"/>
		<xsl:param name="field"/>
		<xsl:param name="value"/>
		<xsl:param name="fieldClass"/>
		<xsl:param name="fieldStyle"/>
		<xsl:param name="cell"/>
		<xsl:param name="fullName"/>
		<xsl:param name="panel"/>

		 <xsl:variable name="useFieldClass">
                        <xsl:choose>
                                <xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
                                <xsl:otherwise>inputField</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<xsl:variable name="readOnly">
                        <xsl:choose>
                                <xsl:when test="$field/@readOnly"><xsl:value-of select="$field/@readOnly"/></xsl:when>
                                <xsl:otherwise>false</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>

		<xsl:variable name="locale-decimal-separator" select="//locale/@decimalSeparator"/>
		<xsl:variable name="temp-record-value" select="translate($value,'.',$locale-decimal-separator)"/>
		<xsl:choose>
			<xsl:when test="$readOnly='false'">
				<input class="{$useFieldClass}" style="{$fieldStyle}" name="{$fullName}" id="{$fullName}" type="text" size="20"  value="{$temp-record-value}" title="{$fullName}" tabIndex_off="{$cell/@tabIndex}">
					<xsl:variable name="onblur">validationInputs('<xsl:value-of select="$panel_id"/>','<xsl:value-of select="$fullName"/>');if(window.temp!=this.value)afm_form_values_changed=true;<xsl:value-of select="$field/@onblur"/></xsl:variable>
					<xsl:variable name="onchange">afm_form_values_changed=true;<xsl:value-of select="$field/@onchange"/></xsl:variable>
					<xsl:variable name="onfocus">window.temp=this.value;<xsl:value-of select="$field/@onfocus"/></xsl:variable>
					<xsl:call-template name="form_field_event_handlers">
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="onblur" select="$onblur"/>
						<xsl:with-param name="onchange" select="$onchange"/>
						<xsl:with-param name="onfocus" select="$onfocus"/>
					</xsl:call-template>
				</input>
				<!-- actions  -->
				<xsl:call-template name="form_field_actions_handler">
					<xsl:with-param name="panel_id" select="$panel_id"/>
					<xsl:with-param name="field" select="$field"/>
					<xsl:with-param name="cell" select="$cell"/>
					<xsl:with-param name="fullName" select="$fullName"/>
					<xsl:with-param name="defaultSelectVAction" select="'false'"/>
					<xsl:with-param name="panel" select="$panel"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<input name="{$fullName}" id="{$fullName}" type="hidden" size="20"  value="{$temp-record-value}" title="{$fullName}"/>
				<span  class="{$useFieldClass}" style="{$fieldStyle}" id="Show{$fullName}_numeric" name="Show{$fullName}_numeric"><xsl:value-of select="$temp-record-value"/><xsl:value-of select="$whiteSpace"/></span>
			</xsl:otherwise>
		</xsl:choose>
        </xsl:template>

	 <xsl:template name="enum_field_handler">
		<xsl:param name="panel_id"/>
		<xsl:param name="field"/>
		<xsl:param name="value"/>
		<xsl:param name="fieldClass"/>
		<xsl:param name="fieldStyle"/>
		<xsl:param name="cell"/>
		<xsl:param name="fullName"/>
		<xsl:param name="panel"/>
		<xsl:param name="isConsole"/>
		
		<xsl:variable name="useFieldClass">
                        <xsl:choose>
                                <xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
                                <xsl:otherwise>inputField_box</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<xsl:variable name="readOnly">
                        <xsl:choose>
                                <xsl:when test="$field/@readOnly"><xsl:value-of select="$field/@readOnly"/></xsl:when>
                                <xsl:otherwise>false</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>

		<xsl:choose>
			<xsl:when test="$readOnly='false'">
				<select class="{$useFieldClass}" style="{$fieldStyle}" name="{$fullName}" title="{$fullName}" id="{$fullName}" tabIndex_off="{$cell/@tabIndex}">
					<xsl:variable name="onblur">if(window.temp!=this.value)afm_form_values_changed=true;<xsl:value-of select="$field/@onblur"/></xsl:variable>
					<xsl:variable name="onchange">afm_form_values_changed=true;<xsl:value-of select="$field/@onchange"/></xsl:variable>
					<xsl:variable name="onfocus">window.temp=this.value;<xsl:value-of select="$field/@onfocus"/></xsl:variable>
					<xsl:call-template name="form_field_event_handlers">
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="onchange" select="$onchange"/>
						<xsl:with-param name="onblur" select="$onblur"/>
						<xsl:with-param name="onfocus" select="$onfocus"/>
					</xsl:call-template>
					<xsl:if test="$isConsole='true' and $value=''">
						<option selected="1" value="--NULL--"></option>
					</xsl:if>
					<xsl:for-each select="$field/enumeration/item">
						<xsl:choose>
							<xsl:when test="$value=@value">
								<option selected="1" value="{@value}"><xsl:value-of select="@displayValue"/></option>
							</xsl:when>
							<xsl:otherwise>
								<option value="{@value}"><xsl:value-of select="@displayValue"/></option>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:for-each>
				</select>
				<xsl:call-template name="form_field_actions_handler">
					<xsl:with-param name="panel_id" select="$panel_id"/>
					<xsl:with-param name="field" select="$field"/>
					<xsl:with-param name="cell" select="$cell"/>
					<xsl:with-param name="fullName" select="$fullName"/>
					<xsl:with-param name="defaultSelectVAction" select="'false'"/>
					<xsl:with-param name="panel" select="$panel"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
                <span name="Show{$fullName}" id="Show{$fullName}" class="inputField" style="{$fieldStyle}"><xsl:value-of select="@displayValue"/><xsl:value-of select="$whiteSpace"/></span>		
				<select disabled="1" class="{$useFieldClass}" style="{$fieldStyle}; display: none;" name="{$fullName}" title="{$fullName}" id="{$fullName}">
					<xsl:for-each select="$field/enumeration/item">
						<xsl:choose>
							<xsl:when test="$value=@value">
								<option selected="1" value="{@value}"><xsl:value-of select="@displayValue"/></option>
							</xsl:when>
							<xsl:otherwise>
								<option value="{@value}"><xsl:value-of select="@displayValue"/></option>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:for-each>
				</select>			
			</xsl:otherwise>
		</xsl:choose>
        </xsl:template>

	 <xsl:template name="memo_field_handler">
		<xsl:param name="panel_id"/>
		<xsl:param name="field"/>
		<xsl:param name="value"/>
		<xsl:param name="fieldClass"/>
		<xsl:param name="fieldStyle"/>
		<xsl:param name="columns"/>
		<xsl:param name="cell"/>
		<xsl:param name="fullName"/>
		<xsl:param name="panel"/>

		<xsl:variable name="useFieldClass">
                        <xsl:choose>
                                <xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
                                <xsl:otherwise>defaultEditForm_textareaABData</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<xsl:variable name="useFieldStyle">
                        <xsl:choose>
                                <xsl:when test="string-length($fieldStyle) &gt; 0"><xsl:value-of select="$fieldStyle"/></xsl:when>
                                <xsl:otherwise>height:50;width:<xsl:value-of select="$columns * 250"/></xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<xsl:variable name="readOnly">
                        <xsl:choose>
                                <xsl:when test="$field/@readOnly"><xsl:value-of select="$field/@readOnly"/></xsl:when>
                                <xsl:otherwise>false</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<xsl:choose>
			<xsl:when test="$readOnly='false'">
				<textarea  class="{$useFieldClass}" style="{$useFieldStyle}" id="{$fullName}" name="{$fullName}" wrap="PHYSICAL" tabIndex_off="{$cell/@tabIndex}">
					<xsl:variable name="onkeydown">checkMemoMaxSize(this, '<xsl:value-of select="$field/@size"/>');<xsl:value-of select="$field/@onkeydown"/></xsl:variable>
					<xsl:variable name="onkeyup">checkMemoMaxSize(this, '<xsl:value-of select="$field/@size"/>');<xsl:value-of select="$field/@onkeyup"/></xsl:variable>
					<xsl:variable name="onblur">if(window.temp!=this.value)afm_form_values_changed=true;<xsl:value-of select="$field/@onblur"/></xsl:variable>
					<xsl:variable name="onchange">afm_form_values_changed=true;<xsl:value-of select="$field/@onchange"/></xsl:variable>
					<xsl:variable name="onfocus">window.temp=this.value;<xsl:value-of select="$field/@onfocus"/></xsl:variable>
					<xsl:call-template name="form_field_event_handlers">
						<xsl:with-param name="field" select="$field"/>
						<xsl:with-param name="onkeydown" select="$onkeydown"/>
						<xsl:with-param name="onkeyup" select="$onkeyup"/>
						<xsl:with-param name="onblur" select="$onblur"/>
						<xsl:with-param name="onchange" select="$onchange"/>
						<xsl:with-param name="onfocus" select="$onfocus"/>
					</xsl:call-template>
					<xsl:value-of select="$value"/><xsl:value-of select="$whiteSpace"/>
				</textarea>
			</xsl:when>
			<xsl:otherwise>
				<input class="{$useFieldClass}" type="hidden" style="{$fieldStyle}" id="{$fullName}" name="{$fullName}" readonly="1" wrap="PHYSICAL" value="{$value}" title="{$fullName}" />
				<div class="defaultEditForm_textareaABData_readonly" id="Show{$fullName}" name="Show{$fullName}">
					<xsl:value-of select="$value"/><xsl:value-of select="$whiteSpace"/>
				</div>
			</xsl:otherwise>
		</xsl:choose>
        </xsl:template>

	<xsl:template name="doc_field_handler">
		<xsl:param name="panel_id"/>
              	<xsl:param name="field"/>
		<xsl:param name="value"/>
		<xsl:param name="fieldClass"/>
		<xsl:param name="fieldStyle"/>
		<xsl:param name="cell"/>
		<xsl:param name="fullName"/>
		<xsl:param name="panel"/>

		 <xsl:variable name="useFieldClass">
                        <xsl:choose>
                                <xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
                                <xsl:otherwise>inputField</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<xsl:variable name="readOnly">
                        <xsl:choose>
                                <xsl:when test="$field/@readOnly"><xsl:value-of select="$field/@readOnly"/></xsl:when>
                                <xsl:otherwise>false</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<input  class="{$useFieldClass}" style="{$fieldStyle}" name="{$fullName}" id="{$fullName}" type="text"  value="{$value}" title="{$fullName}" tabIndex_off="{$cell/@tabIndex}">
			<xsl:variable name="onkeydown">return false;<xsl:value-of select="$field/@onkeydown"/></xsl:variable>
			<xsl:variable name="onkeypress">return false;<xsl:value-of select="$field/@onkeypress"/></xsl:variable>
			<xsl:variable name="oncontextmenu">return false;<xsl:value-of select="$field/@oncontextmenu"/></xsl:variable>
			<xsl:variable name="onblur">if(window.temp!=this.value)afm_form_values_changed=true;<xsl:value-of select="$field/@onblur"/></xsl:variable>
			<xsl:variable name="onchange">afm_form_values_changed=true;<xsl:value-of select="$field/@onchange"/></xsl:variable>
			<xsl:variable name="onfocus">window.temp=this.value;<xsl:value-of select="$field/@onfocus"/></xsl:variable>
			<xsl:call-template name="form_field_event_handlers">
				<xsl:with-param name="field" select="$field"/>
				<xsl:with-param name="onkeydown" select="$onkeydown"/>
				<xsl:with-param name="onkeypress" select="$onkeypress"/>
				<xsl:with-param name="oncontextmenu" select="$oncontextmenu"/>
				<xsl:with-param name="onblur" select="$onblur"/>
				<xsl:with-param name="onchange" select="$onchange"/>
				<xsl:with-param name="onfocus" select="$onfocus"/>
			</xsl:call-template>
		</input>
        
        <!-- field's actions -->
        <xsl:call-template name="form_field_actions_handler">
            <xsl:with-param name="panel_id" select="$panel_id"/>
            <xsl:with-param name="field" select="$field"/>
            <xsl:with-param name="cell" select="$cell"/>
            <xsl:with-param name="fullName" select="$fullName"/>
            <xsl:with-param name="defaultSelectVAction" select="'false'"/>
            <xsl:with-param name="panel" select="$panel"/>
        </xsl:call-template>
    </xsl:template>

	<xsl:template name="form_field_event_handlers">
              	<xsl:param name="field"/>
		<xsl:param name="onblur"/>
		<xsl:param name="onfocus"/>
		<xsl:param name="onkeydown"/>
		<xsl:param name="onkeyup"/>
		<xsl:param name="onchange"/>
		<xsl:param name="onkeypress"/>
		<xsl:param name="oncontextmenu"/>
		<xsl:param name="onmouseup"/>
		<xsl:param name="onmousedown"/>

		<xsl:choose>
			<xsl:when test="$field/@onblur!=''">
				<xsl:attribute name="onblur"><xsl:value-of select="$field/@onblur"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="$onblur!=''">
					<xsl:attribute name="onblur"><xsl:value-of select="$onblur"/></xsl:attribute>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="$field/@onfocus!=''">
				<xsl:attribute name="onfocus"><xsl:value-of select="$field/@onfocus"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="$onfocus!=''">
					<xsl:attribute name="onfocus"><xsl:value-of select="$onfocus"/></xsl:attribute>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="$field/@onkeyup!=''">
				<xsl:attribute name="onkeyup"><xsl:value-of select="$field/@onkeyup"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="$onkeyup!=''">
					<xsl:attribute name="onkeyup"><xsl:value-of select="$onkeyup"/></xsl:attribute>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="$field/@onkeydown!=''">
				<xsl:attribute name="onkeydown"><xsl:value-of select="$field/@onkeydown"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="$onkeydown!=''">
					<xsl:attribute name="onkeydown"><xsl:value-of select="$onkeydown"/></xsl:attribute>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="$field/@onchange!=''">
				<xsl:attribute name="onchange"><xsl:value-of select="$field/@onchange"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="$onchange!=''">
					<xsl:attribute name="onchange"><xsl:value-of select="$onchange"/></xsl:attribute>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="$field/@onkeypress!=''">
				<xsl:attribute name="onkeypress"><xsl:value-of select="$field/@onkeypress"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="$onkeypress!=''">
					<xsl:attribute name="onkeypress"><xsl:value-of select="$onkeypress"/></xsl:attribute>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="$field/@oncontextmenu!=''">
				<xsl:attribute name="oncontextmenu"><xsl:value-of select="$field/@oncontextmenu"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="$oncontextmenu!=''">
					<xsl:attribute name="oncontextmenu"><xsl:value-of select="$oncontextmenu"/></xsl:attribute>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="$field/@onmouseup!=''">
				<xsl:attribute name="onmouseup"><xsl:value-of select="$field/@onmouseup"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="$onmouseup!=''">
					<xsl:attribute name="onmouseup"><xsl:value-of select="$onmouseup"/></xsl:attribute>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="$field/@onmousedown!=''">
				<xsl:attribute name="onmousedown"><xsl:value-of select="$field/@onmousedown"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="$onmousedown!=''">
					<xsl:attribute name="onmousedown"><xsl:value-of select="$onmousedown"/></xsl:attribute>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="form_field_actions_handler">
		<xsl:param name="panel_id"/>
        <xsl:param name="field"/>
		<xsl:param name="cell"/>
		<xsl:param name="fullName"/>
		<xsl:param name="defaultSelectVAction"/>
		<xsl:param name="panel"/>

		<xsl:variable name="bShowSelectV">
			<xsl:choose>
				<xsl:when test="$field/@showSelectValueAction!=''"><xsl:value-of select="$field/@showSelectValueAction"/></xsl:when>
				<xsl:otherwise>true</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:if test="$defaultSelectVAction='true'">
			<!-- default select value action -->
			<xsl:variable name="selectVAction" select="//forFields/field/afmAction[@type='selectValue']"/>
			<xsl:variable name="selectVClass">
				<xsl:choose>
					<xsl:when test="count($selectVAction) &gt; 0 and $selectVAction/@class!=''"><xsl:value-of select="$selectVAction/@class"/></xsl:when>
					<xsl:otherwise>selectValue_Button</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<xsl:if test="($bShowSelectV='true') and (count($field/afmAction) &lt;= 0)">
				<xsl:choose>
					<xsl:when test="$field/@type = 'java.sql.Date'">
						<!-- Calendar graphic -->
						<input type="image" class="selectValue_Button" title="Click to Display Date Selector" id="AFMCALENDAR_{$fullName}" name="AFMCALENDAR_{$fullName}" src="{$abSchemaSystemGraphicsFolder}/calendar.gif" onclick="Calendar.getController('{$fullName}','{$abSchemaSystemGraphicsFolder}'); return false;"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:variable name="enablePrefix">
							<xsl:choose>
								<xsl:when test="$field/@enablePrefix"><xsl:value-of select="$field/@enablePrefix"/></xsl:when>
								<xsl:otherwise>false</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						<!-- Ellipses graphic -->
						<input type="image" class="selectValue_Button" title="Click to Display Selection List" src="{$abSchemaSystemGraphicsFolder}/ab-icons-ellipses.gif" border="0" onclick="sendSelectValueRequest('{$fullName}','{$field/@table}','{$field/@name}','','',{$enablePrefix})"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:if>
		</xsl:if>
		<xsl:for-each select="$field/afmAction">
			<xsl:call-template name="helper_afmAction">
				<xsl:with-param name="afmAction" select="."/>
				<xsl:with-param name="form" select="$panel_id"/>
				<xsl:with-param name="bData" select="'true'"/>
				<xsl:with-param name="buttonClass" select="'selectValue_Button'"/>
				<xsl:with-param name="buttonStyle" select="@style"/>
                <xsl:with-param name="tabIndex" select="number($cell/@tabIndex) + position()"/>
			</xsl:call-template>
		</xsl:for-each>
	</xsl:template>
</xsl:stylesheet>
