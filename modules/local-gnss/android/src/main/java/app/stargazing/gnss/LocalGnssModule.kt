package app.stargazing.gnss

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Looper
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LocalGnssModule : Module() {
  private var locationManager: LocationManager? = null
  private var locationListener: LocationListener? = null

  override fun definition() = ModuleDefinition {
    Name("LocalGnss")
    Events("onLocation")

    AsyncFunction("start") {
      val context = appContext.reactContext ?: throw IllegalStateException("App context is unavailable")
      if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
        throw SecurityException("Foreground precise location permission is required")
      }
      stopUpdates()
      val manager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
      if (!manager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
        throw IllegalStateException("Device satellite location is turned off")
      }
      val listener = object : LocationListener {
        override fun onLocationChanged(location: Location) {
          sendEvent("onLocation", mapOf(
            "latitude" to location.latitude,
            "longitude" to location.longitude,
            "accuracy" to location.accuracy.toDouble(),
          ))
        }
      }
      manager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 15_000L, 100f, listener, Looper.getMainLooper())
      locationManager = manager
      locationListener = listener
    }

    AsyncFunction("stop") {
      stopUpdates()
    }

    OnDestroy {
      stopUpdates()
    }
  }

  private fun stopUpdates() {
    val manager = locationManager
    val listener = locationListener
    if (manager != null && listener != null) manager.removeUpdates(listener)
    locationManager = null
    locationListener = null
  }
}
