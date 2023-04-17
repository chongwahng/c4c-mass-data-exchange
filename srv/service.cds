service ClientLinkDataXchange @(path: 'odataapi') {
    action EnrichData(event : String)         returns String;
    action VerifyEventPayload(event : String) returns String;
}

annotate ClientLinkDataXchange.EnrichData with @(requires: 'system-user');
