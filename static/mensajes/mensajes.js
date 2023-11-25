URL = "http://localhost:8000/"



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

    const iv = "7be219757228099f1bc4a47000d38b13"
    const IvAb = hexToArrayBuffer(iv)
    const KeyAb = hexToArrayBuffer("ADBF05D88B596D1E5D2A0144F83AD30484B9C8674D7F61D068E4B7276FFE077B")
    const k = await importSecretKey(KeyAb);
    const enc_buffer = await encryptMessage(k, IvAb)
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

    document.getElementById("sendResult").innerHTML=data.message

}

function hexToInt(inputStr) {
  var hex  = inputStr.toString();
  var Uint8Array = new Array();
  for (var n = 0; n < hex.length; n += 2) {
    Uint8Array.push(parseInt(hex.substr(n, 2), 16));
  }
  return Uint8Array;
}

async function decryptMessage(key, ciphertext) {
  const cipherArray = hexToInt(ciphertext)
  const cipherBuffer = new Uint8Array(cipherArray).buffer
  const iv = "7be219757228099f1bc4a47000d38b13"
  const IvAb = hexToArrayBuffer(iv)
  return window.crypto.subtle.decrypt({ name: "AES-CBC", iv:IvAb}, key, cipherBuffer);
}

async function get_message() {
  const params = {
    method:"GET",
  }

  const messageBox = document.querySelector("#messageId")
  let messageId = messageBox.value

  const res = await fetch(URL+"mensaje/"+messageId+"/", params)
  const data = await res.json()
  const ciphertext = data.texto.slice(0,32)
  const KeyAb = hexToArrayBuffer("ADBF05D88B596D1E5D2A0144F83AD30484B9C8674D7F61D068E4B7276FFE077B")
  const k = await importSecretKey(KeyAb);

  try{
    const dec_buffer = await decryptMessage(k, ciphertext)
    let dec = new TextDecoder();
    const dec_message = dec.decode(dec_buffer)
    document.getElementById("getResult").innerHTML=dec_message
  } catch (e){
    console.log(e)
  }

}

async function get_messages() {
  const params = {
      method:"GET",
  }
  
  const res = await fetch(URL+"mensaje/",params)
  const data = await res.json()
  const mensajes = data.mensajes

  if (res.status == 200) {
    let table = document.getElementById("table")
    table.innerHTML = "";
    let keys = Object.keys(mensajes[0]);
    generateTable(table, mensajes);
    generateTableHead(table, keys); 
  }
}


function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}

