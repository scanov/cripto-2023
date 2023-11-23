URL = "http://localhost:8000/"

g = 2

p_hex = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3" +
    "CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5" +
    "AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356" +
    "208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28F" +
    "B5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF"

p = BigInt('0x'+p_hex)

function toHexString(byteArray) {
    var s = '';
    byteArray.forEach(function(byte) {
      s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
    });
    return s;
  }

function expmod( base, exp, mod ){
    if (exp == 0n) return 1n;
    if (exp % BigInt(2n) == 0){
      return BigInt(expmod( base, (exp / 2n), mod**2n) % mod);
    }
    else {
      return BigInt((base * expmod( base, (exp - 1n), mod)) % mod);
    }
  }


async function login() {
    // const rArray = new Uint8Array(16)
    // const ra = window.crypto.getRandomValues(rArray);
    // const data1 = await ssh1(toHexString(ra))
    const ra = "96f0bd8842a298cdb2c97575b7060eb9"
    const data1 = await ssh1(ra)
    console.log(data1)
    // const aArray = new Uint8Array(16)
    // const a = window.crypto.getRandomValues(aArray);
    // const aHex = toHexString(a)
    const ga_mod_p = "69ac02abd8c4ac3e7ed7af94a89092d3305c06cddbc1407808b426838e727edbb0631eba5eec0ebcdfef39f7430e501765adb36a52c2c635eea2a26facb5502afbfaea05fee452abb2e8e4bf243c4164c02ad65eec68498030207a4150ca428788c5451b52ed71a7f2aefd3a8454a6bd415e1990f0085ace40499d894c08178c0a6e3ce8439e6b435b09bed7bbe05ec44c74777bb2af92d786065d4a46fd3cbfadb889d1e820bc8e559581377c0b053851850e5910e73aa0dae94d296454d7ed1cab0bc2167149c05419e3ace166877f71403312b8f0f7e794b2628b7e321333134b7691f1ec5b5fba26ba053f6b4c63c0324c48de34e4ab13d1bae629ec075"
    const data2 = await ssh2(ga_mod_p)
    console.log(data2)
    const encripcion = "677db1fbd23af71d67220fc94fece5f875e87e0a2ae93bd5dbcd625ea147de2e4e2bfddadf6c172c06c6154b99ae801630a8526393d47bafba86282738cd4cbe6a74db93e2726ee6e58653dac228bc07d131df55020a5e72c4bf2750471c3009e865e95550f734938be4db09ec45106f88fbd90a8372cfe071be0e5426203bdf97356a86f08a7deae06cb289ee6a9bdefd2ecb969dc670c751edd02ee7c8a3e581895bd2c4833be644cd19de678f016f38c628c45f0d2bde895c54eaf67f719e5b54502c15655ce4dac961b10ce0bc55d5cedd3a36d356c8576788b0090934f8dea6792206274e3c7deddbbbe988be6af7d0e30f9d48b50944b85bdbb7f7e635a186d41a6ead543411eaa0dd21a743d7f46daa60944576ae50dd4f35502628359878a9d610b6d25a9550eaff5f8806915dc7f984a2559c6c772c3a34672d4a78ae305e45bd226feef36b012aff494db4fcf94c853ed82a916bbd51d496f3496874221e75c7836b2ac3e4ec0dd57e26fba6b97227951eed903c5c7ecfd9550b0eb70f4c35a6903bd6712f936b4cc8694cd03ed81dcbfdf3e9b833ea62a599aa7ee66ece487c294c22ea451286adf2fc8cf253ab3f786d3c8a8a9a1e2da9c6c3eaaed4865b97da1ec5e305f414e6b9c2d6edd481e9f61695750ed0d5aaa7f785ed28040651489f6104c5e667bc7661165bc050aa235701f8fd4e2de56d9dce69428ec4b49f6672f5a778263b4f8a93f83d"
    const iv = "90dce8cee5be815aec8a92b7591c9d80"
    const data3 = await ssh3(encripcion,iv)
    console.log(data3)
  }

async function ssh1(ra) {

    body = {username: "Alice",ra: ra }

    const params = {
        method:"POST",
        body: JSON.stringify(body),
        headers: {
            "Content-type": "application/json"
          }
    }

    const res = await fetch(URL+"ssh1/",params)
    const data = await res.json()

    return data
  }

async function ssh2(ga_mod_p){
    body = {
        ga_mod_p: ga_mod_p
    }

    const params = {
        method:"PUT",
        body: JSON.stringify(body),
        headers: {
            "Content-type": "application/json"
          }
    }

    const res = await fetch(URL+"ssh2/",params)
    const data = await res.json()

    return data

  }

async function ssh3(encripcion,iv){
    body = {
        encripcion : encripcion,
        iv : iv
    }

    const params = {
        method:"PUT",
        body: JSON.stringify(body),
        headers: {
            "Content-type": "application/json"
          }
    }

    const res = await fetch(URL+"ssh3/",params)
    const data = await res.json()

    return data

    }

