<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle selecting Visible Fields -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables for this xslt -->
	<xsl:variable name="AvailableAll" select="'AvailableAll'" />
	<xsl:variable name="VisibleFields" select="'VisibleFields'" />
	<!--xsl:variable name="bDistinct_div" select="'bDistinct_div'" /-->
	<xsl:variable name="bRequired_div" select="'bRequired_div'" />
	<xsl:variable name="bDistinct" select="'bDistinct'" />
	<xsl:variable name="bRequired" select="'bRequired'" />
	<xsl:variable name="show" translatable="true">Show</xsl:variable>
	<xsl:variable name="showAll" translatable="true">Show All</xsl:variable>
	<xsl:variable name="hide" translatable="true">Hide</xsl:variable>
	<xsl:variable name="hideAll" translatable="true">Hide All</xsl:variable>

	<xsl:template match="/">
		<html>
		<title><xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/></title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<!-- don't change the order of linked javascript files -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common-sort-visiblefields.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-table-visiblefields.js"><xsl:value-of select="$whiteSpace"/></script>		
		</head>
		<body class="body" onload="checkOnFieldProperties();" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			<script language="javascript">
				<!-- set up javascript variables -->
				//defined in common-sort-visiblefields.js
				arrVisibleFieldPK = new Array();
				visibleFieldsName='<xsl:value-of select="$VisibleFields"/>';
				bRequired_div   = '<xsl:value-of select="$bRequired_div"/>';
				bRequiredName   = '<xsl:value-of select="$bRequired"/>';
				<xsl:for-each select="//afmXmlView/afmTableGroup/dataSource/data/visibleFields/field">
					<xsl:variable name="fieldName" select="concat(@table,'.',@name)"/>
					setArrVisibleFieldDistinct('<xsl:value-of select="$fieldName"/>','<xsl:value-of select="@distinct"/>');
					setArrVisibleFieldRequired('<xsl:value-of select="$fieldName"/>','<xsl:value-of select="@required"/>');
					setArrVisibleFieldPK('<xsl:value-of select="$fieldName"/>','<xsl:value-of select="@primaryKey"/>');
				</xsl:for-each>
				//window.top.frames[0] is view definiton top bar
				//window.top.frames[0].currentTgrpFormat is set up by view definiton tree
				if(window.top.frames[0].currentTgrpFormat!=null)
					tgrpFormat=window.top.frames[0].currentTgrpFormat;
			</script>
			<!-- don't change form's name which will be used in afmView-definition-form-content-table-visibleFields.js-->
			<table width="100%" valign="top">
				<tr><td valign="top">
					<Form name="{$afmInputsForm}">
						<table align="center">
							<tr><td valign="top">
								<xsl:call-template name="AfmTableGroup">
									<!-- get the data to work on(user's selected table group) -->
									<xsl:with-param name="afmTableGroup" select="//afmXmlView/afmTableGroup"/>
								</xsl:call-template>
							</td></tr>
						</table>
						<!-- template: ok-and-cancel is in ab-actions-bar.xsl -->
						<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='applyVisibleFields']"/>
						<xsl:variable name="CANCEL" select="//afmTableGroup/afmAction[@type='cancel']"/>
						<xsl:variable name="TYPE" select="1"/>
						<xsl:call-template name="ok-and-cancel">
							<xsl:with-param name="OK" select="$OK"/>
							<xsl:with-param name="CANCEL" select="$CANCEL"/>
							<xsl:with-param name="TYPE" select="$TYPE"/>
							<xsl:with-param name="newWindowSettings" select="''"/>
						</xsl:call-template>
					</Form>
				</td></tr>
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
		<table align="center" width="100%">
			<tr><td>
				<table align="center">
					<tr><td aligh="center">
						<table aligh="center">
							<tr><td aligh="center">
								<FIELDSET>
								<LEGEND  class="legendTitle" translatable="true">Available Fields</LEGEND>
								<table align="center" width="95%">
									<tr><td>
										<!-- don't change select's id="AvailableAll" which will be used in afmView-definition-form-content-table-visibleFields.js-->
										<select class="selectListWithWidth" id="{$AvailableAll}" name="{$AvailableAll}" size="10" multiple="1" ondblclick='ShowOrHideFields("{$VisibleFields}", "{$AvailableAll}", true, true)'>
											<xsl:for-each select="$afmTableGroup/dataSource/data/availableFields/field">
												<xsl:sort select="@singleLineHeading"/>
												<option value="{@table}.{@name}">
													<!--xsl:for-each select="multiLineHeadings/multiLineHeading">
														<xsl:value-of select="@multiLineHeading"/><xsl:value-of select="$whiteSpace"/>
													</xsl:for-each-->
													<xsl:value-of select="@singleLineHeading"/>	
												</option>
											</xsl:for-each>
										</select>
									</td>
									<td align="center" valign="middle">
										<table align="center" valign="middle" width="65%">
										<!-- javascript functions on AvailableAll which are in afmView-definition-form-content-table-visibleFields.js  -->
										<tr><td nowrap="1" align="center" class="cursorSelector">
											<img  alt="{$show}" name="Show" id="Show" src="{$abSchemaSystemGraphicsFolder}/show.gif" onclick='ShowOrHideFields("{$VisibleFields}", "{$AvailableAll}", true, true)'/>
										</td></tr>
										<tr><td  nowrap="1" align="center" class="cursorSelector">
											<img alt="{$showAll}" name="ShowAll" id="ShowAll"  src="{$abSchemaSystemGraphicsFolder}/showall.gif"  onclick='ShowOrHideFields("{$VisibleFields}", "{$AvailableAll}", false, true)'/>
										</td></tr>
										<tr><td  nowrap="1" align="center" class="cursorSelector">
											<img  alt="{$hide}" src="{$abSchemaSystemGraphicsFolder}/hide.gif" onclick='ShowOrHideFields("{$AvailableAll}", "{$VisibleFields}", true, false)' value="Hide"/>
										</td></tr>
										<tr><td  nowrap="1" align="center" class="cursorSelector">
											<img alt="{$hideAll}"  src="{$abSchemaSystemGraphicsFolder}/hideall.gif" onclick='ShowOrHideFields("{$AvailableAll}", "{$VisibleFields}", false, false)'/>
										</td></tr>
										</table>
									</td></tr>
								</table>
								</FIELDSET>
							</td>
							<td align="center" valign="middle">
								<FIELDSET>
								<LEGEND class="legendTitle" translatable="true">Visible Fields</LEGEND>
								<table border="0" cellspacing="0">
									<tr><td>
										<!-- don't change select's id and name; keep option's id and name in following pattern-->
										<select class="selectListWithWidth" id="{$VisibleFields}"  name="{$VisibleFields}" size="10" onclick="enableFieldPropertyInputs()" ondblclick='ShowOrHideFields("{$AvailableAll}", "{$VisibleFields}", true, false)'>
											<xsl:for-each select="$afmTableGroup/dataSource/data/visibleFields/field">
												<option value="{@table}.{@name}">
													<xsl:value-of select="@singleLineHeading"/><xsl:value-of select="$whiteSpace"/>
												</option>
											</xsl:for-each>
										</select>
									</td>
									<td align="center" valign="middle">
										<table align="center" valign="middle">
											<tr><td  nowrap="1" class="cursorSelector"><img src="{$abSchemaSystemGraphicsFolder}/up.gif" onclick='MoveUpOrDOwnItems(true, "{$VisibleFields}")'/>
											</td></tr>
											<tr><td  nowrap="1" class="cursorSelector"><img src="{$abSchemaSystemGraphicsFolder}/dn.gif"  onclick='MoveUpOrDOwnItems(false, "{$VisibleFields}")'/>
											</td></tr>
										</table>
									</td></tr>
								</table>
								</FIELDSET>
							</td></tr>
							</table>
							</td></tr>
							<tr><td align="center">
								<FIELDSET>
								<LEGEND class="legendTitle" translatable="true">Visible Field Properties</LEGEND>
								<!-- check box for "distinct" of each visible field ??? -->
								<table align="center" width="100%">
									<!--tr><td>
										<div id="{$bDistinct_div}" disabled="1">
											<input type="checkbox" name="{$bDistinct}" checked="0" onclick="setBDistinct(this)">
												<span class="legendContent" translatable="true">Distinct?</span>
											</input>
										</div>
									</td></tr-->
									<tr><td>
										<div id="{$bRequired_div}" disabled="1">
											<input type="checkbox" name="{$bRequired}" checked="0" onclick="setBRequired(this)">
												<span class="legendContent" translatable="true">Required In Edit Form?</span>
											</input>
										</div>
									</td></tr>
							</table>
						</FIELDSET>
					</td></tr>
				</table>
			</td></tr>
		</table>
	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<xsl:include href="../xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>


