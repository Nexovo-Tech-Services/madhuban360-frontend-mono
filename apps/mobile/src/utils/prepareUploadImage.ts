import { manipulateAsync, SaveFormat, type Action, type ImageResult } from "expo-image-manipulator";
import { Image } from "react-native";

export type UploadImageProfile = "selfie" | "task";

type ImageProfileConfig = {
  compress: number;
  maxLongEdge: number;
};

const PROFILE_CONFIG: Record<UploadImageProfile, ImageProfileConfig> = {
  selfie: { compress: 0.55, maxLongEdge: 960 },
  task: { compress: 0.6, maxLongEdge: 1280 },
};

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      reject,
    );
  });
}

function getResizeAction(
  width: number | undefined,
  height: number | undefined,
  maxLongEdge: number,
): Action[] {
  if (!width || !height) return [];

  const longEdge = Math.max(width, height);
  if (longEdge <= maxLongEdge) return [];

  if (width >= height) {
    return [{ resize: { width: maxLongEdge } }];
  }

  return [{ resize: { height: maxLongEdge } }];
}

export async function prepareUploadImage(
  uri: string,
  profile: UploadImageProfile,
): Promise<ImageResult> {
  const { compress, maxLongEdge } = PROFILE_CONFIG[profile];
  let originalSize: { width: number; height: number } | undefined;

  try {
    originalSize = await getImageSize(uri);
    const actions = getResizeAction(originalSize.width, originalSize.height, maxLongEdge);
    return await manipulateAsync(uri, actions, {
      compress,
      format: SaveFormat.JPEG,
    });
  } catch {
    return {
      uri,
      width: originalSize?.width ?? 0,
      height: originalSize?.height ?? 0,
    };
  }
}
