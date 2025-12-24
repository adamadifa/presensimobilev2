package com.adamadifa1607.PresensiMobile

import android.content.Context
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class DeveloperOptionsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DeveloperOptionsModule"
    }

    @ReactMethod
    fun isDeveloperOptionsEnabled(promise: Promise) {
        try {
            val context = reactApplicationContext
            var isEnabled = false

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                // Check DEVELOPMENT_SETTINGS_ENABLED
                val devOptionsEnabled = Settings.Global.getInt(
                    context.contentResolver,
                    Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                    0
                )
                isEnabled = devOptionsEnabled != 0
            } else {
                // For older Android versions
                val devOptionsEnabled = Settings.Secure.getInt(
                    context.contentResolver,
                    Settings.Secure.DEVELOPMENT_SETTINGS_ENABLED,
                    0
                )
                isEnabled = devOptionsEnabled != 0
            }

            // Also check USB debugging
            val usbDebuggingEnabled = Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.ADB_ENABLED,
                0
            )

            promise.resolve(isEnabled || usbDebuggingEnabled != 0)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check developer options: ${e.message}", e)
        }
    }
}






