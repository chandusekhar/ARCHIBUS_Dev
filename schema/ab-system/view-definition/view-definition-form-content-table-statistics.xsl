<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle statistics -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables for this xslt -->
	<xsl:variable name="items" select="'items'"/>
	<xsl:variable name="title" select="'title'"/>
	<xsl:variable name="fields" select="'fields'"/>
	<xsl:variable name="tables" select="'tables'"/>
	<xsl:variable name="operators" select="'operators'"/>
	<xsl:variable name="sql" select="'sql'"/>
	<xsl:variable name="bApply" select="'bApply'"/>
	<xsl:variable name="EditArea" select="'EditArea'"/>
	<xsl:variable name="TableArea" select="'TableArea'"/>
	<xsl:variable name="FieldArea" select="'FieldArea'"/>
	<xsl:variable name="SQLArea" select="'SQLArea'"/>
	<xsl:variable name="OperatorArea" select="'OperatorArea'"/>
	<xsl:variable name="EditOKButton" select="'EditOKButton'"/>
	<xsl:variable name="EditCancelButton" select="'EditCancelButton'"/>
	<xsl:variable name="cols-textarea" select="'38'"/>
	<xsl:variable name="rows-textarea" select="'3'"/>
	<xsl:variable name="countNumericField" select="count(/*/afmTableGroup/dataSource/data/availableFields/field)"/>
	<xsl:variable name="up" translatable="true">Up</xsl:variable>
	<xsl:variable name="down" translatable="true">Down</xsl:variable>	
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- to use MoveUpOrDOwnItems() in common-sort-visiblefields.js -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common-sort-visiblefields.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-table-statistics.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body" onload="checkOnLoad(true, {$countNumericField})" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>

			<!-- javascript section in output HTML -->
			<xsl:variable name="statisticsPath" select="//afmTableGroup/dataSource/data/statistics/statistic"/>
			<script language="javascript">
				<xsl:for-each select="$statisticsPath">
					<xsl:variable name="index" select="concat('item',position())"/>
					setUpArrSatistics('<xsl:value-of select="$index"/>', new Array('<xsl:value-of select="title"/>','<xsl:value-of select="@op"/>','<xsl:value-of select="concat(./field/@table,'.',./field/@name)"/>','<xsl:value-of select="@sql"/>','<xsl:value-of select="@applyAllRestrictions"/>'));
				</xsl:for-each>
				<xsl:text>////overwrite javascript variables</xsl:text>
				EditAreaID='<xsl:value-of select="$EditArea"/>';
				FieldAreaID='<xsl:value-of select="$FieldArea"/>';
				TableAreaID='<xsl:value-of select="$TableArea"/>';
				SQLAreaID='<xsl:value-of select="$SQLArea"/>';
				OperatorAreaID='<xsl:value-of select="$OperatorArea"/>';
				afmInputsFormName='<xsl:value-of select="$afmInputsForm"/>';
				itemsName='<xsl:value-of select="$items"/>';
				titleName='<xsl:value-of select="$title"/>';
				fieldsName='<xsl:value-of select="$fields"/>';
				tablesName='<xsl:value-of select="$tables"/>';
				operatorsName='<xsl:value-of select="$operators"/>';
				sqlName='<xsl:value-of select="$sql"/>';
				bApplyName='<xsl:value-of select="$bApply"/>';
				EditOKButtonName='<xsl:value-of select="$EditOKButton"/>';
				EditCancelButtonName='<xsl:value-of select="$EditCancelButton"/>';
				afmHiddenFormName='<xsl:value-of select="$afmHiddenForm"/>';
				xmlName='<xsl:value-of select="$xml"/>';
				<xsl:text>////</xsl:text>
			</script>
			<table width="100%">
				<!-- a form to handle user's inputs -->
				<Form name="{$afmInputsForm}">
					<tr><td>
						<xsl:call-template name="AfmTableGroup">
							<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
						</xsl:call-template>
					</td></tr>
					<tr><td>
						<!-- template: ok-and-cancel is in ab-actions-bar.xsl -->
						<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='applyStatistics']"/>
						<xsl:variable name="CANCEL" select="//afmTableGroup/afmAction[@type='cancel']"/>
						<xsl:variable name="TYPE" select="1"/>
						<xsl:call-template name="ok-and-cancel">
							<xsl:with-param name="OK" select="$OK"/>
							<xsl:with-param name="CANCEL" select="$CANCEL"/>
							<xsl:with-param name="TYPE" select="$TYPE"/>
							<xsl:with-param name="newWindowSettings" select="''"/>
						</xsl:call-template>
					</td></tr>
				</Form>
			</table>
			<!-- calling common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>

	<!-- xsl template: AfmTableGroup -->
	<xsl:template name="AfmTableGroup">
		<xsl:param name="afmTableGroup"/>
		<xsl:variable name="statistics_node_path" select="$afmTableGroup/dataSource/data/statistics"/>
		<table  align="center">
			<tr align="center"><td>
				<FIELDSET>
					<LEGEND class="legendTitle" translatable="true">Statistics:</LEGEND>
					<table align="center" height="275">
						<tr><td>
							<select class="selectListWithWidth" id="{$items}" name="{$items}" size="6" onchange="checkOnLoad(false)">
								<xsl:for-each select="$statistics_node_path/statistic">
									<xsl:variable name="index" select="position()"/>
									<xsl:choose>
										<xsl:when test="$index=1">
											<option value="item{$index}" selected="1"><xsl:value-of select="title"/></option>
										</xsl:when>
										<xsl:otherwise>
											<option value="item{$index}"><xsl:value-of select="title"/></option>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:for-each>
								<option value=""></option>
							</select>
						</td>
						<td align="center" valign="middle">
								<table align="center" valign="middle">
									<tr><td  nowrap="1" class="cursorSelector"><img alt="{$up}" src="{$abSchemaSystemGraphicsFolder}/up.gif" onclick='MoveUpOrDOwnItems(true, "{$items}")'/>
									</td></tr>
									<tr><td  nowrap="1" class="cursorSelector"><img alt="{$down}" src="{$abSchemaSystemGraphicsFolder}/dn.gif"  onclick='MoveUpOrDOwnItems(false, "{$items}")'/>
									</td></tr>
								</table>
						</td></tr>
						<tr><td  align="left">
							<table align="left">
								<tr>
									<td class="AbActionButtonForm" nowrap="1"><A href="javascript:onAdd()"><span translatable="true">Add New Statistic</span></A></td>
									<td class="AbActionButtonForm" nowrap="1"><A href="javascript:onItemDelete()"><span translatable="true">Delete Statistic</span></A></td>
								</tr>
							</table>
						</td></tr>
					</table>
				</FIELDSET>
			</td>
			<td>
				<FIELDSET>
					<LEGEND class="legendTitle" translatable="true">Add or Edit Statistic:</LEGEND>
					<div id="EditArea">
					<table align="center"  height="275">
						<tr><td align="center">
							<table>
								<tr><td>
									<table><tr>
										<td><span class="legendTitle" translatable="true">Title</span><font color="red">*</font>:</td></tr>
										<tr><td><input class="inputField" name="{$title}" type="text" size="40" value="{$statistics_node_path/statistic[position()=1]/title}" onkeypress="return disableInputEnterKeyEvent( event)"/></td>
									</tr></table>
								</td></tr>
								<tr><td>
									<div id="{$OperatorArea}">
										<table><tr>
											<td class="legendTitle" translatable="true">Select Operator:</td></tr>
											<tr><td>
												<select class="inputField_box" name="{$operators}" onchange="setUpOperator(this)">
													<xsl:for-each select="$afmTableGroup/operators/operator">
														<xsl:choose>
															<xsl:when test="$countNumericField">
																<xsl:choose>
																	<xsl:when test="$statistics_node_path/statistic[position()=1]/@op=@value">
																		<option selected="1" value="{@value}"><xsl:value-of select="."/></option>
																	</xsl:when>
																	<xsl:otherwise>
																		<option value="{@value}"><xsl:value-of select="."/></option>
																	</xsl:otherwise>
																</xsl:choose>
															</xsl:when>
															<xsl:otherwise>
																<xsl:if test="@value='COUNT-TABLE'"><option value="{@value}" selected="1"><xsl:value-of select="."/></option></xsl:if>
															</xsl:otherwise>
														</xsl:choose>
													</xsl:for-each>
												</select>
											</td>
										</tr></table>
									</div>
								</td></tr>
								<tr><td>
									<div id="{$TableArea}" style="display:none">
										<table><tr>
											<td class="legendTitle" translatable="true">Select Table:</td></tr>
											<tr><td>
												<select class="inputField_box" name="{$tables}">
													<xsl:for-each select="$afmTableGroup/dataSource/data/tables/table">
														<xsl:sort select="@title"/>
														<option value="{@name}."><xsl:value-of select="@title"/></option>
													</xsl:for-each>
												</select>
											</td>
										</tr></table>
									</div>
								</td></tr>
								<tr><td>
									<div id="{$FieldArea}">
										<table><tr>
											<td class="legendTitle" translatable="true">Select Field:</td></tr>
											<tr><td>
												<select class="inputField_box" name="{$fields}">
													<xsl:for-each select="$afmTableGroup/dataSource/data/availableFields/field">
														<xsl:sort select="@singleLineHeading"/>
														<option value="{@table}.{@name}"><xsl:value-of select="@singleLineHeading"/></option>
													</xsl:for-each>
												</select>
											</td>
										</tr></table>
									</div>
								</td></tr>
								<tr><td>
									<table><tr><td>
										<div id="{$SQLArea}" style="display:none">
											<table>
											<tr><td class="legendTitle" translatable="true">SQL Statement(Readonly):</td></tr>
											<tr><td>
												<textarea name="{$sql}" class="textareaABData" cols="{$cols-textarea}" rows="{$rows-textarea}" readonly="1"><xsl:value-of select="$whiteSpace"/></textarea>
											</td></tr></table>
										</div>
									</td></tr>
									<tr><td><table>
										<tr><td><input type="checkbox" name="{$bApply}"/></td>
										<td>
											<span class="legendTitle" translatable="true">Apply All Restrictions?</span>
										</td></tr></table>
									</td></tr></table>
								</td></tr>
							</table>
						</td></tr>
						<tr><td align="left">
							<table  align="left">
								<tr  align="left">
									<td class="AbActionButtonForm" nowrap="1"><A id="{$EditOKButton}" name="{$EditOKButton}" href="javascript:onEditOK()"><span translatable="true">Save Statistic</span></A></td>
									<td class="AbActionButtonForm" nowrap="1"><A id="{$EditCancelButton}" name="{$EditCancelButton}" href="javascript:resetEditArea()"><span translatable="true">Cancel</span></A></td>
								</tr>
							</table>
						</td></tr>
					</table>
					</div>
				</FIELDSET>
			</td></tr>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<xsl:include href="../xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>


