const { errorHandler } = require('./ErrorHandler')
const { messagePayload } = require('./ContactMessage')

const { executeHttpRequest, getDestination } = require('@sap-cloud-sdk/core')

class Contact {
    static async run(eventObj, destinationName, targetEvent) {
        let outboundMessagePayload = messagePayload.initialize()

        try {
            const destination = await getDestination(destinationName)

            const contactProperties =
                `AccountID,` +
                `ContactID,` +
                `FirstName,` +
                `LastName,` +
                `Email,` +
                `Phone,` +
                `Ecommerceenabled_KUT,` +
                `MaximumOrderAmount_KUT,` +
                `MaximumOrderAmountcurrencyCode_KUT`

            const apiURL =
                `/sap/c4c/odata/v1/c4codataapi/IndividualCustomerCollection?` +
                `$expand=` +
                `IndividualCustomerAddress,` +
                `IndividualCustomerSalesData,` +
                `IndividualCustomerTaxNumber` +
                `&$filter=ObjectID eq '${eventObj.data['root-entity-id']}'` +
                `&$select=${contactProperties},${addressProperties},${salesDataProperties},${taxNumberProperties}`

            const response = await executeHttpRequest(
                destination,
                {
                    method: 'get',
                    url: apiURL
                }
            )
            outboundMessagePayload.EventName = 'IndividualCustomer'
            outboundMessagePayload.EventType = targetEvent
            outboundMessagePayload.EventTriggeredOn = eventObj['event-time']

            const customerCollection = response.data.d.results[0]

            outboundMessagePayload.Entity.AccountId = customerCollection.CustomerID
            outboundMessagePayload.Entity.ERPAccountID = customerCollection.ExternalID
            outboundMessagePayload.Entity.AccountName = customerCollection.BusinessPartnerFormattedName
            outboundMessagePayload.Entity.AccountStatus = customerCollection.LifeCycleStatusCode
            outboundMessagePayload.Entity.DefaultStore = customerCollection.Defaultstore_KUT

            if (customerCollection.IndividualCustomerAddress.length === 1) {
                const addressCollection = customerCollection.IndividualCustomerAddress[0]
                if (addressCollection.BillTo) {
                    outboundMessagePayload.Entity.InvoicingHouseNumber = addressCollection.HouseNumber
                    outboundMessagePayload.Entity.InvoicingAddress1 = addressCollection.Street
                    outboundMessagePayload.Entity.InvoicingAddress2 = addressCollection.AddressLine2
                    outboundMessagePayload.Entity.InvoicingPostalCode = addressCollection.StreetPostalCode
                    outboundMessagePayload.Entity.InvoicingCity = addressCollection.City
                    outboundMessagePayload.Entity.InvoicingCountry = addressCollection.CountryCode
                }

                if (addressCollection.ShipTo) {
                    outboundMessagePayload.Entity.DeliveryHouseNumber = addressCollection.HouseNumber
                    outboundMessagePayload.Entity.DeliveryAddress1 = addressCollection.Street
                    outboundMessagePayload.Entity.DeliveryAddress2 = addressCollection.AddressLine2
                    outboundMessagePayload.Entity.DeliveryPostalCode = addressCollection.StreetPostalCode
                    outboundMessagePayload.Entity.DeliveryCity = addressCollection.City
                    outboundMessagePayload.Entity.DeliveryCountry = addressCollection.CountryCode
                }
            }

            if (customerCollection.IndividualCustomerSalesData.length === 1) {
                const salesDataCollection = customerCollection.IndividualCustomerSalesData
                outboundMessagePayload.Entity.PaymentMethods = salesDataCollection.PaymentMethod_KUT
                outboundMessagePayload.Entity.DeliveryMethods = salesDataCollection.DeliveryMethod_KUT
                outboundMessagePayload.Entity.OrganisationId = salesDataCollection.SalesOrganisationID
            }

            if (customerCollection.IndividualCustomerTaxNumber.length === 1) {
                const taxNumberCollection = customerCollection.IndividualCustomerTaxNumber
                outboundMessagePayload.Entity.TaxId = taxNumberCollection.TaxID
            }

            return outboundMessagePayload
        }
        catch (err) {
            errorHandler.print(err)
        }
    }
}

module.exports = { Contact }