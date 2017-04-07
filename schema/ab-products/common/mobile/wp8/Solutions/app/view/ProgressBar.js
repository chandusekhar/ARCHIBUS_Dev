Ext.define('Solutions.view.ProgressBar', {
    extend: 'Ext.Container',

    requires: 'Common.view.panel.ProgressBar',

    config: {
        items: [
            {
                xtype: 'button',
                text: 'Show Progress Bar',
                style: 'margin: 3em',
                handler: function(){
                    if (!this.progressView) {

                        //Create the Progress Bar using the default values:
                        //value: 0,
                        //maxValue: 100,
                        //progressMessage: 'Loading Item {0} of {1}'
                        this.progressView = Ext.create('Common.view.panel.ProgressBar', {});

                        //Add listener for cancel event
                        this.progressView.addListener('cancel', function(){ this.hide(); });

                        //Add the Progress Bar to Viewport
                        Ext.Viewport.add(this.progressView);
                    }

                    //Display the Progress Bar
                    this.progressView.show();
                }
            },
            {
                xtype: 'button',
                text: 'Show Progress Bar and increment',
                style: 'margin: 3em',
                handler: function(){
                    if (!this.progressView) {
                        //Create the Progress Bar
                        this.progressView = Ext.create('Common.view.panel.ProgressBar', {
                            //Set custom start value
                            value: 1,
                            //Set custom end values
                            maxValue: 50,
                            //Set custom message
                            progressMessage : 'Current item: {0} / {1}'
                        });

                        this.progressView.addListener('cancel', function(){  this.hide(); });
                        this.progressView.addListener('complete', function(){ this.hide(); this.setCancelled(true);});

                        Ext.Viewport.add(this.progressView);
                    }
                    this.progressView.show();

                    //increment the progressView
                    this.progressView.setCancelled(false);
                    iterativeIncrementCall(this, this.progressView);
                }
            }
        ]
    }
});

//Increment the progressView until it is completed, for demo purposes.
function iterativeIncrementCall(scope, progressView){
    setTimeout(function () {

        progressView.increment();

        if(!progressView.getCancelled()){
            Ext.callback(iterativeIncrementCall, scope, [scope, progressView]);
        }
    }, 200);
}