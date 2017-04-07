/**
 * Created by Meyer on 10/18/2015.
 *
 * ab-pgnav-user-editor-dragdrop.js
 *
 * Support for the home page editor.
 *
 * Handle the drag and drop sortable buckets and rows.
 *
 */
/**
 * Namespace for the home page editor JS classes.
 */
Ab.namespace('homepage');

/**
 * Drag and Drop - actually Sortable - for the Home Page Editor.
 * Singleton class handles the movement of panels (buckets) within the view.
 */
Ab.homepage.EditorSortable = new (Base.extend({
        /**
         * Initialize the drag-and-drop sorting
         * of rows and buckets.
         */
        initializeDragDropSortables: function () {
            // sort buckets, even across rows
            jQuery('.page-row').sortable({
                handle: '.process-title',
                containment: '#editorPage',
                cancel: '.row-palette',
                connectWith: ".page-row",
                helper: "clone",
                placeholder: "sortable-placeholder",
                update: Ab.homepage.EditorSortable.onChange
            });
        },

        /**
         * Handle the drop
         * On change mark as dirty to warn of unsaved changes.
         *
         * @param event
         * @param ui
         */
        onChange: function (event, ui) {
            Ab.homepage.EditorController.flowBucketsToMaxFourColumnsPerRow();
            Ab.homepage.EditorController.addNewBucketControlWhereNeeded();
            Ab.homepage.EditorController.initializeRowMovementControls();
            Ab.homepage.EditorController.setRowNames();
            pgnavPageEditorController.isDirty = true;
        }
    })
);
