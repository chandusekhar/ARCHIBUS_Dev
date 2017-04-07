/**
 * Test data for workflow steps. In a real application the data would be retrieved from a service.
 */
var testContext = {
    workflowSteps: [
        {
            id: 'R',
            title: 'Requested',
            actions: [{
                id: 'R1',
                title: 'Facility approval required (AFM)'
            }]
        },
        {
            id: 'A',
            title: 'Approved',
            actions: [{
                id: 'A1',
                title: 'Assign request to a dispatcher (Dispatcher)'
            }, {
                id: 'A2',
                title: 'Send notification to supervisor'
            }, {
                id: 'A3',
                title: 'Assign to work order (AFM)'
            }]
        },
        {
            id: 'I',
            title: 'Issued',
            actions: [{
                id: 'I1',
                title: 'Schedule (Craftsperson)'
            }]
        },
        {
            id: 'Com',
            title: 'Completed',
            actions: []
        }
    ]
}
