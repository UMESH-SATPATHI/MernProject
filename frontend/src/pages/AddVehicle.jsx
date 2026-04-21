import { useState } from "react";
import { uploadImage } from "../services/cloudinaryUpload";
import cloudinaryApi from "../services/uploadImageService.jsx";

export default function AddVehicle() {
  const [files, setFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]); // [{url, publicId}]
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    vehicleName: "",
    vehicleType: "car",
    brand: "",
    model: "",
    description: "",
    price: "",
    location: "",
    isAvailable: true,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleUploadImages = async () => {
    setMsg("");
    if (!files.length) return setMsg("Select at least 1 image.");

    setLoading(true);
    try {
      const results = await Promise.all([...files].map((f) => uploadImage(f)));
      setUploadedImages(results); // [{url, publicId}]
      setMsg("Images uploaded to Cloudinary.");
    } catch (err) {
      console.log(err);
      setMsg("Image upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVehicle = async (e) => {
    e.preventDefault();
    setMsg("");

    if (uploadedImages.length === 0) return setMsg("Upload images first.");

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        images: uploadedImages,
      };

      const res = await cloudinaryApi.post("/vehicles", payload);
      setMsg(res.data?.message || "Vehicle created.");
      setFiles([]);
      setUploadedImages([]);
      setForm({
        vehicleName: "",
        vehicleType: "",
        brand: "",
        model: "",
        description: "",
        price: "",
        location: "",
        isAvailable: true,
      });
    } catch (err) {
      console.log(err);
      setMsg(err?.response?.data?.message || "Vehicle create failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <h3>Add Vehicle</h3>
      {msg && <p>{msg}</p>}

      <form onSubmit={handleSubmitVehicle}>
        <input
          className="form-control mb-2"
          name="vehicleName"
          placeholder="Vehicle name"
          value={form.vehicleName}
          onChange={onChange}
          required
        />

        <select
          className="form-control mb-2"
          name="vehicleType"
          value={form.vehicleType}
          onChange={onChange}
          required
        >
          <option value="car">car</option>
          <option value="bike">bike</option>
          <option value="scooter">scooter</option>
        </select>

        <input
          className="form-control mb-2"
          name="brand"
          placeholder="Brand"
          value={form.brand}
          onChange={onChange}
          required
        />
        <input
          className="form-control mb-2"
          name="model"
          placeholder="Model"
          value={form.model}
          onChange={onChange}
          required
        />
        <textarea
          className="form-control mb-2"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={onChange}
          required
        />
        <input
          className="form-control mb-2"
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={onChange}
          required
        />
        <input
          className="form-control mb-2"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={onChange}
          required
        />

        <label className="mb-2">
          <input
            type="checkbox"
            name="isAvailable"
            checked={form.isAvailable}
            onChange={onChange}
          />{" "}
          Available
        </label>

        <input
          className="form-control mb-2"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
        />

        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={handleUploadImages}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Images"}
        </button>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Create Vehicle"}
        </button>
      </form>

      {uploadedImages.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h5>Preview</h5>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {uploadedImages.map((img) => (
              <img
                key={img.publicId}
                src={img.url}
                alt=""
                style={{ width: 140, height: 100, objectFit: "cover", borderRadius: 8 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
