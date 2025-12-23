
// Simple XOR Cipher + Base64 encoding to prevent casual tampering in LocalStorage
// In a real production app, this logic happens on the Server (Database).

const SECRET_SALT = "ODAA_SECURE_V1_SALT_KEY_992834";

const encrypt = (text: string): string => {
  try {
    const textToChars = (text: string) => text.split("").map((c) => c.charCodeAt(0));
    const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = (code: any) => textToChars(SECRET_SALT).reduce((a, b) => a ^ b, code);

    return text
      .split("")
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join("");
  } catch (e) {
    console.error("Encryption failed", e);
    return "";
  }
};

const decrypt = (encoded: string): string => {
  try {
    const textToChars = (text: string) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code: any) => textToChars(SECRET_SALT).reduce((a, b) => a ^ b, code);
    
    return (encoded.match(/.{1,2}/g) || [])
      .map((hex) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("");
  } catch (e) {
    console.error("Decryption failed", e);
    return "";
  }
};

export const SecureStorage = {
  getItem: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      
      // Attempt to decrypt
      const decrypted = decrypt(item);
      if (!decrypted) return fallback;

      return JSON.parse(decrypted);
    } catch (error) {
      console.warn(`Error loading secure key ${key}, resetting to default.`);
      return fallback;
    }
  },

  setItem: (key: string, value: any) => {
    try {
      const stringified = JSON.stringify(value);
      const encrypted = encrypt(stringified);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error(`Error saving secure key ${key}`, error);
    }
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
      localStorage.clear();
  }
};
