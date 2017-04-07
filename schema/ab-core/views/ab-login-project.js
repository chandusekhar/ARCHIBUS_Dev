
/**
 * Login form controller for displaying/selecting the project.
 */
var loginProjectController = View.createController('loginProject', {
	
    // selected project
    currentProjectId: null,
    currentProjectName: null,
	
    /**
     * Initializes the controller objects.
     */	
	afterViewLoad: function() {
        $('project_label').innerHTML = getMessage('project_label_text');

		// get project list from the server
	    var projects = SecurityService.getProjects({
	        callback: this.onGetProjects.createDelegate(this),
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	},
	
	/**
	 * Displays the project list received from the server.
	 * @param {Object} projects
	 */
	onGetProjects: function(projects) {
        var openProjects = [];
        for (var i = 0; i < projects.length; i++) {
            var project = projects[i];
            if (project.open) {
                openProjects.push(project);
            }
        }
        
        if (openProjects.length > 0) {
            this.currentProjectId = openProjects[0].id;
            this.currentProjectName = openProjects[0].title;
        }
        
        if (openProjects.length > 1) {
            var projectSelector = Ext.DomHelper.append('project_name', {
                tag: 'select',
                id: 'project_selector',
                cls: 'inputField_box',
                title: 'Project Selector',
                tabindex: '1'
            });
			var projectSelectorEl = Ext.get('project_selector');
            projectSelectorEl.on('change', this.selectProject.createDelegate(this));

            projectSelectorEl.dom.options.length = 0;
            for (var i = 0; i < openProjects.length; i++) {
                var project = openProjects[i];
                projectSelectorEl.dom.options[i] = new Option(project.title, project.id);
            }
            
        } else if (openProjects.length == 1) {
            var projectDiv = $('project_name');
            projectDiv.className = 'textBasic';
            projectDiv.innerHTML = this.currentProjectName;
        }
        
        this.updateUsernamePasswordCaseSensitivity();
	},
	
	/**
	 * Select listener for Project combobox.
	 */
	selectProject: function(e, option) {
		var projectId = option.value;
	    if (projectId != this.currentProjectId) {
            this.currentProjectId = projectId;
            this.updateUsernamePasswordCaseSensitivity();

            // KB 3026202: when user changes project, the username and password controls should be cleared
            var userController = View.controllers.get('loginUser');
    		userController.clearUsernameAndPassword();
		}
	},

	/**
	 * Gets the user name and password case sensitivity for the selected project from the server.
	 */
	updateUsernamePasswordCaseSensitivity: function() {
		var userController = View.controllers.get('loginUser');
		var projectController = View.controllers.get('loginProject');
        
		// get the user name case sensitivity
	    SecurityService.isUsernameUppercase(projectController.currentProjectId, {
	        callback: function(isUsernameUppercase) {
	    		// get the password case sensitivity
	    	    SecurityService.isPasswordUppercase(projectController.currentProjectId, {
	    	        callback: function(isPasswordUppercase) {
	    	    	    // call the User controller to set the values and update the UI
	    	    	    userController.setUsernamePasswordCaseSensitivity(
	    	    	        isUsernameUppercase, isPasswordUppercase);
	    	        },
	    	        errorHandler: function(m, e) {
	    	            View.showException(e);
	    	        }
	    	    });
	        },
	        errorHandler: function(m, e) {
	            View.showException(e);
	        }
	    });
	}
});
