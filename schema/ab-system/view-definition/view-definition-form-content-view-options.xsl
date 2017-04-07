<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle the setup of view's frameset form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables used in this xslt -->
	<xsl:variable name="title" select="'title'"/>
	
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-view-options.js"><xsl:value-of select="$whiteSpace"/></script>		
		</head>
		<xsl:variable name="excelShow">
			<xsl:choose>
				<xsl:when test="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/export/excel/button/@show">
					<xsl:value-of select="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/export/excel/button/@show"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="/*/preferences/export/excel/button/@show"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="mdxExcelShow">
			<xsl:choose>
				<xsl:when test="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/export/excel/mdx/button/@show">
					<xsl:value-of select="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/export/excel/mdx/button/@show"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="/*/preferences/export/excel/mdx/button/@show"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:variable name="pdfShow">
			<xsl:choose>
				<xsl:when test="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/pdfButton/@show">
					<xsl:value-of select="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/pdfButton/@show"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="/*/preferences/pdfButton/@show"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:variable name="pdfStyle">
			<xsl:choose>
				<xsl:when test="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/pdfButton/@style">
					<xsl:value-of select="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/pdfButton/@style"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="/*/preferences/pdfButton/@style"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="showPDFButton" select="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/@showPDFButton"/>
		<xsl:variable name="showExcelButton" select="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/@showExcelButton"/>
		<xsl:variable name="showMdxExcelButton" select="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/@showMdxExcelButton"/>
		<xsl:variable name="isMDX" select="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/@isMDX"/>
		<xsl:variable name="isColumnFormat" select="/*/afmTableGroup/dataSource/data/afmXmlView/preferences/@isColumnFormat"/>
		<body  onload="setUpForm('{$showPDFButton}', '{$pdfShow}', '{$pdfStyle}', '{$showExcelButton}', '{$excelShow}', '{$showMdxExcelButton}', '{$mdxExcelShow}', '{$isMDX}', '{$isColumnFormat}')" class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			<table width="100%" valign="top">
				<Form name="{$afmInputsForm}">
					<tr><td>
						<xsl:call-template name="AfmTableGroup">
							<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
						</xsl:call-template>
					</td></tr>
					
					<tr><td>
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
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='applyViewOptions']"/>
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
		<table align="left">
			<tr><td class="legendTitle">
				<span  translatable="true">Set View's Title:</span>
			</td></tr>
			<tr><td align="left">
				<input  class="login_inputField" name="{$title}" id="{$title}" type="text" size="45" value="{$afmTableGroup/dataSource/data/afmXmlView/title}" onkeypress="return disableInputEnterKeyEvent( event)"/>
			</td></tr>

			<tr><td align="left">
				<table>
					<tr>
						<td class="legendTitle">
							<INPUT type="CHECKBOX" name="EXCEL" id="EXCEL" onclick=""/><span  translatable="true">Show Excel button</span>
						</td>
					</tr>
					<tr>
						<td class="legendTitle">
							<INPUT type="CHECKBOX" name="PDF" id="PDF" onclick="onPDF(this)"/><span  translatable="true">Show PDF Button</span>
						</td>
					</tr>
					<tr>
						<td>
							<table id="styleArea" style="margin-left:15pt;display:none" border="1">
								<tr>
									<td><input type="radio" id="portrait" name="style" checked="1"/><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">Portrait</span><input type="radio" id="landscape" name="style"/><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">Landscape</span></td>
								</tr>
								<tr>
									<td class="instruction"><span translatable="true">(If there are too many fields for the report width, the text will overlap.  If this happens reduce the number of fields.)</span></td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</td></tr>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<xsl:include href="../xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>


