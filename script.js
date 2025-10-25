let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

const trains = [
    {
        name: "Rajdhani Express",
        number: "12301",
        departure: "06:00 AM",
        arrival: "02:30 PM",
        duration: "8h 30m",
        price: { "AC First Class": 2500, "AC 2-Tier": 1800, "AC 3-Tier": 1200, "Sleeper": 600, "Second Sitting": 300 }
    },
    {
        name: "Shatabdi Express",
        number: "12002",
        departure: "08:15 AM",
        arrival: "04:45 PM",
        duration: "8h 30m",
        price: { "AC First Class": 2300, "AC 2-Tier": 1600, "AC 3-Tier": 1000, "Sleeper": 550, "Second Sitting": 280 }
    },
    {
        name: "Duronto Express",
        number: "12259",
        departure: "10:30 AM",
        arrival: "07:00 PM",
        duration: "8h 30m",
        price: { "AC First Class": 2700, "AC 2-Tier": 1900, "AC 3-Tier": 1300, "Sleeper": 650, "Second Sitting": 320 }
    },
    {
        name: "Garib Rath",
        number: "12909",
        departure: "01:00 PM",
        arrival: "09:30 PM",
        duration: "8h 30m",
        price: { "AC First Class": 2000, "AC 2-Tier": 1400, "AC 3-Tier": 900, "Sleeper": 450, "Second Sitting": 250 }
    },
    {
        name: "Superfast Express",
        number: "12423",
        departure: "04:45 PM",
        arrival: "01:15 AM",
        duration: "8h 30m",
        price: { "AC First Class": 2400, "AC 2-Tier": 1700, "AC 3-Tier": 1100, "Sleeper": 580, "Second Sitting": 290 }
    }
];

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setMinDate();
    updateUIForAuth();
});

function initializeApp() {
    if (currentUser) {
        document.getElementById('loginBtn').innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.name}`;
        loadUserBookings();
    }
}

function setupEventListeners() {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtns = document.querySelectorAll('.close');

    loginBtn.addEventListener('click', () => {
        if (currentUser) {
            logout();
        } else {
            loginModal.style.display = 'block';
        }
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    document.getElementById('showSignup').addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'block';
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('bookingForm').addEventListener('submit', searchTrains);

    document.getElementById('swapStations').addEventListener('click', swapStations);

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('href').substring(1);
            scrollToSection(target);
        });
    });
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('journeyDate').setAttribute('min', today);
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('loginModal').style.display = 'none';
        showNotification('Login successful!', 'success');
        updateUIForAuth();
        loadUserBookings();
    } else {
        showNotification('Invalid credentials!', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;

    if (users.find(u => u.email === email)) {
        showNotification('Email already exists!', 'error');
        return;
    }

    const newUser = { name, email, phone, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    document.getElementById('signupModal').style.display = 'none';
    showNotification('Account created successfully!', 'success');
    updateUIForAuth();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginBtn').innerHTML = '<i class="fas fa-user"></i> Login';
    showNotification('Logged out successfully!', 'success');
    updateUIForAuth();
}

function updateUIForAuth() {
    const loginBtn = document.getElementById('loginBtn');
    if (currentUser) {
        loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.name}`;
        loginBtn.onclick = logout;
    } else {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
        loginBtn.onclick = () => document.getElementById('loginModal').style.display = 'block';
    }
}

function searchTrains(e) {
    e.preventDefault();

    const from = document.getElementById('fromStation').value;
    const to = document.getElementById('toStation').value;
    const date = document.getElementById('journeyDate').value;
    const trainClass = document.getElementById('trainClass').value;
    const passengers = parseInt(document.getElementById('passengers').value);

    if (from === to) {
        showNotification('From and To stations cannot be the same!', 'error');
        return;
    }

    if (!from || !to || !date || !trainClass) {
        showNotification('Please fill all fields!', 'error');
        return;
    }

    displayTrains(from, to, date, trainClass, passengers);
}

function displayTrains(from, to, date, trainClass, passengers) {
    const resultsContainer = document.getElementById('trainResults');
    resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Searching trains...</p></div>';

    setTimeout(() => {
        resultsContainer.innerHTML = '';
        
        trains.forEach((train, index) => {
            const availability = Math.random() > 0.3 ? 'Available' : 'Waiting List';
            const availabilityClass = availability === 'Available' ? 'available' : 'waiting';
            const price = train.price[trainClass] * passengers;

            const trainCard = `
                <div class="train-card" style="animation-delay: ${index * 0.1}s">
                    <div class="train-header">
                        <div>
                            <div class="train-name">${train.name}</div>
                            <div class="train-number">${train.number}</div>
                        </div>
                        <div class="availability ${availabilityClass}">${availability}</div>
                    </div>
                    <div class="train-details">
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <div><strong>Departure:</strong> ${train.departure}</div>
                                <div>${from}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-arrow-right"></i>
                            <div>
                                <div><strong>Duration:</strong> ${train.duration}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <div><strong>Arrival:</strong> ${train.arrival}</div>
                                <div>${to}</div>
                            </div>
                        </div>
                    </div>
                    <div class="train-footer">
                        <div class="price">₹${price}</div>
                        <button class="book-btn" onclick="bookTicket('${train.name}', '${train.number}', '${from}', '${to}', '${date}', '${trainClass}', ${passengers}, ${price}, '${train.departure}', '${train.arrival}')">
                            <i class="fas fa-ticket-alt"></i> Book Now
                        </button>
                    </div>
                </div>
            `;
            resultsContainer.innerHTML += trainCard;
        });
    }, 1000);
}

function bookTicket(trainName, trainNumber, from, to, date, trainClass, passengers, price, departure, arrival) {
    if (!currentUser) {
        showNotification('Please login to book tickets!', 'error');
        document.getElementById('loginModal').style.display = 'block';
        return;
    }

    const pnr = 'PNR' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const booking = {
        pnr,
        trainName,
        trainNumber,
        from,
        to,
        date,
        trainClass,
        passengers,
        price,
        departure,
        arrival,
        userEmail: currentUser.email,
        status: 'Confirmed',
        bookingDate: new Date().toLocaleDateString()
    };

    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    showConfirmation(booking);
    loadUserBookings();
}

function showConfirmation(booking) {
    const modal = document.getElementById('confirmationModal');
    const details = document.getElementById('confirmationDetails');

    details.innerHTML = `
        <div class="confirmation-details">
            <div class="detail-row">
                <span class="detail-label">PNR Number:</span>
                <span class="detail-value">${booking.pnr}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Train:</span>
                <span class="detail-value">${booking.trainName} (${booking.trainNumber})</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">From:</span>
                <span class="detail-value">${booking.from}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">To:</span>
                <span class="detail-value">${booking.to}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${booking.date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Class:</span>
                <span class="detail-value">${booking.trainClass}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Passengers:</span>
                <span class="detail-value">${booking.passengers}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">₹${booking.price}</span>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

function loadUserBookings() {
    const bookingsList = document.getElementById('bookingsList');
    
    if (!currentUser) {
        bookingsList.innerHTML = `
            <div class="no-bookings">
                <i class="fas fa-inbox"></i>
                <p>Please login to view your bookings</p>
            </div>
        `;
        return;
    }

    const userBookings = bookings.filter(b => b.userEmail === currentUser.email);

    if (userBookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="no-bookings">
                <i class="fas fa-inbox"></i>
                <p>No bookings yet. Start booking your journey!</p>
            </div>
        `;
        return;
    }

    bookingsList.innerHTML = '';
    userBookings.reverse().forEach((booking, index) => {
        const bookingCard = `
            <div class="booking-card-item" style="animation-delay: ${index * 0.1}s">
                <div class="booking-header">
                    <div class="pnr">PNR: ${booking.pnr}</div>
                    <div class="status confirmed">${booking.status}</div>
                </div>
                <div class="booking-info">
                    <div class="info-item">
                        <span class="info-label">Train</span>
                        <span class="info-value">${booking.trainName} (${booking.trainNumber})</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">From - To</span>
                        <span class="info-value">${booking.from} → ${booking.to}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Journey Date</span>
                        <span class="info-value">${booking.date}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Class</span>
                        <span class="info-value">${booking.trainClass}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Passengers</span>
                        <span class="info-value">${booking.passengers}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Fare</span>
                        <span class="info-value">₹${booking.price}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Departure</span>
                        <span class="info-value">${booking.departure}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Arrival</span>
                        <span class="info-value">${booking.arrival}</span>
                    </div>
                </div>
            </div>
        `;
        bookingsList.innerHTML += bookingCard;
    });
}

function swapStations() {
    const from = document.getElementById('fromStation');
    const to = document.getElementById('toStation');
    const temp = from.value;
    from.value = to.value;
    to.value = temp;
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideInRight 0.4s ease;
        font-weight: 600;
    `;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
