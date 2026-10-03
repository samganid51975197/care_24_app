plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.fivegram.gb"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.fivegram.gb"
        minSdk = 24
        targetSdk = 36
        versionCode = 40004
        versionName = "4.0.2"
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            isShrinkResources = false
            // ★ signingConfig 지정 안 함 (마법사에서 jks 선택해서 서명)
        }
        getByName("debug") {
            isMinifyEnabled = false
        }
    }

    buildFeatures {
        viewBinding = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
}
