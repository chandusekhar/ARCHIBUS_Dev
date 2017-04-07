<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
	<xsl:import href="constants.xsl"/>
	<!-- set up hex color choices -->
	<xsl:variable name="green" select="concat('#','B3CBB1')"/>
	<xsl:variable name="red" select="concat('#','F58B89')"/>
	<xsl:variable name="yellow" select="concat('#','F1E743')"/>
	<xsl:variable name="white" select="concat('#','FFFFFF')"/>
	<xsl:output method="html" indent="yes"/>
	<xsl:template match="/">
		<html lang="EN">
			<head>
				<title>
					<xsl:value-of select="/*/title"/>
					<xsl:value-of select="$whiteSpace"/>
				</title>
				<link rel="stylesheet" type="text/css" href="{$abSchemaSystemCSSFolder}/ab-dashboard-alerts.css"/>
			</head>
			<body>
			<xsl:attribute name="id">container</xsl:attribute>
				<xsl:call-template name="processByGroup">
					<xsl:with-param name="listNode" select="/*/afmTableGroup/dataSource/data/records/record"/>
				</xsl:call-template>
				<!-- this template groups the data -->
			</body>
		</html>
	</xsl:template>
	<xsl:template name="processByGroup">
		<xsl:param name="listNode"/>
		<!--  split into groups by type  -->
		<xsl:variable name="groupName" select="$listNode[1]/@alerts.type_button"/>
		<xsl:variable name="groupNode" select="$listNode[@alerts.type_button=$groupName]"/>
		<!-- output group header -->
		<div class="alert-header">
			<xsl:value-of select="$groupName"/>
		</div>
		<!-- process each record in the group -->
		<xsl:apply-templates select="$groupNode"/>
		<!--  recurse for other groups  -->
		<xsl:if test="count($listNode)>count($groupNode)">
			<xsl:call-template name="processByGroup">
				<xsl:with-param name="listNode" select="$listNode[not(@alerts.type_button=$groupName)]"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
	<!-- this template processes the individual records -->
	<xsl:template match="record">
		<!-- determine the color based on the current value -->
		<xsl:variable name="color">
			<xsl:choose>
				<xsl:when test="@alerts.value_current &gt; @alerts.up_up_limit_value">
					<xsl:value-of select="@alerts.up_up_limit_clr"/>
				</xsl:when>
				<xsl:when test="@alerts.value_current &gt; @alerts.up_limit_value">
					<xsl:value-of select="@alerts.up_limit_clr"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:text>Green</xsl:text>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<!-- translate the color into hex values -->
		<xsl:variable name="color_hex">
			<xsl:choose>
				<xsl:when test="$color='Yellow'">
					<xsl:value-of select="$yellow"/>
				</xsl:when>
				<xsl:when test="$color='Red'">
					<xsl:value-of select="$red"/>
				</xsl:when>
				<xsl:when test="$color='Green'">
					<xsl:value-of select="$green"/>
				</xsl:when>
				<xsl:when test="$color='White'">
					<xsl:value-of select="$white"/>
				</xsl:when>
			</xsl:choose>
		</xsl:variable>
		<!-- assemble style attribute -->
		<xsl:variable name="style">
			<xsl:text>background-color: </xsl:text>
			<xsl:value-of select="$color_hex"/>
			<xsl:text>; background-image: url(</xsl:text>
			<xsl:value-of select="concat($abSchemaSystemGraphicsFolder,'/',@alerts.image_file)"/>
			<xsl:text>)</xsl:text>
		</xsl:variable>
		<div class="alert-button">
			<xsl:attribute name="style"><xsl:value-of select="$style"/></xsl:attribute>
			<xsl:attribute name="onclick"><xsl:text>alert('Clicking this button opens a view.');</xsl:text></xsl:attribute>
			<a href="#">
				<xsl:value-of select="./@alerts.button_title"/>
			</a>
		</div>
	</xsl:template>
</xsl:stylesheet>
