<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle sort fields -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables for this xslt -->
	<xsl:variable name="AvailableAll" select="'AvailableAll'" />
	<xsl:variable name="VisibleFields" select="'VisibleFields'" />
	<xsl:variable name="FieldProperty_div" select="'FieldProperty_div'" />
	<xsl:variable name="unique" select="'unique'" />
	<xsl:variable name="ascending" select="'ascending'" />
	<xsl:variable name="show" translatable="true">Show</xsl:variable>
	<xsl:variable name="hide" translatable="true">Hide</xsl:variable>
	<xsl:variable name="up" translatable="true">Up</xsl:variable>
	<xsl:variable name="down" translatable="true">Down</xsl:variable>		
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<xsl:call-template name="LinkingCSS"/>
			<!-- don't change the order of linked javascript files -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common-sort-visiblefields.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-table-sort.js"><xsl:value-of select="$whiteSpace"/></script>		
		</head>
		<body class="body" onload="checkOnsortedFieldProperty()" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			<script language="javascript">
				<xsl:text>//set up javascript variables</xsl:text>
				visibleFieldsName='<xsl:value-of select="$VisibleFields"/>';
				fieldProperty_div='<xsl:value-of select="$FieldProperty_div"/>';
				//uniqueName='<xsl:value-of select="$unique"/>';
				ascendingName='<xsl:value-of select="$ascending"/>';
			</script>
			<table width="100%">
				<Form name="{$afmInputsForm}">
					<tr><td>
						<xsl:call-template name="AfmTableGroup">
							<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
						</xsl:call-template>
					</td></tr>
					<tr><td>
						<!-- template: ok-and-cancel is in ab-actions-bar.xsl -->
						<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='applySort']"/>
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
		<xsl:variable name="tgrpNameNoSpaces" select="translate($afmTableGroup/@name,' /\*%+-.','')"/>
		<script language="javascript">
			<xsl:for-each select="$afmTableGroup/dataSource/data/order/field">
				<xsl:variable name="field" select="concat(@table,'.',@name)"/>
				//setArrSortedFieldUnique('<xsl:value-of select="$field"/>', <xsl:value-of select="@unique"/>);
				setArrSortedFieldAscending('<xsl:value-of select="$field"/>', <xsl:value-of select="@ascending"/>);
			</xsl:for-each>
			<xsl:value-of select="$whiteSpace"/>
		</script>
		<!-- processing afmTableGroup -->
		<table align="center">
			<tr align="center" ><td align="center" >
				<table>
					<tr><td aligh="left">
					<FIELDSET>
						<LEGEND class="legendTitle"  translatable="true">Fields in Table-Group</LEGEND>
						<table>
							<tr><td>
								<select class="selectListWithWidth" id="{$AvailableAll}" name="{$AvailableAll}" size="10" multiple="1" ondblclick='ShowOrHideFields("{$VisibleFields}", "{$AvailableAll}", true, true)'>
									<!-- going through available fields-->
									<xsl:for-each select="$afmTableGroup/dataSource/data/availableFields/field">
										<xsl:sort select="@singleLineHeading"/>
										<option name="{$AvailableAll}_{@table}.{@name}" id="{$AvailableAll}_{@table}.{@name}" value="{@table}.{@name}">
											<xsl:value-of select="@singleLineHeading"/>
										</option>
									</xsl:for-each>
								</select>
							</td></tr>
						</table>
					</FIELDSET>
					</td>
					<td align="center" valign="middle">
						<table align="center" valign="middle" width="65%">
							<!-- javascript functions on AvailableAll which are in afmView-definition-form-content-table-visibleFields.js  -->
							<tr><td nowrap="1" align="center" class="cursorSelector">
								<img  alt="{$show}" name="Show" id="Show" src="{$abSchemaSystemGraphicsFolder}/show.gif" onclick='ShowOrHideFields("{$VisibleFields}", "{$AvailableAll}", true, true)'/>
							</td></tr>
							<tr><td  nowrap="1" align="center" class="cursorSelector">
								<img  alt="{$hide}" src="{$abSchemaSystemGraphicsFolder}/hide.gif" onclick='ShowOrHideFields("{$AvailableAll}", "{$VisibleFields}", true, false)'/>
							</td></tr>
						</table>
					</td>

					<td align="center" valign="middle">
						<FIELDSET>
							<LEGEND class="legendTitle" translatable="true">Sort Order</LEGEND>
							<table border="0" cellspacing="0">
								<tr><td>
									<select class="selectListWithWidth" id="{$VisibleFields}"  name="{$VisibleFields}" onclick="enableSortedFieldProperty_div(this)" size="10" ondblclick='ShowOrHideFields("{$AvailableAll}", "{$VisibleFields}", true, false)'>
										<xsl:for-each select="$afmTableGroup/dataSource/data/order/field">
											<option id="{$VisibleFields}_{@table}.{@name}" value="{@table}.{@name}">
												<xsl:value-of select="@singleLineHeading"/>
											</option>
										</xsl:for-each>
									</select>
								</td>
								<td align="center" valign="middle">
									<table align="center" valign="middle">
										<tr><td  nowrap="1" class="cursorSelector"><img alt="{$up}" src="{$abSchemaSystemGraphicsFolder}/up.gif" onclick='MoveUpOrDOwnItems(true,"{$VisibleFields}")'/>
										</td></tr>
										<tr><td  nowrap="1" class="cursorSelector"><img alt="{$down}" src="{$abSchemaSystemGraphicsFolder}/dn.gif"  onclick='MoveUpOrDOwnItems(false, "{$VisibleFields}")'/>
										</td></tr>
									</table>
								</td></tr>
							</table>
						</FIELDSET>
					</td></tr>
				</table>
			</td></tr>
			<tr align="center"><td align="center">
				<FIELDSET>
					<LEGEND class="legendTitle" translatable="true">Sorted Field Property</LEGEND>
					<div id="{$FieldProperty_div}" disabled="1">
						<table align="left">
							<!--tr><td class="legendContent">
								<input type="checkbox" name="{$unique}" value="false" onclick="setUnique(this)"><span  translatable="true">Unique</span></input>
							</td></tr-->
							<tr><td class="legendContent">
								<input type="radio" name="{$ascending}" value="true" onclick="setAscending(0)"><span  translatable="true">Ascending</span></input>
								<input type="radio" name="{$ascending}" value="false" onclick="setAscending(1)"><span  translatable="true">Descending</span></input>
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


