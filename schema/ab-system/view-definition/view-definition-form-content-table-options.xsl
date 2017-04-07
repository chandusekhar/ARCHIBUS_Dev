<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle table options -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- specified xslt variables for this xslt -->
	<xsl:variable name="title" select="'title'"/>
	<xsl:variable name="types" select="'types'"/>
	<xsl:variable name="formats" select="'formats'"/>
	<xsl:variable name="gridable" select="'gridable'"/>
	<xsl:variable name="printable" select="'printable'"/>
	<xsl:variable name="frame" select="'frame'"/>
	<!--xsl:variable name="tableWidth" select="'tableWidth'"/-->
	<xsl:variable name="defaultActions" select="'defaultActions'"/>
	<xsl:variable name="iColumnNumberArea_title" select="'iColumnNumberArea_title'"/>
	<xsl:variable name="iColumnNumberArea_field" select="'iColumnNumberArea_field'"/>
	<xsl:variable name="iColumnNumber" select="'iColumnNumberName'"/>
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-table-options.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body  class="body">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>

			<!-- javascript section in output HTML -->
			<xsl:variable name="statisticsPath" select="//afmTableGroup/dataSource/data/statistics/statistic"/>
			<script language="javascript">
				<xsl:text>////overwrite javascript variables</xsl:text>
				titleName='<xsl:value-of select="$title"/>';
				typesName='<xsl:value-of select="$types"/>';
				formatsName='<xsl:value-of select="$formats"/>';
				gridableName='<xsl:value-of select="$gridable"/>';
				printableName='<xsl:value-of select="$printable"/>';
				frameName='<xsl:value-of select="$frame"/>';
				defaultActionsName='<xsl:value-of select="$defaultActions"/>';
				iColumnNumberArea_title='<xsl:value-of select="$iColumnNumberArea_title"/>';
				iColumnNumberArea_field='<xsl:value-of select="$iColumnNumberArea_field"/>';
				iColumnNumberName='<xsl:value-of select="$iColumnNumber"/>';
				<xsl:text>////</xsl:text>
			</script>

			<table width="100%" valign="top">
				<Form name="{$afmInputsForm}">
					<tr><td>
						<xsl:call-template name="AfmTableGroup">
							<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
							<xsl:with-param name="afmTableTypes" select="//types"/>
							<xsl:with-param name="afmTableFormats" select="//formats"/>
							<xsl:with-param name="afmTableColumns" select="//columns"/>
						</xsl:call-template>
					</td></tr>
					<tr><td aligh="center">
						<!-- instruction -->
						<table valign="bottom" aligh="center" width="100%">
							<tr valign="bottom"><td valign="bottom"  class="instruction">
							<p><xsl:value-of select="/*/afmTableGroup/message[@name='instruction']"/></p>
							</td></tr>
						</table>
					</td></tr>
					<tr><td>
						<!-- template: ok-and-cancel is in ab-actions-bar.xsl -->
						<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='applyTablegroupOptions']"/>
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
				<xsl:with-param name="afmInputsForm" select="$afmInputsForm"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>

	<!-- xsl template: AfmTableGroup -->
	<xsl:template name="AfmTableGroup">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableTypes"/>
		<xsl:param name="afmTableFormats"/>
		<xsl:param name="afmTableColumns"/>
		<table>
			<tr><td>
				<table valign="top" align="left">
					<tr><td><span  class="legendTitle" translatable="true">Title:</span></td></tr>
					<tr><td>
						<input class="login_inputField" name="{$title}" id="{$title}" type="text" value="{$afmTableGroup/dataSource/data/afmTableGroup/title}" size="55" onkeypress="return disableInputEnterKeyEvent( event)"/>
						<!--input class="inputField" name="{$defaultActions}" id="{$defaultActions}" type="hidden" value="{$afmTableGroup/dataSource/data/afmTableGroup/@defaultActions}" /-->
						<input class="inputField" name="{$frame}" id="{$frame}" type="hidden" value="{$afmTableGroup/dataSource/data/afmTableGroup/@frame}" />
					</td></tr>
				</table>
			</td></tr>
			<tr><td>
				<table valign="top" align="left">
					<tr><td  class="legendTitle" translatable="true">Type:</td></tr>
					<tr><td>
                                               <span style="display:none" id="formtable_format_warning_message"  translatable="true">You have selected 'Form' type and 'Table' format combination. The current table group will show as a tree structure. To complete the action, you need to create a nested table group to display data in table format when a tree record of the current table group is selected. Then, set up a frameset style to display the table groups. If this is not the type of report you want, please set the format to 'Edit Form'.</span>
                                               <select class="inputField_box" name="{$types}" id="{$types}" onchange="onChangeType(this.value)">
							<xsl:for-each select="$afmTableTypes/type">
								<xsl:choose>
									<xsl:when test="@name=$afmTableGroup/dataSource/data/afmTableGroup/@type">
										<option value="{@name}" selected="1"><xsl:value-of select="title"/></option>
									</xsl:when>
									<xsl:otherwise>
										<option value="{@name}"><xsl:value-of select="title"/></option>
									</xsl:otherwise>
								</xsl:choose>
							</xsl:for-each>
						</select>
					</td></tr>
				</table>
			</td></tr>
			<tr><td>
				<xsl:variable name="iColumn">
					<xsl:choose>
						<xsl:when test="$afmTableGroup/dataSource/data/afmTableGroup/@column">
							<xsl:value-of select="$afmTableGroup/dataSource/data/afmTableGroup/@column"/>
						</xsl:when>
						<xsl:otherwise>1</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<table valign="top" align="left">
					<tr>
						<td  align="left" class="legendTitle" translatable="true">Format:</td>
						<td  align="left" class="legendTitle"><div id="{$iColumnNumberArea_title}"><span  translatable="true">Number of Columns:</span></div></td>
					</tr>
					<tr>
						<td align="left">
							<select class="inputField_box" name="{$formats}" id="{$formats}" onchange="showOrHideIColumnNumberArea(this);onChangeFormat(this.value)">
								<xsl:for-each select="$afmTableFormats/format">
									<xsl:choose>
										<xsl:when test="@name=$afmTableGroup/dataSource/data/afmTableGroup/@format">
											<option value="{@name}" selected="1"><xsl:value-of select="title"/></option>
										</xsl:when>
										<xsl:otherwise>
											<option value="{@name}"><xsl:value-of select="title"/></option>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:for-each>
							</select>
						</td>
						<td align="right">
							<div id="{$iColumnNumberArea_field}">
								<select class="inputField_box" name="{$iColumnNumber}" id="{$iColumnNumber}">
									<xsl:for-each select="$afmTableColumns/column">
										<xsl:choose>
											<xsl:when test="@value=$iColumn">
												<option value="{@value}" selected="1"><xsl:value-of select="@value"/></option>
											</xsl:when>
											<xsl:otherwise>
												<option value="{@value}"><xsl:value-of select="@value"/></option>
											</xsl:otherwise>
										</xsl:choose>
									</xsl:for-each>
								</select>
						       </div>
						</td>
					</tr>
				</table>

				<xsl:variable name="lcletters">abcdefghijklmnopqrstuvwxyz</xsl:variable>
				<xsl:variable name="ucletters">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:variable>
				<xsl:variable name="formatOriginal" select="$afmTableGroup/dataSource/data/afmTableGroup/@format"/>
				<xsl:variable name="formatIgnoreCase" select="translate($formatOriginal,$lcletters,$ucletters)"/>
				<xsl:if test="not ($formatIgnoreCase='COLUMN')">
					<script language="javascript">
						var obj_iColumnNumberArea_title = document.getElementById('<xsl:value-of select="$iColumnNumberArea_title"/>');
						var obj_iColumnNumberArea_field = document.getElementById('<xsl:value-of select="$iColumnNumberArea_field"/>');
						if(obj_iColumnNumberArea_title != null )
						{
							obj_iColumnNumberArea_title.style.display = "none";
							obj_iColumnNumberArea_field.style.display = "none";
						}
					</script>
				</xsl:if>
			</td></tr>
			<tr><td>
				<table valign="top" align="left">
					<tr><td align="left">
						<span   class="legendTitle" translatable="true">Show Grid?</span>
					     </td>
					     <td>
						<xsl:choose>
							<xsl:when test="$afmTableGroup/dataSource/data/afmTableGroup/@showGrid='true'">
								<input  name="{$gridable}" type="checkbox" checked="1"/>
							</xsl:when>
							<xsl:otherwise>
								<input  name="{$gridable}" type="checkbox"/>
							</xsl:otherwise>
						</xsl:choose>
					</td></tr>
					<tr><td align="left">
						<span  class="legendTitle" translatable="true">Printable?</span>
					     </td>
					     <td>
						<xsl:choose>
							<xsl:when test="$afmTableGroup/dataSource/data/afmTableGroup/afmReport/@printable='true'">
								<input  name="{$printable}" type="checkbox" checked="1"/>
							</xsl:when>
							<xsl:otherwise>
								<input  name="{$printable}" type="checkbox"/>
							</xsl:otherwise>
						</xsl:choose>
					</td></tr>
					<tr><td align="left">
						<span  class="legendTitle" translatable="true">Show Default Actions?</span>
					     </td>
					     <td>
						<xsl:choose>
							<xsl:when test="$afmTableGroup/dataSource/data/afmTableGroup/@defaultActions='true'">
								<input  name="{$defaultActions}" type="checkbox" checked="1"/>
							</xsl:when>
							<xsl:otherwise>
								<input  name="{$defaultActions}" type="checkbox"/>
							</xsl:otherwise>
						</xsl:choose>
					</td></tr>
				</table>
			</td></tr>
		</table>
	</xsl:template>
	<!-- including XSLT files which are called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<xsl:include href="../xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>


