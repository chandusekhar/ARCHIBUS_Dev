/**
 * Created by Meyer on 9/22/2015.
 *
 * ab-pgnav-user-menu.js
 */

/**
 *  Append elements to the banner menu element that show the current user's name, role, project, etc.
 *
 * @param userInfo
 */
function setUserHeader(userInfo) {
    if (userInfo && userInfo.name) {
        var homeTabTitles = getArrayFromContextString(context.homeTabTitles);
        var homeTabFiles = getArrayFromContextString(context.homeTabFileNames);
        if (homeTabFiles && homeTabFiles.length > 0) {
            PageNavUserInfo.homeTabHtmlFragment = PageNavUserInfo.generationDirectory + PageNavUserInfo.localeDirectory +
                PageNavUserInfo.roleDirectory + homeTabFiles[0];
        }

        var tblHTML = '<div><table class="profile-menu" id="profileMenuTable">' +
            '<tr><td id="userMenuProject" class="profile-item-title">' + getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_PROJECT) + '</td></tr>' +
            '<tr><td>' + userInfo.projectName + '</td></tr>' +
            '<tr><td id="userMenuRole" class="profile-item-title">' + getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_ROLE) + '</td></tr>' +
            '<tr><td>' + userInfo.role + '</td></tr>' +
            '<tr><td id="userMenuVersion" class="profile-item-title">' + getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_VERSION) + '</td></tr>' +
            '<tr><td>V ' + userInfo.serverVersion + '</td></tr>' +
            '<tr><td style="height:1px;"></td></tr>' +
            '<tr><td><a id="myProfileMenuLink" href="ab-my-user-profile.axvw" onClick="openSoloTask(this, event);" rel="eTask">' +
            getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_PROFILE) + '</a></td></tr>' +
            '<tr><td><a id="myJobsMenuLink" href="ab-my-jobs.axvw" onClick="openSoloTask(this, event);" rel="eTask">' +
            getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_JOBS) + '</a></td></tr>' +
            '<tr><td><a id="myPresentationsMenuLink" href="ab.axvw" onClick="writeAppSpecificBucketReport(this, event);" rel="eTask">' +
            getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_PRESENTATIONS) + '</a>' +
            '<div id="presentation_job_spinner" style="display:none" class="spinner"></div></td></tr>';

        var usesHomePages = homeTabTitles.length > 0;
        var securityGroupCount = userInfo.groups.length;

        for (var i = 0; usesHomePages && i < securityGroupCount; i++) {
            if (userInfo.groups[i] === "SYS-VIEW-ALTER") {
                tblHTML += '<tr><td><a id="myEditorMenuLink" href="ab-pgnav-manage-homepage-editor.axvw" onClick="openPageEditorTask(this, event);" rel="eTask">' +
                    getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_EDITOR) + '</a></td></tr>';
                break;
            }
        }

        if (usesHomePages) {
            tblHTML += '<tr><td><hr style="margin:0.2em 0;"></td></tr>';
        }
        for (var j = 0, tabTitle; tabTitle = homeTabTitles[j]; j++) {
            tblHTML += '<tr><td><a href="' + homeTabFiles[j] + '" onclick="changeHomeTab(this,event)">' + tabTitle + '</a></td></tr>'
        }
		tblHTML += '<tr><td><a id="uCalgLink" href="uc-request-dash.axvw" onClick="openSoloTask(this, event);" rel="eTask">University of Calgary</a></td></tr><tr><td style="height:1px;"></td></tr>';
        tblHTML += '</table></div>';

        $('#bannerMenu').append('<a id="bannerMenuUserLink">'+
                // KB 3050107 Prevent wrapping of long username in banner by CSS and substring-ing the name
            '<div class="banner-user-menu-container">' + userInfo.name.substr(0, 28).trim() + '<b class="caret"/></div></a>' +
            '<div class="hovertip" target="bannerMenuUserLink">' + '&nbsp;' + '</div>');

        var userMenuLink = $("div.hovertip[target='bannerMenuUserLink']");
        $(userMenuLink).empty();
        $(userMenuLink).append(tblHTML);

        // disable default <a/> behavior
        $('a#bannerMenuUserLink').click(function(){return false;});
        $('#profileMenuTable').find('a').click(function(){return false;});
    }
}


