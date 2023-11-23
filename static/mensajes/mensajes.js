URL = "http://localhost:8000/"

async function get_messages() {
    const params = {
        method:"GET",
    }
    
    const res = await fetch(URL+"mensaje/",params)
    const data = await res.json()
    console.log(data)

    data.mensajes.forEach(function(element) {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(element);
        node.appendChild(textnode);
        document.getElementById("result").appendChild(node);
     });
}

function hexToArrayBuffer (input) {
    if (typeof input !== 'string') {
      throw new TypeError('Expected input to be a string')
    }
  
    if ((input.length % 2) !== 0) {
      throw new RangeError('Expected string to be an even number of characters')
    }
  
    const view = new Uint8Array(input.length / 2)
  
    for (let i = 0; i < input.length; i += 2) {
      view[i / 2] = parseInt(input.substring(i, i + 2), 16)
    }
  
    return view.buffer
  }


// k=ADBF05D88B596D1E5D2A0144F83AD30484B9C8674D7F61D068E4B7276FFE077B
function importSecretKey(rawKey) {
    return window.crypto.subtle.importKey("raw", rawKey, "AES-CBC", true, [
      "encrypt",
      "decrypt",
    ]);
}

function getMessageEncoding() {
    const messageBox = document.querySelector("#message");
    let message = messageBox.value;
    let enc = new TextEncoder();
    return enc.encode(message);
}
  
function encryptMessage(key,iv) {
    let encoded = getMessageEncoding();
    // iv will be needed for decryption
    iv = iv;
    return window.crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      key,
      encoded,
    );
}

function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }

async function send_message(){

    iv = "7be219757228099f1bc4a47000d38b13"
    abIv = hexToArrayBuffer(iv)
    const acKey = hexToArrayBuffer("ADBF05D88B596D1E5D2A0144F83AD30484B9C8674D7F61D068E4B7276FFE077B")
    const k = await importSecretKey(acKey);
    const enc_buffer = await encryptMessage(k, abIv)
    const enc_Array = new Uint8Array(enc_buffer)
    const enc_message = toHexString(enc_Array)

    const body = {
        iv: "7be219757228099f1bc4a47000d38b13",
        texto: enc_message
    }

    const params = {
        method:"POST",
        body: JSON.stringify(body),
        headers: {
            "Content-type": "application/json"
          }
    }

    const res = await fetch(URL+"mensaje/",params)
    const data = await res.json()

    console.log(data.message)

}
