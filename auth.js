// Auth state
let currentUser = null
let apiKey = 'API KEY' // Replace with your actual Gametize API key

// Create auth modal
const authModal = document.createElement('div')
authModal.id = 'authModal'
authModal.className = 'modal'
authModal.style.display = 'none'
authModal.innerHTML = `
    <div class="modal-content auth-modal-content">
        <h2 id="authModalTitle">Sign In</h2>
        <form id="authForm">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" required>
            </div>
            <div class="modal-buttons">
                <button type="submit" class="submit-btn">Submit</button>
                <button type="button" id="cancelAuthBtn" class="cancel-btn">Cancel</button>
            </div>
        </form>
    </div>
`

// Add auth modal to body
document.body.appendChild(authModal)

// Event Listeners
document.getElementById('signInBtn').addEventListener('click', () => showAuthModal('Sign In'))
document.getElementById('signUpBtn').addEventListener('click', () => window.open('https://gametize.com/registermobile', '_blank'))
document.getElementById('signOutBtn').addEventListener('click', signOut)
document.getElementById('cancelAuthBtn').addEventListener('click', hideAuthModal)
document.getElementById('authForm').addEventListener('submit', handleAuthSubmit)

// Auth Functions
async function handleAuthSubmit(e) {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    try {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('api_key', apiKey);

        const response = await fetch('https://gametize.com/api2/login.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        })

        const data = await response.json()
        
        if (data.code === 200) {
            currentUser = {
                id: data.user_id,
                email: email,
                name: data.name || email
            }
            // Store session key
            localStorage.setItem('gametizeSessionKey', data.sessionKey)
            updateAuthUI()
            hideAuthModal()
            // Store user info in localStorage for persistence
            localStorage.setItem('gametizeUser', JSON.stringify(currentUser))
        } else {
            throw new Error(data.message || 'Login failed')
        }
    } catch (error) {
        alert(error.message || 'Login failed. Please check your credentials and try again.')
    }
}

function signOut() {
    currentUser = null
    localStorage.removeItem('gametizeUser')
    localStorage.removeItem('gametizeSessionKey')
    updateAuthUI()
}

function showAuthModal(mode) {
    document.getElementById('authModalTitle').textContent = mode
    document.getElementById('authModal').style.display = 'block'
}

function hideAuthModal() {
    document.getElementById('authModal').style.display = 'none'
    document.getElementById('authForm').reset()
}

function updateAuthUI() {
    const signInBtn = document.getElementById('signInBtn')
    const signUpBtn = document.getElementById('signUpBtn')
    const signOutBtn = document.getElementById('signOutBtn')

    if (currentUser) {
        signInBtn.style.display = 'none'
        signUpBtn.style.display = 'none'
        signOutBtn.style.display = 'block'
    } else {
        signInBtn.style.display = 'block'
        signUpBtn.style.display = 'block'
        signOutBtn.style.display = 'none'
    }
}

// Check for existing session in localStorage
const savedUser = localStorage.getItem('gametizeUser')
if (savedUser) {
    currentUser = JSON.parse(savedUser)
    updateAuthUI()
}

// Export for use in game.js
window.auth = {
    getCurrentUser: () => currentUser,
    isAuthenticated: () => !!currentUser
} 