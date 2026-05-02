import { useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useEffect } from "react";

/**
 * Requests camera and foreground-location permissions as soon as the home
 * screen mounts, so the OS dialogs appear right after login rather than when
 * the user first opens the attendance flow.
 */
export function useAppPermissions() {
  const [, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    void (async () => {
      await requestCameraPermission();
      await Location.requestForegroundPermissionsAsync();
    })();
  }, [requestCameraPermission]);
}
