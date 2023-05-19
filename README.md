
# OTPBasedLogin
Nodejs API for OTP based login

**API deployed on:** https://otp-auth.onrender.com
## Getting Started


- Clone the repository
```bash
git clone https://github.com/Manraj-singh/OTPBasedLogin.git

alternatively download the zip file
```

- navigate to project directory and run npm install to install the dependencies

- run **npm start or node index.js** to start the server
- The application can now be accessed locally at http://localhost:8000/


## ENDPOINTS:
-  **/api/user/generate-otp** : to generate otp(takes email as input  and otp will be sent to email id)  
- **/api/user/verify** : to verify otp and return jwt token(takes email id and otp as input)
-  **/api/user/signup** : to register email id

## Tools Used
- Node.js
- JWT
- Express.js
- otp-generator
- nodemailer










