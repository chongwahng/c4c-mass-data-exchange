class messagePayload {
    static initialize() {
        let outboundMessagePayload = {
            EventName: '',
            EventType: '',
            EventTriggeredOn: '',
            Entity: {
                AccountId: '',
                ContactCode: '',
                FirstName: '',
                LastName: '',
                Email: '',
                Phone: '',
                Type: '',
                Status: '',
                MaximumOrderAmount: '',
                MaximumOrderAmountCurrencyCode: '',
                ApproveOrderFor: [],
                ListOfAccount: []
            }
        }

        return outboundMessagePayload
    }
}

module.exports = { messagePayload }