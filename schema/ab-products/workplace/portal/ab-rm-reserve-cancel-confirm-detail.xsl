<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data:ab-rm-reserve-cancel-confirm-detail.axvw -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />

	<!-- top template  -->
	<xsl:template match="/">
		<html>	
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<!-- template: Html-Head-Setting in common.xsl -->
			<xsl:call-template name="Html-Head-Setting"/>
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-rm-reserve-cancel-confirm-detail.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<xsl:variable name="record_status" select="//afmTableGroup[@name='report']/dataSource/data/records/record/@rm_reserve.status"/>
		<xsl:variable name="record_status_stored_value">
			<xsl:for-each select="//afmTableGroup[@name='report']/dataSource/data/fields/field[@name='status']/enumeration/item">
				<xsl:if test="$record_status=@displayValue"><xsl:value-of select="@value"/></xsl:if>
			</xsl:for-each>
		</xsl:variable>
		<xsl:variable name="record_pk" select="//afmTableGroup[@name='report']/dataSource/data/records/record/@rm_reserve.auto_number"/>
			
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">

			<!-- Localization messages -->
			<span translatable="true" id="are_you_sure" name="are_you_sure" style="display:none">Are you sure you want to cancel this reservation?</span>

			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="concat(//afmTableGroup[@name='report']/title,': ',$record_status)"/>
			</xsl:call-template>	

			<xsl:call-template name="Report">
				<xsl:with-param name="afmTableGroup" select="//afmTableGroup[@name='report']"/>
				<xsl:with-param name="margin-left" select="0"/>
				<xsl:with-param name="level" select="1"/>
				<xsl:with-param name="format" select="'column'"/>
			</xsl:call-template>
			<xsl:if test="$record_status_stored_value='Req'">
				<xsl:variable name="executeTransaction" select="//afmTableGroup[@name='executeTransaction']/afmAction[@type='executeTransaction']/@serialized"/>
				<table align="center" valign="top" width="100%">
					<tr align="center">
						<td>
							<input  class="AbActionButtonFormStdWidth" type="button" value="{//afmTableGroup[@name='executeTransaction']/message[@name='confirm']}" onclick='onConfirm("{$executeTransaction}","{$record_pk}")'/>
						</td>
						<td>
							<input  class="AbActionButtonFormStdWidth" type="button" value="{//afmTableGroup[@name='executeTransaction']/message[@name='cancel']}" onclick='onCancel("{$executeTransaction}","{$record_pk}")'/>
							<span translatable="true" id="ab_rm_reserve_cancel_confirm_detail_cancel_warning_message" name="ab_rm_reserve_cancel_confirm_detail_cancel_warning_message" style="display:none">Are you sure you want to cancel this reservation?</span>
						</td>
					</tr>
				</table>
			</xsl:if>
				
			<!-- calling template common which is in common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/reports/reports.xsl" />
</xsl:stylesheet>