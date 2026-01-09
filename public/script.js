// Sections
const signupSection = document.getElementById('signupSection');
const loginSection = document.getElementById('loginSection');
const profileSection = document.getElementById('profileSection');

// Forms
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

// Messages
const signupMessage = document.getElementById('signupMessage');
const loginMessage = document.getElementById('loginMessage');

// Navigation
document.getElementById('goToLogin').addEventListener('click', () => {
  signupSection.style.display = 'none';
  loginSection.style.display = 'block';
});

document.getElementById('goToSignup').addEventListener('click', () => {
  loginSection.style.display = 'none';
  signupSection.style.display = 'block';
});

// Profile elements
const welcomeMessage = document.getElementById('welcomeMessage');
const postContent = document.getElementById('postContent');
const postBtn = document.getElementById('postBtn');
const postsContainer = document.getElementById('postsContainer');
const logoutBtn = document.getElementById('logoutBtn');

// --- Sign Up ---
signupForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const firstname = signupForm.firstname.value;
  const lastname = signupForm.lastname.value;
  const email = signupForm.email.value;
  const password = signupForm.password.value;

  // Check if user exists
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if(users.find(u => u.email === email)){
    signupMessage.textContent = 'User already exists!';
    signupMessage.style.color = 'red';
    return;
  }

  users.push({firstname, lastname, email, password, posts: []});
  localStorage.setItem('users', JSON.stringify(users));
  signupMessage.textContent = 'Sign up successful! Please log in.';
  signupMessage.style.color = 'green';
  signupForm.reset();
});

// --- Login ---
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if(!user){
    loginMessage.textContent = 'Invalid credentials!';
    loginMessage.style.color = 'red';
    return;
  }

  // Save current user
  localStorage.setItem('currentUser', JSON.stringify(user));

  loginSection.style.display = 'none';
  profileSection.style.display = 'block';
  showProfile(user);
});

// --- Show Profile ---
function showProfile(user){
  welcomeMessage.textContent = `Welcome, ${user.firstname} ${user.lastname}!`;
  renderPosts(user);
}

// --- Post Message ---
postBtn.addEventListener('click', function(){
  const content = postContent.value.trim();
  if(!content) return;

  let user = JSON.parse(localStorage.getItem('currentUser'));
  user.posts.unshift(content); // add new post to top

  // Update current user and users array
  localStorage.setItem('currentUser', JSON.stringify(user));
  let users = JSON.parse(localStorage.getItem('users'));
  users = users.map(u => u.email === user.email ? user : u);
  localStorage.setItem('users', JSON.stringify(users));

  postContent.value = '';
  renderPosts(user);
});

// --- Render Posts ---
function renderPosts(user){
  postsContainer.innerHTML = '';
  user.posts.forEach(p => {
    const div = document.createElement('div');
    div.className = 'post';
    div.textContent = p;
    postsContainer.appendChild(div);
  });
}

// --- Logout ---
logoutBtn.addEventListener('click', function(){
  localStorage.removeItem('currentUser');
  profileSection.style.display = 'none';
  loginSection.style.display = 'block';
});

