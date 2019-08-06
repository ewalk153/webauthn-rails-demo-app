import * as Encoder from "encoder";

function getCSFRToken() {
  var CSFRSelector = document.querySelector('meta[name="csrf-token"]')
  if (CSFRSelector) {
    return CSFRSelector.getAttribute("content")
  } else {
    return null
  }
}

function callback(url, body) {
  fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-CSRF-Token": getCSFRToken()
    },
    credentials: 'same-origin'
  }).then(function() {
    window.location.replace("/")
  });
}

function create(callbackUrl, credentialOptions) {
  navigator.credentials.create({ "publicKey": credentialOptions }).then(function(attestation) {
    callback(callbackUrl, {
      id: attestation.id,
      response: {
        clientDataJSON: Encoder.binToStr(attestation.response.clientDataJSON),
        attestationObject: Encoder.binToStr(attestation.response.attestationObject)
      }
    });
  }).catch(function(error) {
    console.log(error);
  });

  console.log("Creating new public key credential...");
}

function get(credentialOptions) {
  navigator.credentials.get({ "publicKey": credentialOptions }).then(function(credential) {
    var assertionResponse = credential.response;

    callback("/session/callback", {
      id: Encoder.binToStr(credential.rawId),
      response: {
        clientDataJSON: Encoder.binToStr(assertionResponse.clientDataJSON),
        signature: Encoder.binToStr(assertionResponse.signature),
        userHandle: Encoder.binToStr(assertionResponse.userHandle),
        authenticatorData: Encoder.binToStr(assertionResponse.authenticatorData)
      }
    });
  }).catch(function(error) {
    console.log(error);
  });

  console.log("Getting public key credential...");
}

export { create, get }
