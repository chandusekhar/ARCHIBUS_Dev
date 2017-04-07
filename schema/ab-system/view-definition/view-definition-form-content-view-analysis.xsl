<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao
	3-03-2005
 -->
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
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-view-analysis.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<xsl:variable name="total_dimensions" select="//afmTableGroup/dataSource/data/mdx/preferences/@dimensions"/>
		<body class="body" onload="checkOnLoad(true, '{$total_dimensions}')" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<!--xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template-->

			<!-- javascript section in output HTML -->
			<xsl:variable name="mdxPreferences" select="//afmTableGroup/dataSource/data/mdx/preferences"/>
			<xsl:variable name="allMdxPath" select="//afmTableGroup/dataSource/data/mdx/preferences/measures/measure"/>
			<xsl:variable name="warningMessage1" select="//message[@name='warningMessage1']"/>
			<xsl:variable name="warningMessage2" select="//message[@name='warningMessage2']"/>
			<script language="javascript">

				<xsl:for-each select="$allMdxPath">
					<xsl:variable name="index" select="concat('item',position())"/>
					 setUpArrMDX('<xsl:value-of select="$index"/>', new Array('<xsl:value-of select="@name"/>','<xsl:value-of select="@aggregator"/>','<xsl:value-of select="@column"/>','<xsl:value-of select="@applyAllRestrictions"/>'));
				</xsl:for-each>
				
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
				countNumericField=<xsl:value-of select="$countNumericField"/>;
				chart_type  = '<xsl:value-of select="$mdxPreferences/@format"/>';

				warningMessage1="<xsl:value-of select="$warningMessage1"/>";
				warningMessage2="<xsl:value-of select="$warningMessage2"/>";
				
				chart_cat_label='<xsl:value-of select="$mdxPreferences/chartProperties/@categoryLabel"/>';
				chart_val_label='<xsl:value-of select="$mdxPreferences/chartProperties/@valueLabel"/>';
				chart_width = '<xsl:value-of select="$mdxPreferences/chartProperties/@width"/>';
				chart_height = '<xsl:value-of select="$mdxPreferences/chartProperties/@height"/>';
				chart_orientation = '<xsl:value-of select="$mdxPreferences/chartProperties/@orientation"/>';
				chart_show_cat_gridline='<xsl:value-of select="$mdxPreferences/chartProperties/@showCategoryGridline"/>';
				chart_show_val_gridline='<xsl:value-of select="$mdxPreferences/chartProperties/@showValueGridline"/>';
				chart_show_item_tooltip='<xsl:value-of select="$mdxPreferences/chartProperties/@showItemTooltip"/>';
				chart_show_item_label='<xsl:value-of select="$mdxPreferences/chartProperties/@showItemLabel"/>';
				chart_show_cat_label_by_way='<xsl:value-of select="$mdxPreferences/chartProperties/@showCategoryBy"/>';
				chart_show_legend='<xsl:value-of select="$mdxPreferences/chartProperties/@chartShowLegend"/>';
				chart_show_Title='<xsl:value-of select="$mdxPreferences/chartProperties/@chartShowTitle"/>';
				<xsl:for-each select="//afmTableGroup/operators[@name='operator']/operator">
					arrOperatorObject['<xsl:value-of select="@value"/>']='<xsl:value-of select="."/>';
				</xsl:for-each>
				<xsl:for-each select="//afmTableGroup/operators[@name='format']/operator">
					<xsl:if test="@value='pieChart_Row' or @value='pieChart_Col' or @value='PieChart3D_Row' or @value='PieChart3D_Col'">
						arrDisplayFormAsPieCharts['<xsl:value-of select="@value"/>']='<xsl:value-of select="."/>';
					</xsl:if>
				</xsl:for-each>
				display_format='<xsl:value-of select="//afmTableGroup/dataSource/data/mdx/preferences/@format"/>';
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
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='applyMdxPreferences']"/>
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
		<xsl:variable name="mdx_path" select="$afmTableGroup/dataSource/data/mdx/preferences/measures"/>
		<table  align="center">
			<tr align="center"><td>
				<FIELDSET>
					<LEGEND class="legendTitle" translatable="true">Measures:</LEGEND>
					<table align="center" height="275">
						<tr>
							<td colspan="2">
								<table>
									<tr>
										<td class="legendTitle" translatable="true">Select Analysis Type:</td>
									</tr>
									<tr>
										<td>
											<xsl:variable name="dimensions" select="$afmTableGroup/dataSource/data/mdx/preferences/@dimensions"/>
											<xsl:variable name="maxDimensions" select="$afmTableGroup/dataSource/data/mdx/preferences/@maxDimensions"/>
											<select class="selectListWithWidth" name="dimensions" id="dimensions" onchange="setUpAnalysisTypes()">
												<xsl:choose>
													<xsl:when test="$dimensions=0">
														<option value="0" selected="1"><xsl:value-of select="//message[@name='off']"/></option>
													</xsl:when>
													<xsl:otherwise>
														<option value="0"><xsl:value-of select="//message[@name='off']"/></option>
													</xsl:otherwise>
												</xsl:choose>
												<xsl:if test="$maxDimensions &gt;= 1">
													<xsl:choose>
														<xsl:when test="$dimensions=1">
															<option value="1" selected="1"><xsl:value-of select="//message[@name='list']"/></option>
														</xsl:when>
														<xsl:otherwise>
															<option value="1"><xsl:value-of select="//message[@name='list']"/></option>
														</xsl:otherwise>
													</xsl:choose>
												</xsl:if>
												<xsl:if test="$maxDimensions &gt; 1">
													<xsl:choose>
														<xsl:when test="$dimensions=2">
															<option value="2" selected="1"><xsl:value-of select="//message[@name='crosstable']"/></option>
														</xsl:when>
														<xsl:otherwise>
															<option value="2"><xsl:value-of select="//message[@name='crosstable']"/></option>
														</xsl:otherwise>
													</xsl:choose>
												</xsl:if>
											</select>
										</td>
									</tr>
									<tr>
										<td class="legendTitle" translatable="true">Select Display Format:</td>
									</tr>
									<tr>
										<td>
											<select class="selectListWithWidth" name="displayFormat" id="displayFormat" onchange="setChartConfig(this)">
												<xsl:for-each select="$afmTableGroup/operators[@name='format']/operator">
													<xsl:choose>
														<xsl:when test="$afmTableGroup/dataSource/data/mdx/preferences/@format=@value">
															<option value="{@value}" selected="1"><xsl:value-of select="."/></option>
														</xsl:when>
														<xsl:otherwise>
															<option value="{@value}"><xsl:value-of select="."/></option>
														</xsl:otherwise>
													</xsl:choose>
												</xsl:for-each>
											</select>
										</td>
									</tr>
									<tr>
										<td nowrap="1"  class="AbActionButtonForm"><a name="chartConfigAction" id="chartConfigAction"  style="cursor:hand" href="#" onclick="openChartConfig(this); return false;"><span translatable="true">Configure Chart</span></a></td>
									</tr>
								</table>
							</td>
						</tr>
						<!--tr><td colspan="2" class="legendTitle" translatable="true">Select one measure to edit:</td></tr-->
						<tr><td>
							<select class="selectListWithWidth" id="{$items}" name="{$items}" size="6" onchange="checkOnLoad(false, 'null')">
								<xsl:for-each select="$mdx_path/measure">
									<xsl:variable name="index" select="position()"/>
									<xsl:choose>
										<xsl:when test="$index=1">
											<option value="item{$index}" selected="1"><xsl:value-of select="@name"/></option>
										</xsl:when>
										<xsl:otherwise>
											<option value="item{$index}"><xsl:value-of select="@name"/></option>
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
						<tr><td colspan="2">
							<table align="left">
								<tr>
									<td class="AbActionButtonForm" nowrap="1"><A href="javascript:onAdd()" id="onAddButton" name="onAddButton"><span translatable="true">Add New Measure</span></A></td>
									<td class="AbActionButtonForm"  nowrap="1"><A href="javascript:onItemDelete()" id="onItemDeleteButton" name="onItemDeleteButton"><span translatable="true">Delete Measure</span></A></td>
								</tr>
							</table>
						</td></tr>
					</table>
				</FIELDSET>
			</td>
			<td>
				<FIELDSET>
					<LEGEND class="legendTitle" translatable="true">Add or Edit Measure:</LEGEND>
					<div id="EditArea">
					<table align="center"  height="275">
						<tr><td align="center">
							<table>
								<tr><td>
									<table><tr>
										<td><span class="legendTitle" translatable="true">Title</span><font color="red">*</font>:</td></tr>
										<tr><td><input class="inputField" name="{$title}" type="text" size="40" value="{$mdx_path/measure[position()=1]/@name}" onkeypress="return disableInputEnterKeyEvent( event)" onchange="validatingTitle(this)"/></td>
									</tr></table>
								</td></tr>
								<tr><td>
									<div id="{$OperatorArea}">
										<table><tr>
											<td class="legendTitle" translatable="true">Select Aggregating Operator:</td></tr>
											<tr><td>
												<select class="inputField_box" name="{$operators}" id="{$operators}" onchange="setUpOperator(this)">
													<xsl:for-each select="$afmTableGroup/operators[@name='operator']/operator">
														<xsl:choose>
															<xsl:when test="$mdx_path/measure[position()=1]/@aggregator=@value">
																<option selected="1" value="{@value}"><xsl:value-of select="."/></option>
															</xsl:when>
															<xsl:otherwise>
																<option value="{@value}"><xsl:value-of select="."/></option>
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
											<td class="legendTitle" translatable="true">Select Numeric Field:</td></tr>
											<tr><td>
												<select class="inputField_box" name="{$fields}">
													<xsl:for-each select="$afmTableGroup/dataSource/data/availableFields/field">
														<option value="{@name}"><xsl:value-of select="@singleLineHeading"/></option>
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
									<!--tr><td><table>
										<tr><td><input type="checkbox" name="{$bApply}"/></td>
										<td>
											<span class="legendTitle" translatable="true">Apply All Restrictions?</span>
										</td></tr></table>
									</td></tr--></table>
								</td></tr>
							</table>
						</td></tr>
						<tr><td align="left">
							<table  align="left">
								<tr>
									<td class="AbActionButtonForm" nowrap="1"><A id="{$EditOKButton}" name="{$EditOKButton}" href="javascript:onEditOK()"><span translatable="true">Save Measure</span></A></td>
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


