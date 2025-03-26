// auth.js
const authContainerHTML = `
    <div class="auth-content">
        <div class="auth-header">
            <img src="../static/img/forum.png" alt="Forum Logo" class="auth-logo">
            <h2>Welcome to Realtime Forum</h2>
            <p class="auth-subtitle">Please login or register to continue</p>
        </div>
        
        <div class="auth-tabs">
            <button class="tab-btn active" id="login-tab">Login</button>
            <button class="tab-btn" id="register-tab">Register</button>
        </div>
        
        <!-- Login Form -->
        <form id="login-form" class="auth-form">
            <div class="form-group">
                <i class="material-icons">person</i>
                <input type="text" placeholder="Email or Nickname" name="login" required>
            </div>
            <div class="form-group">
                <i class="material-icons">lock</i>
                <input type="password" placeholder="Password" name="password" required>
            </div>
            <button type="submit" class="auth-submit-btn">Login</button>
        </form>

        <!-- Register Form -->
        <form id="register-form" class="auth-form" style="display: none;">
            <div class="form-group">
                <i class="material-icons">person</i>
                <input type="text" placeholder="Nickname" name="nickname" required>
            </div>
            <div class="form-group">
                <i class="material-icons">cake</i>
                <input type="number" placeholder="Age" name="age" required>
            </div>
            <div class="form-group">
                <i class="material-icons">people</i>
                <select name="gender" required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <i class="material-icons">person_outline</i>
                <input type="text" placeholder="First Name" name="firstName" required>
            </div>
            <div class="form-group">
                <i class="material-icons">person_outline</i>
                <input type="text" placeholder="Last Name" name="lastName" required>
            </div>
            <div class="form-group">
                <i class="material-icons">email</i>
                <input type="email" placeholder="Email" name="email" required>
            </div>
            <div class="form-group">
                <i class="material-icons">lock</i>
                <input type="password" placeholder="Password" name="password" required>
            </div>
            <button type="submit" class="auth-submit-btn">Register</button>
        </form>
    </div>
`;

document.getElementById('auth-container').innerHTML = authContainerHTML;