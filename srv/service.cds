service ClienLinkDataXchange @(
    //requires: 'system-user',
    path    : '/odataapi'
) {
    action EnrichData(event : String)         returns String;
    action VerifyEventPayload(event : String) returns String;
}
