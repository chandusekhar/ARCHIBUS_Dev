
Space Express Console prototype
===============================

Objectives
----------

1. Design and test the right user interface.

2. Provide the AXVW and JS skeleton that can be extended to implement additional features.

User interface change process
-----------------------------

The user interface was carefully designed and reviewed by stakeholders. When it is necessary to make
user interface changes, even small ones, please notify FK and he will schedule a review if needed.

AXVW file structure
-------------------

Each functional area on the screen has a corresponding AXVW file. For example, user interface
features shown under the Locations header - the filter and the grid of locations - are defined in
ab-sp-console-locations.axvw.

JS class structure
------------------

Each functional area also has its own JS controller. Each controller handles data display and
user actions in the panels and UI controls that fall under its functional area. For example,
the spaceExpressConsoleLocations controller defined in ab-sp-console-locations.js
handles all user actions in the Locations filter and grid.

Assignment workflow
-------------------

The Space Express Console has unusually complex user interactions workflow. Depending on user's
actions, the screen state changes, other actions become enabled or disabled, and new UI elements
may display. The most complex part of the workflow handles the various types of assignments:
- assigning departments to rooms;
- assigning room types to rooms;
- assigning employees to rooms, or moving employees between rooms, or between rooms and the Waiting Room.

While each controller handles user actions that begin and end inside one functional area, a special
JS controller watches over the assignment process that spans all functional areas of the screen.
This controller is defined in ab-sp-console-assignments.js.

Assignment model
----------------

Because there are three different types of assignments - department, room type, and employee - and
each has different properties, a set of JS classes encapsulates the assignments data model. It is
defined in ab-sp-console-assignments-model.js.

The assignments controller works the model directly, e.g. adds or removes assignments to it. All
other controllers generally do not manipulate the model, although they may use model objects to
show data on screen, e.g. display the list of pending employee assignments in a panel.

Controller interaction
----------------------

All user actions originate in one panel, e.g. the Filter action in the Locations panel. Some of
these actions have a ripple effect throughout many or all other panels. For example, the Filter
action has to apply a restriction to six other panels. Or, the mode selector has to show or hide UI
elements in many panels.

Because there are many actions and conditions that determine their outcome, programming these
interactions directly - i.e. when action X happens, update A (but only when condition J is met),
update B (but only when condition K is met), update C, and so on - would lead to spaghetti code
that would be very difficult to maintain or extend.

Instead, controllers interact using events. For instance, when the user clicks on the Assign button
in the Departments tree, the department controller triggers the beginAssignment event, and attaches
the data about the selected department:

    departmentTreeLevel_onAssignDepartment: function() {
        var node = this.departmentTree.lastNodeClicked;
        this.trigger('app:space:express:console:beginAssignment', {
            type: 'department',
            dv_id: node.parent.data['rm.dv_id'],
            dv_name: node.parent.data['rm.dv_name'],
            dp_id: node.data['rm.dp_id'],
            dp_name: node.data['rm.dp_name']
        });
    },

The department controller does not know which other controllers will handle the event, or how they
will handle it.

To handle an event, other controllers subscribe to it:

    afterCreate: function() {
        this.on('app:space:express:console:beginAssignment', this.beginAssignment);
    },

When the event is triggered, the view calls the controller's method:

    beginAssignment: function(assignmentTarget) {
        // handle the new assignment here
    },

Getting technical help
----------------------

App structure, JS classes, forms and dialogs: SK
Grid and tree controls, Select Fields dialog: ED
Drawing control, XLS export, and PDF reports: YS
