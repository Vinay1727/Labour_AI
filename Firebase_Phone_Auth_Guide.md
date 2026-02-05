# Firebase Phone OTP Authentication for Android (Kotlin)

This document provides a production-ready implementation of Firebase Phone Number Authentication for Android, based on the official documentation.

## Phase 1: Firebase Project Setup

### 1. Enable Phone Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Navigate to **Authentication** > **Sign-in method**.
4. Enable **Phone** and click **Save**.

### 2. Add SHA-1 and SHA-256 Keys
Firebase uses these keys to verify your app's identity and prevent spam.
1. In your project's `android` folder, run:
   ```bash
   ./gradlew signingReport
   ```
2. Copy the **SHA-1** and **SHA-256** fingerpints for the `debug` or `release` variant.
3. In Firebase Console, go to **Project Settings** > **General**.
4. Scroll to **Your apps**, select your Android app, and click **Add fingerprint**.
5. Add both keys.

### 3. Download `google-services.json`
1. Download the updated `google-services.json` from Project Settings.
2. Place it in `android/app/`.

---

## Phase 2: Gradle Configuration

### 1. Root `build.gradle` (`android/build.gradle`)
Ensure you have the Google services plugin.

```gradle
buildscript {
    dependencies {
        // ... other dependencies
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 2. App `build.gradle` (`android/app/build.gradle`)
Add the Firebase Bill of Materials (BoM) and the Auth library.

```gradle
plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services' // Add this
    id 'kotlin-android'
}

dependencies {
    // Import the Firebase BoM
    implementation platform('com.google.firebase:firebase-bom:32.7.0')

    // Firebase Authentication
    implementation 'com.google.firebase:firebase-auth-ktx'
}
```

### 3. Permissions (`AndroidManifest.xml`)
Add the Internet permission.

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

---

## Phase 3: Implementation

### 1. View Layout (`activity_phone_auth.xml`)
A simple UI with input fields and buttons.

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="20dp"
    android:gravity="center">

    <EditText
        android:id="@+id/etPhoneNumber"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Phone Number (+91...)"
        android:inputType="phone" />

    <Button
        android:id="@+id/btnSendOtp"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Send OTP" />

    <EditText
        android:id="@+id/etOtp"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Enter OTP"
        android:inputType="number"
        android:visibility="gone" />

    <Button
        android:id="@+id/btnVerifyOtp"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Verify OTP"
        android:visibility="gone" />

</LinearLayout>
```

### 2. Activity Code (`PhoneAuthActivity.kt`)
The core logic for sending and verifying OTP.

```kotlin
package com.yourpackage.app

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.FirebaseException
import com.google.firebase.FirebaseTooManyRequestsException
import com.google.firebase.auth.*
import com.yourpackage.app.databinding.ActivityPhoneAuthBinding // Assuming view binding
import java.util.concurrent.TimeUnit

class PhoneAuthActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private var verificationId: String? = null
    private lateinit var binding: ActivityPhoneAuthBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPhoneAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)

        auth = FirebaseAuth.getInstance()

        // For Testing: Force reCAPTCHA or disable app verification
        // auth.firebaseAuthSettings.setAppVerificationDisabledForTesting(true)

        binding.btnSendOtp.setOnClickListener {
            val phoneNumber = binding.etPhoneNumber.text.toString()
            if (phoneNumber.isNotEmpty()) {
                startPhoneNumberVerification(phoneNumber)
            } else {
                Toast.makeText(this, "Enter a valid phone number", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnVerifyOtp.setOnClickListener {
            val otp = binding.etOtp.text.toString()
            if (otp.isNotEmpty() && verificationId != null) {
                val credential = PhoneAuthProvider.getCredential(verificationId!!, otp)
                signInWithPhoneAuthCredential(credential)
            }
        }
    }

    private fun startPhoneNumberVerification(phoneNumber: String) {
        val options = PhoneAuthOptions.newBuilder(auth)
            .setPhoneNumber(phoneNumber)       // Phone number to verify
            .setTimeout(60L, TimeUnit.SECONDS) // Timeout and unit
            .setActivity(this)                 // Activity (for callback binding)
            .setCallbacks(callbacks)          // OnVerificationStateChangedCallbacks
            .build()
        PhoneAuthProvider.verifyPhoneNumber(options)
    }

    private val callbacks = object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {

        override fun onVerificationCompleted(credential: PhoneAuthCredential) {
            // This callback will be invoked in two situations:
            // 1 - Instant verification: In some cases current phone number can be instantly
            //     verified without needing to send or enter a verification code.
            // 2 - Auto-retrieval: On some devices Google Play services can automatically
            //     detect the incoming verification SMS and perform verification without
            //     user action.
            Log.d("PhoneAuth", "onVerificationCompleted: $credential")
            signInWithPhoneAuthCredential(credential)
        }

        override fun onVerificationFailed(e: FirebaseException) {
            // This callback is invoked in an invalid request for verification is made,
            // for instance if the the phone number format is invalid.
            Log.e("PhoneAuth", "onVerificationFailed", e)

            when (e) {
                is FirebaseAuthInvalidCredentialsException -> {
                    Toast.makeText(applicationContext, "Invalid phone number.", Toast.LENGTH_SHORT).show()
                }
                is FirebaseTooManyRequestsException -> {
                    Toast.makeText(applicationContext, "Quota exceeded.", Toast.LENGTH_SHORT).show()
                }
                else -> {
                    Toast.makeText(applicationContext, "Verification failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        override fun onCodeSent(
            verificationId: String,
            token: PhoneAuthProvider.ForceResendingToken
        ) {
            // The SMS verification code has been sent to the provided phone number, we
            // now need to ask the user to enter the code and then construct a properly
            // formed credential by combining this ID with the code passed by the user.
            Log.d("PhoneAuth", "onCodeSent: $verificationId")
            this@PhoneAuthActivity.verificationId = verificationId
            
            // Show OTP UI
            binding.etOtp.visibility = View.VISIBLE
            binding.btnVerifyOtp.visibility = View.VISIBLE
            binding.btnSendOtp.visibility = View.GONE
        }
    }

    private fun signInWithPhoneAuthCredential(credential: PhoneAuthCredential) {
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    val user = task.result?.user
                    Toast.makeText(this, "Login Success: ${user?.uid}", Toast.LENGTH_LONG).show()
                    // Proceed to Home Screen
                } else {
                    if (task.exception is FirebaseAuthInvalidCredentialsException) {
                        Toast.makeText(this, "Invalid verification code", Toast.LENGTH_SHORT).show()
                    }
                }
            }
    }
}
```

---

## Phase 4: Testing & Best Practices

### 1. Test Phone Numbers
You can add fictional test phone numbers in the Firebase Console:
1. Go to **Authentication** > **Users**.
2. Click **Add User** (or the dots menu) > **Add test phone number**.
3. Add a number (e.g., `+1 650-555-3434`) and a verification code (e.g., `654321`).

### 2. Testing App Verification
To skip the reCAPTCHA/SafetyNet check during development:
```kotlin
// Disable app verification for testing (SafetyNet/reCAPTCHA will be skipped)
auth.firebaseAuthSettings.setAppVerificationDisabledForTesting(true)
```
*Note: This only works with test phone numbers registered in the console.*

### 3. Force reCAPTCHA
To force a reCAPTCHA flow (instead of Play Integrity) for testing, ensure the device does not have Google Play Services or use a simulator without Play Store.

### 4. Security Best Practices
- **Play Integrity / reCAPTCHA**: Ensure these are enabled in the Firebase Console to prevent automated abuse.
- **Never Hardcode**: Never hardcode test numbers or logic that bypasses verification in production code.
- **Quota Monitoring**: Monitor your SMS usage in the Google Cloud Console.
- **Risk Assessment**: Phone-only authentication is vulnerable if a user loses their SIM card or is a victim of SIM swapping. Consider adding a second factor (MFA) for high-security areas of the app.

---

## Common Mistakes
1. **Missing SHA Keys**: Verification will fail with a broad "Internal Error" if SHA-1/SHA-256 is not in Firebase Console.
2. **Incorrect Phone Format**: Always use E.164 format (e.g., `+911234567890`).
3. **App Not Linked**: Forgetting to add `google-services` plugin or the `google-services.json` file.
4. **SafetyNet vs Play Integrity**: SafetyNet is being deprecated; ensure you transition to Play Integrity API in the Google Cloud Console.
