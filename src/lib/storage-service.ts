import { supabase } from "./supabase";

// Create the pitch decks bucket (run this once in setup)
export const createPitchDecksBucket = async () => {
  try {
    const { data, error } = await supabase.storage.createBucket("pitchdecks", {
      public: true, // Public bucket so everyone can view pitch decks
      allowedMimeTypes: ["application/pdf"],
      fileSizeLimit: 10485760, // 10MB limit
    });

    if (error) {
      console.error("Error creating bucket:", error);
      return { success: false, error: error.message };
    }

    console.log("Bucket created successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error creating bucket:", error);
    return { success: false, error: "Failed to create bucket" };
  }
};

// Upload pitch deck file
export const uploadPitchDeck = async (
  file: File,
  userIdOrEmail: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User must be authenticated to upload files",
      };
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return { success: false, error: "Only PDF files are allowed" };
    }

    // Validate file size (10MB limit)
    if (file.size > 10485760) {
      return { success: false, error: "File size must be less than 10MB" };
    }

    // Generate unique filename with user ID for RLS compliance
    const fileExt = "pdf";
    const fileName = `${Date.now()}_pitchdeck.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from("pitchdecks")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("pitchdecks").getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error uploading pitch deck:", error);
    return { success: false, error: "Failed to upload file" };
  }
};

// Get signed URL for private access (kept for backward compatibility, but not needed for public bucket)
export const getPitchDeckSignedUrl = async (
  filePath: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // For public bucket, just return the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("pitchdecks").getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error getting public URL:", error);
    return { success: false, error: "Failed to get public URL" };
  }
};

// Delete pitch deck file
export const deletePitchDeck = async (
  filePath: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from("pitchdecks")
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting pitch deck:", error);
    return { success: false, error: "Failed to delete file" };
  }
};

// Extract file path from full URL
export const extractFilePathFromUrl = (url: string): string => {
  try {
    // Check if URL is empty or invalid
    if (!url || typeof url !== "string" || url.trim() === "") {
      console.warn("Empty or invalid URL provided to extractFilePathFromUrl");
      return "";
    }

    // If it's already a relative path, return as is
    if (!url.startsWith("http") && url.includes("/")) {
      return url;
    }

    // Try to parse as URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname
      .split("/")
      .filter((segment) => segment.length > 0);

    const bucketIndex = pathSegments.indexOf("pitchdecks");
    if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
      // Return path after 'pitchdecks' (includes user_id/filename.pdf)
      return pathSegments.slice(bucketIndex + 1).join("/");
    }

    // Fallback: try to find object path after storage/v1/object/
    const objectIndex = pathSegments.findIndex(
      (segment) => segment === "object"
    );
    if (
      objectIndex !== -1 &&
      pathSegments[objectIndex + 1] === "public" &&
      pathSegments[objectIndex + 2] === "pitchdecks"
    ) {
      // For public URLs: /storage/v1/object/public/pitchdecks/user_id/file.pdf
      return pathSegments.slice(objectIndex + 3).join("/");
    } else if (
      objectIndex !== -1 &&
      pathSegments[objectIndex + 1] === "pitchdecks"
    ) {
      // For private URLs: /storage/v1/object/pitchdecks/user_id/file.pdf
      return pathSegments.slice(objectIndex + 2).join("/");
    }

    console.warn("Could not extract file path from URL:", url);
    return "";
  } catch (error) {
    console.error("Error extracting file path from URL:", url, error);
    return "";
  }
};
