const inputSlider = document.getElementById("inputSlider");
const sliderValue = document.getElementById("sliderValue");
const passBox = document.getElementById("passBox");
const lowercaseEl = document.getElementById("lowercase");
const uppercaseEl = document.getElementById("Uppercase");
const numbersEl = document.getElementById("numbers");
const symbolsEl = document.getElementById("symbols");
const generateBtnEl = document.getElementById("getBtn");
const copyIcon = document.getElementById("copyIcon");
const togglePassword = document.getElementById("togglePassword");
const darkModeToggle = document.getElementById("darkModeToggle");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");
const entropyValue = document.getElementById("entropyValue");
const passwordCategories = document.getElementById("passwordCategories");
const passwordHistory = document.getElementById("passwordHistory");
const charCounter = document.getElementById("charCounter");
const avoidSimilarEl = document.getElementById("avoidSimilar");
const avoidWordsEl = document.getElementById("avoidWords");
const autoCopyEl = document.getElementById("autoCopy");
const modeBtns = document.querySelectorAll(".mode-btn");
const randomPasswordOptions = document.getElementById("randomPasswordOptions");
const memorablePasswordOptions = document.getElementById("memorablePasswordOptions");
const wordCountEl = document.getElementById("wordCount");
const separatorEl = document.getElementById("separator");
const capitalizeWordsEl = document.getElementById("capitalizeWords");
const addNumberEl = document.getElementById("addNumber");

const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = "!£$%^&*()_+[]<>?/;:-=,.{}`~";
const similarCharacters = "O0Il1";

// Common English words for memorable passwords
const commonWords = [
    "correct", "horse", "battery", "staple", "apple", "banana", "orange", "purple",
    "green", "blue", "red", "yellow", "mountain", "river", "ocean", "forest",
    "happy", "sunny", "cloudy", "rainy", "strong", "fast", "slow", "quiet",
    "loud", "soft", "hard", "light", "dark", "warm", "cold", "sweet",
    "sour", "bitter", "fresh", "stale", "new", "old", "young", "ancient"
];

let passwordHistoryList = [];
const MAX_HISTORY = 5;

// Initialize dark mode
const initializeDarkMode = () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    darkModeToggle.checked = isDarkMode;
};

initializeDarkMode();

// Dark mode toggle
darkModeToggle.addEventListener('change', () => {
    const isDarkMode = darkModeToggle.checked;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', isDarkMode);
});

// Mode switching
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        randomPasswordOptions.style.display = mode === 'random' ? 'block' : 'none';
        memorablePasswordOptions.style.display = mode === 'memorable' ? 'block' : 'none';
    });
});

// Update slider value and character counter
const updateCounters = () => {
    sliderValue.textContent = inputSlider.value;
    charCounter.textContent = `${passBox.value.length} characters`;
};

inputSlider.addEventListener("input", updateCounters);

// Toggle password visibility
togglePassword.addEventListener("click", () => {
    const type = passBox.getAttribute("type") === "password" ? "text" : "password";
    passBox.setAttribute("type", type);
    togglePassword.innerHTML = type === "password" ? 
        '<i class="fas fa-eye"></i>' : 
        '<i class="fas fa-eye-slash"></i>';
});

// Calculate entropy
const calculateEntropy = (password, possibleChars) => {
    const length = password.length;
    const poolSize = possibleChars.length;
    const entropy = Math.log2(Math.pow(poolSize, length));
    return Math.round(entropy);
};

// Calculate password strength using zxcvbn
const calculatePasswordStrength = (password) => {
    const result = zxcvbn(password);
    const score = result.score;
    const entropy = result.guesses_log10 * Math.LOG2E; // Convert to bits

    let strengthClass, strengthMessage;
    if (score <= 1) {
        strengthClass = 'weak';
        strengthMessage = 'Weak';
        strengthBar.style.backgroundColor = 'var(--error-color)';
        strengthBar.style.width = '25%';
    } else if (score <= 2) {
        strengthClass = 'medium';
        strengthMessage = 'Medium';
        strengthBar.style.backgroundColor = 'var(--warning-color)';
        strengthBar.style.width = '50%';
    } else if (score <= 3) {
        strengthClass = 'strong';
        strengthMessage = 'Strong';
        strengthBar.style.backgroundColor = 'var(--success-color)';
        strengthBar.style.width = '75%';
    } else {
        strengthClass = 'very-strong';
        strengthMessage = 'Very Strong';
        strengthBar.style.backgroundColor = 'var(--success-color)';
        strengthBar.style.width = '100%';
    }

    strengthText.textContent = `Password Strength: ${strengthMessage}`;
    entropyValue.textContent = `Entropy: ${Math.round(entropy)} bits`;
    return { strengthClass, score, entropy };
};

// Update password categories display
const updatePasswordCategories = (password) => {
    const categories = {
        uppercase: (password.match(/[A-Z]/g) || []).length,
        lowercase: (password.match(/[a-z]/g) || []).length,
        numbers: (password.match(/[0-9]/g) || []).length,
        symbols: (password.match(/[^A-Za-z0-9]/g) || []).length
    };

    Object.entries(categories).forEach(([category, count]) => {
        const element = passwordCategories.querySelector(`.${category}`);
        if (element) {
            element.textContent = `${count} ${category}`;
        }
    });
};

// Generate random password
const generateRandomPassword = () => {
    const length = parseInt(inputSlider.value);
    let characters = "";
    let password = "";

    if (lowercaseEl.checked) characters += lowercaseLetters;
    if (uppercaseEl.checked) characters += uppercaseLetters;
    if (numbersEl.checked) characters += numbers;
    if (symbolsEl.checked) characters += symbols;

    if (avoidSimilarEl.checked) {
        characters = characters.split('').filter(char => !similarCharacters.includes(char)).join('');
    }

    if (characters === "") {
        alert("Please select at least one character type!");
        return null;
    }

    while (password.length < length) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        password += char;
    }

    if (avoidWordsEl.checked) {
        // Check if the password contains any common words
        const containsCommonWord = commonWords.some(word => 
            password.toLowerCase().includes(word.toLowerCase())
        );
        if (containsCommonWord) {
            return generateRandomPassword(); // Try again
        }
    }

    return password;
};

// Generate memorable password
const generateMemorablePassword = () => {
    const wordCount = parseInt(wordCountEl.value);
    const separator = separatorEl.value;
    const capitalize = capitalizeWordsEl.checked;
    const addNumber = addNumberEl.checked;

    let words = [];
    for (let i = 0; i < wordCount; i++) {
        let word = commonWords[Math.floor(Math.random() * commonWords.length)];
        if (capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        words.push(word);
    }

    let password = words.join(separator);
    if (addNumber) {
        password += separator + Math.floor(Math.random() * 9000 + 1000);
    }

    return password;
};

// Add password to history
const addToHistory = (password) => {
    if (password && !passwordHistoryList.includes(password)) {
        passwordHistoryList.unshift(password);
        if (passwordHistoryList.length > MAX_HISTORY) {
            passwordHistoryList.pop();
        }
        localStorage.setItem('passwordHistory', JSON.stringify(passwordHistoryList));
        updateHistoryDisplay();
    }
};

// Load password history from localStorage
const loadPasswordHistory = () => {
    const savedHistory = localStorage.getItem('passwordHistory');
    if (savedHistory) {
        passwordHistoryList = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
};

// Update history display
const updateHistoryDisplay = () => {
    passwordHistory.innerHTML = '';
    passwordHistoryList.forEach(pass => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = pass;
        historyItem.addEventListener('click', () => {
            passBox.value = pass;
            calculatePasswordStrength(pass);
            updatePasswordCategories(pass);
            updateCounters();
        });
        passwordHistory.appendChild(historyItem);
    });
};

// Copy password
const copyPassword = async () => {
    if (passBox.value && passBox.value.length >= 10) {
        try {
            await navigator.clipboard.writeText(passBox.value);
            const tooltip = copyIcon.querySelector('.tooltip');
            tooltip.style.opacity = '1';
            tooltip.textContent = 'Copied!';
            setTimeout(() => {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    tooltip.textContent = 'Copy';
                }, 300);
            }, 1000);
        } catch (error) {
            console.error("Failed to copy text: ", error);
        }
    } else {
        alert("Please generate a password first!");
    }
};

// Generate button click handler
generateBtnEl.addEventListener("click", () => {
    const activeMode = document.querySelector('.mode-btn.active').dataset.mode;
    const password = activeMode === 'random' ? generateRandomPassword() : generateMemorablePassword();
    
    if (password) {
        passBox.value = password;
        passBox.classList.add('generated');
        setTimeout(() => passBox.classList.remove('generated'), 300);
        
        calculatePasswordStrength(password);
        updatePasswordCategories(password);
        updateCounters();
        addToHistory(password);

        if (autoCopyEl.checked) {
            copyPassword();
        }
    }
});

// Copy password
copyIcon.addEventListener("click", copyPassword);

// Initialize
loadPasswordHistory();
updateCounters();
