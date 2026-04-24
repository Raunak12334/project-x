export const generateGoogleFormScript = (
  webhookUrl: string,
  webhookSecret: string,
) => `function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  // Build responses object
  var responses = {};
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    responses[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
  }

  // Prepare webhook payload
  var payload = {
    formId: e.source.getId(),
    formTitle: e.source.getTitle(),
    responseId: formResponse.getId(),
    timestamp: formResponse.getTimestamp(),
    respondentEmail: getRespondentEmail_(formResponse),
    responses: responses
  };

  // Send to webhook
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': {
      'x-otogent-webhook-secret': '${webhookSecret}'
    },
    'payload': JSON.stringify(payload)
  };

  var WEBHOOK_URL = '${webhookUrl}';

  try {
    var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log('Otogent webhook response: ' + response.getResponseCode());
  } catch(error) {
    console.error('Webhook failed:', error);
  }
}

function getRespondentEmail_(formResponse) {
  try {
    return formResponse.getRespondentEmail();
  } catch (error) {
    return '';
  }
}`;
