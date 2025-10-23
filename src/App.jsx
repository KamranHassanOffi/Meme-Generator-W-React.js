import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [memes, setMemes] = useState([]);
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [topPos, setTopPos] = useState({ x: 50, y: 10 });
  const [bottomPos, setBottomPos] = useState({ x: 50, y: 90 });
  const [textColor, setTextColor] = useState("#ffffff");
  const [shadowEnabled, setShadowEnabled] = useState(true);
  const memeRef = useRef(null);
  const draggingRef = useRef(null);

  // Load memes
  useEffect(() => {
    axios
      .get("https://api.imgflip.com/get_memes")
      .then((res) => setMemes(res.data.data.memes))
      .catch((err) => console.error(err));
  }, []);

  const handleSelect = (meme) => {
    setSelectedMeme(meme);
    setTopText("");
    setBottomText("");
  };

  const handleBack = () => {
    setSelectedMeme(null);
    setTopText("");
    setBottomText("");
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      setSelectedMeme({ url: imgUrl, name: file.name });
      setTopText("");
      setBottomText("");
    }
  };

  // --- Drag logic (supports both mouse + touch) ---
  const startDrag = (type, e) => {
    e.preventDefault();
    draggingRef.current = { type };
  };

  const stopDrag = () => {
    draggingRef.current = null;
  };

  const onDrag = (clientX, clientY) => {
    if (!draggingRef.current || !memeRef.current) return;
    const rect = memeRef.current.getBoundingClientRect();
    const { type } = draggingRef.current;
    const xPercent = ((clientX - rect.left) / rect.width) * 100;
    const yPercent = ((clientY - rect.top) / rect.height) * 100;

    if (type === "top") setTopPos({ x: xPercent, y: yPercent });
    if (type === "bottom") setBottomPos({ x: xPercent, y: yPercent });
  };

  const handleMouseMove = (e) => onDrag(e.clientX, e.clientY);
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    if (touch) onDrag(touch.clientX, touch.clientY);
  };

  const handleDownload = () => {
    if (!memeRef.current) return;
    html2canvas(memeRef.current, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${selectedMeme?.name || "meme"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("✅ Meme downloaded successfully!", {
        position: "bottom-right",
        autoClose: 2000,
        theme: "colored",
      });
    });
  };

  return (
    <div
      className="min-h-screen bg-gray-100 p-6"
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onTouchMove={handleTouchMove}
      onTouchEnd={stopDrag}
    >
      <h1 className="text-3xl font-bold text-center mb-6">🔥 Meme Generator</h1>

      {selectedMeme ? (
        <div className="flex flex-col items-center">
          {/* Meme Canvas */}
          <div ref={memeRef} className="relative inline-block text-center max-w-md">
            <img
              src={selectedMeme.url}
              alt={selectedMeme.name}
              className="rounded-lg shadow-lg w-full"
              crossOrigin="anonymous"
            />

            {/* Top Text */}
            <h2
              className={`absolute text-2xl font-bold uppercase cursor-move select-none ${
                shadowEnabled ? "drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]" : ""
              }`}
              style={{
                color: textColor,
                top: `${topPos.y}%`,
                left: `${topPos.x}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseDown={(e) => startDrag("top", e)}
              onTouchStart={(e) => startDrag("top", e)}
            >
              {topText}
            </h2>

            {/* Bottom Text */}
            <h2
              className={`absolute text-2xl font-bold uppercase cursor-move select-none ${
                shadowEnabled ? "drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]" : ""
              }`}
              style={{
                color: textColor,
                top: `${bottomPos.y}%`,
                left: `${bottomPos.x}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseDown={(e) => startDrag("bottom", e)}
              onTouchStart={(e) => startDrag("bottom", e)}
            >
              {bottomText}
            </h2>
          </div>

          {/* Text Controls */}
          <div className="mt-4 flex flex-col gap-2 w-full max-w-md">
            <input
              type="text"
              placeholder="Top Text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Bottom Text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              className="border p-2 rounded w-full"
            />

            {/* 🎨 Color & Visibility Controls */}
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2">
                <span className="text-sm font-medium">Text Color:</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 border rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shadowEnabled}
                  onChange={() => setShadowEnabled(!shadowEnabled)}
                />
                <span className="text-sm font-medium">Add Shadow</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleDownload}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              ⬇️ Download
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              🔙 Back
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Meme List */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {memes.map((meme) => (
              <div
                key={meme.id}
                className="cursor-pointer border rounded overflow-hidden hover:scale-105 transition"
                onClick={() => handleSelect(meme)}
              >
                <img
                  src={meme.url}
                  alt={meme.name}
                  className="w-full"
                  crossOrigin="anonymous"
                />
              </div>
            ))}
          </div>

          {/* Upload Meme */}
          <div className="mb-8 flex justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="border p-2 rounded"
            />
          </div>
        </>
      )}

      {/* Toastify container */}
      <ToastContainer />
    </div>
  );
};

export default App;
