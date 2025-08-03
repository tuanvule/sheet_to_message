// Danh sách các extension hình ảnh phổ biến
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

// Danh sách tên file phổ biến để thử
const commonNames = [
    'character', 'logo', 'image', 'photo', 'picture', 
    'avatar', 'profile', 'user', 'icon', 'banner',
    'background', 'bg', 'img', 'pic', '1', '2', '3'
];

// Hàm tự động tìm và load hình ảnh
function autoLoadImage() {
    const imageElement = document.getElementById('characterImage');
    let imageFound = false;
    let attemptCount = 0;
    const totalAttempts = commonNames.length * imageExtensions.length;

    // Hàm thử load hình
    function tryLoadImage(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(imagePath);
            img.onerror = () => resolve(null);
            img.src = imagePath;
        });
    }

    // Hàm thử tất cả combinations
    async function findImage() {
        // Thử từng tên file với từng extension
        for (const name of commonNames) {
            for (const ext of imageExtensions) {
                const imagePath = `images/${name}.${ext}`;
                const result = await tryLoadImage(imagePath);
                
                if (result && !imageFound) {
                    imageFound = true;
                    imageElement.src = result;
                    imageElement.style.display = 'block';
                    console.log(`✅ Tìm thấy hình: ${result}`);
                    return;
                }
            }
        }

        // Nếu không tìm thấy hình nào, hiển thị placeholder
        if (!imageFound) {
            imageElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNTAgNzVMMjI1IDE1MEgxNzVWMjI1SDEyNVYxNTBINzVMMTUwIDc1WiIgZmlsbD0iIzlFOUU5RSIvPgo8dGV4dCB4PSIxNTAiIHk9IjI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUU5RTlFIj7EkOG6t3QgaOG7jW5oIOG6o25oIHbDoG8gZm9sZGVyIGltYWdlczwvdGV4dD4KPHN2Zz4=';
            imageElement.style.display = 'block';
            console.log('❌ Không tìm thấy hình nào trong folder images');
        }
    }

    findImage();
}

// Hàm hiển thị form đăng nhập
function showLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('loginAsMemberForm').classList.remove('active');
    clearErrors();
    clearForms();
}

// Hàm hiển thị form đăng ký
function showSignup() {
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('loginAsMemberForm').classList.remove('active');
    clearErrors();
    clearForms();
}

function showLoginAsMember() {
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('loginAsMemberForm').classList.add('active');
}

// Hàm xử lý đăng nhập
function handleLogin(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('.btn-submit');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    let isValid = true;
    
    // Clear previous errors
    clearErrors();
    
    // Validate email
    if (!email) {
        showError('loginEmailError', 'Email là bắt buộc');
        markInputError('loginEmail');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('loginEmailError', 'Email không đúng định dạng');
        markInputError('loginEmail');
        isValid = false;
    } else {
        markInputSuccess('loginEmail');
    }
    
    // Validate password
    if (!password) {
        showError('loginPasswordError', 'Mật khẩu là bắt buộc');
        markInputError('loginPassword');
        isValid = false;
    } else if (password.length < 6) {
        showError('loginPasswordError', 'Mật khẩu phải có ít nhất 6 ký tự');
        markInputError('loginPassword');
        isValid = false;
    } else {
        markInputSuccess('loginPassword');
    }
    
    if (isValid) {
        // Show loading
        submitBtn.classList.add('loading');
        
        // Simulate API call
        fetch("/api/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        })
        .then(res => res.json())
        .then((res) => {
            if(res.status.isSuccess) {
                localStorage.setItem("accessToken", res.accessToken)
                alert('Đăng nhập thành công!\nEmail: ' + email);
                window.location.href = "/"
            } else {
                alert('Đăng nhập chưa thành công!\n Sai email hoặc mật khẩu');
            }
        })
        .catch(err => {
            console.log(err)
            alert('Đăng nhập chưa thành công!\nvui lòng thử lại');
        })
        .finally(() => submitBtn.classList.remove('loading'))

        // setTimeout(() => {
            
        //     // Redirect logic here
        //     // window.location.href = '/dashboard';
        // }, 2000);
    }
}

// Hàm xử lý đăng ký
function handleSignup(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('.btn-submit');
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    let isValid = true;
    
    // Clear previous errors
    clearErrors();
    
    // Validate name
    if (!name) {
        showError('signupNameError', 'Họ tên là bắt buộc');
        markInputError('signupName');
        isValid = false;
    } else if (name.length < 2) {
        showError('signupNameError', 'Họ tên phải có ít nhất 2 ký tự');
        markInputError('signupName');
        isValid = false;
    } else {
        markInputSuccess('signupName');
    }
    
    // Validate email
    if (!email) {
        showError('signupEmailError', 'Email là bắt buộc');
        markInputError('signupEmail');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('signupEmailError', 'Email không đúng định dạng');
        markInputError('signupEmail');
        isValid = false;
    } else {
        markInputSuccess('signupEmail');
    }
    
    // Validate password
    if (!password) {
        showError('signupPasswordError', 'Mật khẩu là bắt buộc');
        markInputError('signupPassword');
        isValid = false;
    } else if (password.length < 6) {
        showError('signupPasswordError', 'Mật khẩu phải có ít nhất 6 ký tự');
        markInputError('signupPassword');
        isValid = false;
    } else if (!isStrongPassword(password)) {
        showError('signupPasswordError', 'Mật khẩu cần có ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
        markInputError('signupPassword');
        isValid = false;
    } else {
        markInputSuccess('signupPassword');
    }
    
    // Validate confirm password
    if (!confirmPassword) {
        showError('confirmPasswordError', 'Xác nhận mật khẩu là bắt buộc');
        markInputError('confirmPassword');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Mật khẩu không khớp');
        markInputError('confirmPassword');
        isValid = false;
    } else {
        markInputSuccess('confirmPassword');
    }
    
    if (isValid) {
        // Show loading
        submitBtn.classList.add('loading');
        
        fetch("/api/signup", {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userName: name,
                email,
                password
            })
        })
        .then(res => res.json())
        .then(() => {
            alert('Đăng ký thành công!\nTên: ' + name + '\nEmail: ' + email);
        })
        .catch(err => {
            alert('Đăng ký chưa thành công!\nVui lòng thử lại');
        })
        .finally(() => submitBtn.classList.remove('loading'))

        // Simulate API call
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            alert('Đăng ký thành công!\nTên: ' + name + '\nEmail: ' + email);
            
            // Auto switch to login after success
            setTimeout(() => {
                showLogin();
            }, 1500);
        }, 2000);
    }
}

function handleLoginAsMember(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('.btn-submit');
    const joinCode = document.getElementById('joinCode').value.trim();
    
    let isValid = true;
    
    // Clear previous errors
    clearErrors();
    
    // Validate joinCode
    if (!joinCode) {
        showError('joinCodeError', 'Mã mời không được bỏ trống');
        markInputError('joinCodeError');
        isValid = false;
    }
    
    if (isValid) {
        // Show loading
        submitBtn.classList.add('loading');
        
        // Simulate API call
        fetch("/api/login_as_member", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                joinCode
            })
        })
        .then(res => res.json())
        .then((res) => {
            if(res.status.isSuccess) {
                localStorage.setItem("accessToken", res.accessToken)
            }
            alert('Tham gia thành công!');
        })
        .catch(err => {
            alert('Mã mời không hợp lệ!\nvui lòng thử lại');
        })
        .finally(() => submitBtn.classList.remove('loading'))
    }
}

// Hàm toggle hiển thị/ẩn mật khẩu
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = passwordInput.parentNode.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Hàm kiểm tra email hợp lệ
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Hàm kiểm tra mật khẩu mạnh
function isStrongPassword(password) {
    // Ít nhất 1 chữ hoa, 1 chữ thường, 1 số
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    return strongRegex.test(password);
}

// Hàm hiển thị lỗi
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Hàm xóa tất cả lỗi
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.style.display = 'none';
        error.textContent = '';
    });
    
    // Remove error/success classes from inputs
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('error', 'success');
    });
}

// Hàm xóa form
function clearForms() {
    document.querySelectorAll('form').forEach(form => {
        form.reset();
    });
}

// Hàm đánh dấu input lỗi
function markInputError(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.classList.remove('success');
        input.classList.add('error');
    }
}

// Hàm đánh dấu input thành công
function markInputSuccess(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.classList.remove('error');
        input.classList.add('success');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Tự động tìm và load hình ảnh khi trang load
    // autoLoadImage();
    
    // Xóa lỗi khi người dùng nhập lại
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            const errorElement = this.parentNode.querySelector('.error-message');
            if (errorElement && errorElement.style.display === 'block') {
                errorElement.style.display = 'none';
                this.classList.remove('error');
            }
        });
        
        // Real-time validation
        input.addEventListener('blur', function() {
            validateSingleField(this);
        });
    });
});

// Hàm validate từng field riêng lẻ
function validateSingleField(input) {
    const value = input.value.trim();
    const inputId = input.id;
    
    switch(inputId) {
        case 'loginEmail':
        case 'signupEmail':
            if (value && isValidEmail(value)) {
                markInputSuccess(inputId);
            } else if (value) {
                markInputError(inputId);
            }
            break;
            
        case 'signupName':
            if (value && value.length >= 2) {
                markInputSuccess(inputId);
            } else if (value) {
                markInputError(inputId);
            }
            break;
            
        case 'loginPassword':
            if (value && value.length >= 6) {
                markInputSuccess(inputId);
            } else if (value) {
                markInputError(inputId);
            }
            break;
            
        case 'signupPassword':
            if (value && value.length >= 6 && isStrongPassword(value)) {
                markInputSuccess(inputId);
            } else if (value) {
                markInputError(inputId);
            }
            break;
            
        case 'confirmPassword':
            const signupPassword = document.getElementById('signupPassword').value;
            if (value && value === signupPassword) {
                markInputSuccess(inputId);
            } else if (value) {
                markInputError(inputId);
            }
            break;
    }
}