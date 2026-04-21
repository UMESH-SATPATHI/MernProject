import cloudinaryApi from "./uploadImageService";


export async function uploadImage(file) {
    const { data: sig } = await cloudinaryApi.get("/cloudinary/signature");

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    form.append("timestamp", sig.timestamp);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
    const res = await fetch(uploadUrl, { method: "POST", body: form });
    if (!res.ok) throw new Error("Cloudinary upload failed");

    const uploaded = await res.json();
    return { url: uploaded.secure_url, publicId: uploaded.public_id };

}

