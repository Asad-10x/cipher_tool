// Get DOM elements
const plaintextInput = document.getElementById("plaintext");
const algorithmSelect = document.getElementById("algorithm");
const encryptionKeyInput = document.getElementById("encryptionKey");
const caesarShiftInput = document.getElementById("caesarShift");
const outputTextarea = document.getElementById("output");
const encryptBtn = document.getElementById("encryptBtn");
const decryptBtn = document.getElementById("decryptBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const messageDiv = document.getElementById("message");
const keySection = document.getElementById("keySection");
const shiftSection = document.getElementById("shiftSection");

// Show/hide additional input fields based on selected algorithm
algorithmSelect.addEventListener("change", function () {
  const algorithm = this.value;

  // Hide all optional sections first
  keySection.style.display = "none";
  shiftSection.style.display = "none";
  decryptBtn.style.display = "none";

  // Show relevant sections based on algorithm
  if (algorithm === "aes") {
    keySection.style.display = "block";
    decryptBtn.style.display = "inline-block";
  } else if (algorithm === "caesar") {
    shiftSection.style.display = "block";
    decryptBtn.style.display = "inline-block";
  } else if (algorithm === "base64") {
    decryptBtn.style.display = "inline-block";
  }

  // Clear previous messages
  hideMessage();
});

// Caesar Cipher Encryption
function caesarEncrypt(text, shift) {
  let result = "";
  shift = parseInt(shift);

  for (let i = 0; i < text.length; i++) {
    let char = text[i];

    if (char.match(/[a-z]/i)) {
      const code = text.charCodeAt(i);

      // Uppercase letters
      if (code >= 65 && code <= 90) {
        char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      // Lowercase letters
      else if (code >= 97 && code <= 122) {
        char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
    }

    result += char;
  }

  return result;
}

// Caesar Cipher Decryption
function caesarDecrypt(text, shift) {
  return caesarEncrypt(text, 26 - parseInt(shift));
}

// AES Encryption (using simple XOR-based encryption)
function aesEncrypt(text, key) {
  if (!key || key.trim() === "") {
    throw new Error("Encryption key is required for AES");
  }
  return CryptoUtils.simpleEncrypt(text, key);
}

// AES Decryption (using simple XOR-based decryption)
function aesDecrypt(ciphertext, key) {
  if (!key || key.trim() === "") {
    throw new Error("Encryption key is required for AES decryption");
  }

  try {
    return CryptoUtils.simpleDecrypt(ciphertext, key);
  } catch (e) {
    throw new Error("Decryption failed. Invalid key or corrupted data.");
  }
}

// Base64 Encoding
function base64Encode(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

// Base64 Decoding
function base64Decode(text) {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch (e) {
    throw new Error("Invalid Base64 string");
  }
}

// SHA-256 Hashing
async function sha256Hash(text) {
  return await CryptoUtils.sha256(text);
}

// Validate inputs
function validateInputs(isDecryption = false) {
  const plaintext = plaintextInput.value.trim();
  const algorithm = algorithmSelect.value;

  if (!plaintext) {
    showMessage(
      "Please enter text to " + (isDecryption ? "decrypt" : "encrypt"),
      "error"
    );
    return false;
  }

  if (!algorithm) {
    showMessage("Please select an encryption algorithm", "error");
    return false;
  }

  if (algorithm === "aes" && !encryptionKeyInput.value.trim()) {
    showMessage("Please enter an encryption key for AES", "error");
    return false;
  }

  if (algorithm === "caesar" && !caesarShiftInput.value) {
    showMessage("Please enter a shift value for Caesar Cipher", "error");
    return false;
  }

  if (
    (algorithm === "caesar" && caesarShiftInput.value < 1) ||
    caesarShiftInput.value > 25
  ) {
    showMessage(
      "Please enter a valid shift value for Caesar Cipher (1-25)",
      "error"
    );
    return false;
  }

  return true;
}

// Show message
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = "message " + type;
}

// Hide message
function hideMessage() {
  messageDiv.className = "message";
  messageDiv.style.display = "none";
}

// Encrypt button click handler
encryptBtn.addEventListener("click", async function () {
  if (!validateInputs(false)) return;

  const plaintext = plaintextInput.value.trim();
  const algorithm = algorithmSelect.value;
  let result = "";

  try {
    switch (algorithm) {
      case "caesar":
        const shift = caesarShiftInput.value;
        result = caesarEncrypt(plaintext, shift);
        showMessage(
          "Text encrypted successfully using Caesar Cipher!",
          "success"
        );
        break;

      case "aes":
        const key = encryptionKeyInput.value.trim();
        result = aesEncrypt(plaintext, key);
        showMessage("Text encrypted successfully using AES!", "success");
        break;

      case "base64":
        result = base64Encode(plaintext);
        showMessage("Text encoded successfully using Base64!", "success");
        break;

      case "sha256":
        result = await sha256Hash(plaintext);
        showMessage(
          "Hash generated successfully using SHA-256! (Note: This is one-way hashing)",
          "info"
        );
        break;

      default:
        showMessage("Please select a valid algorithm", "error");
        return;
    }

    outputTextarea.value = result;
    copyBtn.style.display = "block";
  } catch (error) {
    showMessage("Encryption error: " + error.message, "error");
  }
});

// Decrypt button click handler
decryptBtn.addEventListener("click", function () {
  if (!validateInputs(true)) return;

  const ciphertext = plaintextInput.value.trim();
  const algorithm = algorithmSelect.value;
  let result = "";

  try {
    switch (algorithm) {
      case "caesar":
        const shift = caesarShiftInput.value;
        result = caesarDecrypt(ciphertext, shift);
        showMessage(
          "Text decrypted successfully using Caesar Cipher!",
          "success"
        );
        break;

      case "aes":
        const key = encryptionKeyInput.value.trim();
        result = aesDecrypt(ciphertext, key);
        showMessage("Text decrypted successfully using AES!", "success");
        break;

      case "base64":
        result = base64Decode(ciphertext);
        showMessage("Text decoded successfully using Base64!", "success");
        break;

      default:
        showMessage("Decryption not available for this algorithm", "error");
        return;
    }

    outputTextarea.value = result;
    copyBtn.style.display = "block";
  } catch (error) {
    showMessage("Decryption error: " + error.message, "error");
  }
});

// Clear button click handler
clearBtn.addEventListener("click", function () {
  plaintextInput.value = "";
  outputTextarea.value = "";
  algorithmSelect.value = "";
  encryptionKeyInput.value = "";
  caesarShiftInput.value = "3";
  keySection.style.display = "none";
  shiftSection.style.display = "none";
  decryptBtn.style.display = "none";
  copyBtn.style.display = "none";
  hideMessage();
});

// Copy to clipboard button click handler
copyBtn.addEventListener("click", function () {
  outputTextarea.select();
  document.execCommand("copy");
  showMessage("Copy Hogya...", "success");

  // Change button text temporarily
  const originalText = copyBtn.textContent;
  copyBtn.textContent = "Copy Hogya...";
  setTimeout(function () {
    copyBtn.textContent = originalText;
  }, 2000);
});

// Hide message when user starts typing
plaintextInput.addEventListener("input", hideMessage);
