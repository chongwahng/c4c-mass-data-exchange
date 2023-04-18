const { errorHandler } = require('./lib/ErrorHandler')

// Data provider class source file location - mandatory to add here to handle new CL events
const { CorporateAccount } = require('./lib/CorporateAccount')
const { IndividualCustomer } = require('./lib/IndividualCustomer')

// Data provider class event type mapping table - mandatory to add here to handle new CL events
const dataProviders = [
    { eventType: 'Account.Root.Created', targetEvent: 'Created', class: CorporateAccount },
    { eventType: 'Account.Root.Updated', targetEvent: 'Updated', class: CorporateAccount },
    { eventType: 'IndividualCustomer.Root.Created', targetEvent: 'Created', class: IndividualCustomer },
    { eventType: 'IndividualCustomer.Root.Updated', targetEvent: 'Updated', class: IndividualCustomer }
]

module.exports = (srv) => {
    if (process.env.C4C_DESTNAME) {
        destinationName = process.env.C4C_DESTNAME
    } else {
        destinationName = 'c4c_ac'
    }

    srv.on('EnrichData', async (req) => {
        let eventObj = JSON.parse(req.data.event)

        if (eventObj) {
            try {
                let idx = dataProviders.findIndex((obj) => obj.eventType === `${eventObj['event-type']}`)
                return await dataProviders[idx].class.run(eventObj, destinationName, dataProviders[idx].targetEvent)
            }
            catch (err) {
                errorHandler.print(err)
            }
        }
    })

    srv.on('VerifyEventPayload', async (req) => {
        let eventObj = JSON.parse(req.data.event)
        console.log(eventObj)
        return eventObj
    })
}