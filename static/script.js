URL = "http://localhost:8000/"

const g = 2

const p_hex = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3" +
  "CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5" +
  "AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356" +
  "208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28F" +
  "B5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF"

const n = '00C5C2A55B51764AA28E2B7E650F601CEAE6334BA99771A2F8B0C1085E9EEDAA96D3C040CEC539CA922F0A666562E7A9E3111A348' +
  'AB41088D9E5B65251F2CAD23A6B31CFC92E90F919DAA5EEA24D05D84D4BD7466A3159353AB85D738C4214EAD0C2CA7F4B3CA5D0AD2510DCF4E0E' +
  '732557B9C2C14B1E0AFD9DAD263926220ACEA9D10F12180B2BF85937413D87596A34C243A141C1F3360812E80A2320A424BF1E4FC27ACFC5A64C' +
  '6BB3BFEE07F401D2FC01AEAE7584CACC0315AA9FFBF51F604516311E261510C2FB0138319224815BB8A81BC9F4D32A268859473F691AC73CFBA8' +
  'FB16ADD1C6BD7CB39B1A75D91E70B5FDB78200CE46C5FD664887841657E17'

const d = '44E9BAC0932713040961CBA640D0DFD2D54C1BBA29DD7E0A866185DE9F2837D15E51B8E3B4E39A1D0DCA647B411774627D83B1BA81DBDF2C7B3968FF488977EFC689F19BEC1FB5C656248B7F4032E0B8B2CC7E2BA42DAF785A65AA4DBE7B56864FD2CBBFF68EDBA4726DA969A5F3BADD01F99E7CC9AD7FE9FD30626550CF8D2189440EDF899B3801C588F6B52A457DD4871A0C9AB965D83B426EF96949E96FADC0BCBE9D134B09FCAD7CB4DA1B97212822A32C6B0EB37D0AB8F61557CCAE47C5BC481FEE2326E23675A783547067C20994C8B75555ADE8058FBDA2DB8F3F270372C7BC4B3C438E0A16C2EF7ECD9B5B1891CA495F759367698A1B2837886683F1'

// function toHexString(byteArray) {
//   var s = '';
//   byteArray.forEach(function (byte) {
//     s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
//   });
//   return s;
// }

function toHexString(byteArray) {
  return Array.prototype.map.call(byteArray, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function hexToArrayBuffer(input) {
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

async function h(message) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return toHexString(hashArray)
}

function importSecretKey(rawKey) {
  return window.crypto.subtle.importKey("raw", rawKey, "AES-CBC", true, [
    "encrypt",
    "decrypt",
  ]);
}


function encryptMessage(message, key, iv) {
  let encoded = message

  return window.crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    encoded,
  );
}

async function login() {
  // creamos el reto de alice y lo enviamos
  const rArray = window.crypto.getRandomValues(new Uint8Array(16))
  const ra = toHexString(rArray)
  const data1 = await ssh1(ra)


  const rb = data1.rb
  // creamos a, calculamos g^a mod p y lo enviamos
  const aArray = window.crypto.getRandomValues(new Uint8Array(16))
  const a = bigInt(aArray.join(''))
  const p = bigInt(p_hex, 16)
  const ga_mod_p = bigInt(g).modPow(a, p).toString(16)
  const data2 = await ssh2(ga_mod_p)


  const nb = bigInt(data2.PB.N, 16)
  const e = data2.PB.e
  const sb = bigInt(data2.SB, 16)
  const gb_mod_p = data2.gb_mod_p
  // calculamos g^ab mod p
  const k = await h(bigInt(gb_mod_p, 16).modPow(a, p).toString(16))
  // verificamos la firma del servidor
  const hb = sb.modPow(bigInt(e, 16), nb).toString(16)
  const ha = await h("Alice" + "Bob" + ra + rb + ga_mod_p + gb_mod_p + k.toUpperCase())
  console.assert(hb == ha, 'error autenticando al servidor')
  // calculamos sa
  const s = bigInt(stringToHex(ha.toUpperCase() + 'Alice'), 16)
  const sa = s.modPow(bigInt(d, 16), bigInt(n, 16)).toString(16)
  // encriptamos y enviamos el mensaje
  const m = new TextEncoder().encode('010001' + "Alice" + sa.toUpperCase())
  const kab = hexToArrayBuffer(k)
  const simk = await importSecretKey(kab)
  const ivArray = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = toHexString(ivArray)
  const enc_buffer = await encryptMessage(m, simk, ivArray)
  const enc_Array = new Uint8Array(enc_buffer)
  const encripcion = toHexString(enc_Array)

  const data3 = await ssh3(encripcion, iv)
  console.log(data3)

  const sendButton = document.getElementById("send-button")
  sendButton.addEventListener("click", () => { send_message(simk,ivArray) })

  const messageButton = document.getElementById('message-button')
  messageButton.addEventListener("click", () => { get_message(k,iv) })

  const messagesButton = document.getElementById('messages-button')
  messagesButton.addEventListener("click", () => { get_messages(k,iv) })
}

const stringToHex = (str) => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const hexValue = charCode.toString(16);

    // Pad with zeros to ensure two-digit representation
    hex += hexValue.padStart(2, '0');
  }
  return hex;
};

const hexToString = (hex) => {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const hexValue = hex.substr(i, 2);
    const decimalValue = parseInt(hexValue, 16);
    str += String.fromCharCode(decimalValue);
  }
  return str;
};

async function ssh1(ra) {

  const body = { username: "Alice", ra: ra }

  const params = {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-type": "application/json"
    }
  }

  const res = await fetch(URL + "ssh1/", params)
  const data = await res.json()

  if (res.status == 200) {
    return data
  }
  else {
    alert(res.status + '  ' + res.statusText + '\n' + data.message)
  }
}

async function ssh2(ga_mod_p) {
  const body = {
    ga_mod_p: ga_mod_p
  }

  const params = {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "Content-type": "application/json"
    }
  }

  const res = await fetch(URL + "ssh2/", params)
  const data = await res.json()

  if (res.status == 200) {
    return data
  }
  else {
    alert(res.status + '  ' + res.statusText + '\n' + data.message)
  }

}

async function ssh3(encripcion, iv) {
  const body = {
    encripcion: encripcion,
    iv: iv
  }

  const params = {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "Content-type": "application/json"
    }
  }

  const res = await fetch(URL + "ssh3/", params)
  const data = await res.json()

  if (res.status == 200) {
    return data
  }
  else {
    alert(res.status + '  ' + res.statusText + '\n' + data.message)
  }

}

function getMessageEncoding() {
  const messageBox = document.querySelector("#message");
  let message = messageBox.value
  let enc = new TextEncoder()
  return enc.encode(message)
}

function encryptMessageB(key, iv) {
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

async function send_message(k,ivArray) {

  // const iv = "7be219757228099f1bc4a47000d38b13"
  // const IvAb = hexToArrayBuffer(iv)
  // const KeyAb = hexToArrayBuffer("ADBF05D88B596D1E5D2A0144F83AD30484B9C8674D7F61D068E4B7276FFE077B")
  // const KeyAb = hexToArrayBuffer(k.toUpperCase())
  // const sk = await importSecretKey(KeyAb);
  // const enc_buffer = await encryptMessageB(sk, IvAb)
  // const enc_Array = new Uint8Array(enc_buffer)
  // const enc_message = toHexString(enc_Array)

  const messageBox = document.getElementById("message")
  let message = messageBox.value;
  console.log(message)
  let enc = new TextEncoder().encode(message)

  const buf2 = await encryptMessage(enc, k, ivArray)
  let em2 = toHexString(new Uint8Array(buf2)).toUpperCase()
  console.log(em2)
  // console.log(enc_message)
  // console.log(iv)

  const body = {
    iv: toHexString(ivArray),
    texto: em2
  }

  const params = {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-type": "application/json"
    }
  }

  const res = await fetch(URL + "mensaje/", params)
  const data = await res.json()

  document.getElementById("sendResult").innerHTML = data.message

}

function hexToInt(inputStr) {
  var hex = inputStr.toString();
  var Uint8Array = new Array();
  for (var n = 0; n < hex.length; n += 2) {
    Uint8Array.push(parseInt(hex.substr(n, 2), 16));
  }
  return Uint8Array;
}

async function decryptMessage(key, iv, ciphertext) {
  const cipherArray = hexToInt(ciphertext)
  const cipherBuffer = new Uint8Array(cipherArray).buffer
  //   const iv = "7be219757228099f1bc4a47000d38b13"
    const IvAb = hexToArrayBuffer(iv)
  return window.crypto.subtle.decrypt({ name: "AES-CBC", iv: IvAb }, key, cipherBuffer);
}

async function get_message(k,iv) {
  const params = {
    method: "GET",
  }

  const messageBox = document.querySelector("#messageId")
  let messageId = messageBox.value

  const res = await fetch(URL + "mensaje/" + messageId + "/", params)
  const data = await res.json()
  const ciphertext = data.texto.slice(0, 32)
  const KeyAb = hexToArrayBuffer(k)
  const sk = await importSecretKey(KeyAb)
  const ivab = hexToArrayBuffer(iv)

  try {
    const dec_buffer = await decryptMessage(sk, ivab, ciphertext)
    let dec = new TextDecoder();
    const dec_message = dec.decode(dec_buffer)
    document.getElementById("getResult").innerHTML = dec_message
  } catch (e) {
    console.log(e)
  }

}

async function get_messages(k,iv) {

  console.log(k, iv)

  const params = {
    method: "GET",
  }

  const res = await fetch(URL + "mensaje/", params)
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
    for (let key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}

const loginButton = document.getElementById('login')
loginButton.addEventListener('click', login)