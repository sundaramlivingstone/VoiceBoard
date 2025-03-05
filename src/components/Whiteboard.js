import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useParams, useNavigate } from "react-router-dom";
import {
  IoAddCircleOutline,
  IoRemoveCircleOutline,
  IoBrushOutline,
  IoShapesOutline,
  IoTextOutline,
  IoTrashOutline,
  IoArrowUndoOutline,
  IoArrowRedoOutline,
  IoColorPaletteOutline,
  IoDownloadOutline,
  IoHandRightOutline,
  IoImageOutline,
} from "react-icons/io5";

const Whiteboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [activeMode, setActiveMode] = useState("select");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [shapesMenu, setShapesMenu] = useState(false);
  const fileInputRef = useRef(null);

  // Set the active mode (e.g., "select", "draw")
  const setMode = (mode) => {
    setActiveMode(mode);
    if (fabricCanvas) {
      switch (mode) {
        case "draw":
          fabricCanvas.isDrawingMode = true;
          break;
        case "select":
          fabricCanvas.isDrawingMode = false;
          break;
        default:
          fabricCanvas.isDrawingMode = false;
      }
    }
  };

  // Load or create project
  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem("projects")) || [];
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      navigate("/dashboard");
      return;
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 100,
      backgroundColor: "#ffffff",
      isDrawingMode: false,
    });

    if (project.canvasData) {
      canvas.loadFromJSON(project.canvasData, () => {
        canvas.renderAll();
      });
    }

    setFabricCanvas(canvas);

    // Save canvas data on changes
    canvas.on("object:added", () => saveCanvasData(canvas, projectId));
    canvas.on("object:modified", () => saveCanvasData(canvas, projectId));

    return () => {
      canvas.dispose();
    };
  }, [projectId, navigate]);

  // Save canvas data to localStorage
  const saveCanvasData = (canvas, projectId) => {
    const projects = JSON.parse(localStorage.getItem("projects")) || [];
    const projectIndex = projects.findIndex((p) => p.id === projectId);
    if (projectIndex !== -1) {
      projects[projectIndex].canvasData = canvas.toJSON();
      localStorage.setItem("projects", JSON.stringify(projects));
    }
  };

  // Export canvas as image
  const exportCanvas = () => {
    if (fabricCanvas) {
      const dataUrl = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
      });

      const link = document.createElement("a");
      link.download = `whiteboard-${projectId}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      fabricCanvas.loadFromJSON(
        history[newIndex],
        fabricCanvas.renderAll.bind(fabricCanvas)
      );
      setHistoryIndex(newIndex);
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      fabricCanvas.loadFromJSON(
        history[newIndex],
        fabricCanvas.renderAll.bind(fabricCanvas)
      );
      setHistoryIndex(newIndex);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (fabricCanvas) {
      const activeObjects = fabricCanvas.getActiveObjects();
      if (activeObjects.length) {
        activeObjects.forEach((obj) => {
          fabricCanvas.remove(obj);
        });
        fabricCanvas.discardActiveObject().renderAll();
        updateCanvasHistory(fabricCanvas);
      }
    }
  };

  // Handle zoom in
  const handleZoomIn = () => {
    if (fabricCanvas && zoom < 5) {
      const newZoom = zoom + 0.1;
      fabricCanvas.setZoom(newZoom);
      setZoom(newZoom);
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (fabricCanvas && zoom > 0.5) {
      const newZoom = zoom - 0.1;
      fabricCanvas.setZoom(newZoom);
      setZoom(newZoom);
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.setBackgroundColor(
        "#ffffff",
        fabricCanvas.renderAll.bind(fabricCanvas)
      );
      updateCanvasHistory(fabricCanvas);
    }
  };

  // Add shape
  const addShape = (type) => {
    if (!fabricCanvas) return;

    let shape;
    switch (type) {
      case "rectangle":
        shape = new fabric.Rect({
          width: 100,
          height: 100,
          fill: fillColor,
          stroke: brushColor,
          strokeWidth: 2,
          left: fabricCanvas.width / 2 - 50,
          top: fabricCanvas.height / 2 - 50,
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          radius: 50,
          fill: fillColor,
          stroke: brushColor,
          strokeWidth: 2,
          left: fabricCanvas.width / 2 - 50,
          top: fabricCanvas.height / 2 - 50,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          width: 100,
          height: 100,
          fill: fillColor,
          stroke: brushColor,
          strokeWidth: 2,
          left: fabricCanvas.width / 2 - 50,
          top: fabricCanvas.height / 2 - 50,
        });
        break;
      case "line":
        shape = new fabric.Line([50, 50, 200, 50], {
          stroke: brushColor,
          strokeWidth: 5,
          left: fabricCanvas.width / 2 - 100,
          top: fabricCanvas.height / 2,
        });
        break;
    }

    if (shape) {
      fabricCanvas.add(shape);
      fabricCanvas.setActiveObject(shape);
      fabricCanvas.renderAll();
      updateCanvasHistory(fabricCanvas);
      setShapesMenu(false);
    }
  };

  // Add text
  const addText = () => {
    if (fabricCanvas) {
      const text = new fabric.IText("Double-click to edit", {
        left: fabricCanvas.width / 2 - 100,
        top: fabricCanvas.height / 2,
        fontFamily: "Arial",
        fill: brushColor,
        fontSize: 20,
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      fabricCanvas.renderAll();
      updateCanvasHistory(fabricCanvas);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && fabricCanvas) {
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target.result;
        fabric.Image.fromURL(data, (img) => {
          img.scaleToWidth(200);
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
          updateCanvasHistory(fabricCanvas);
          e.target.value = null; // Reset the input
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Update canvas history
  const updateCanvasHistory = (canvas) => {
    const json = canvas.toJSON();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 w-full bg-white shadow-md z-10 flex justify-between p-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMode("select")}
            className={`p-2 rounded-md ${
              activeMode === "select"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
            title="Select"
          >
            <IoHandRightOutline className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMode("draw")}
            className={`p-2 rounded-md ${
              activeMode === "draw"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
            title="Draw"
          >
            <IoBrushOutline className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShapesMenu(!shapesMenu)}
              className={`p-2 rounded-md ${
                shapesMenu ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
              title="Shapes"
            >
              <IoShapesOutline className="w-5 h-5" />
            </button>
            {shapesMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md p-2 flex flex-col space-y-2 w-40">
                <button
                  onClick={() => addShape("rectangle")}
                  className="p-2 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <span className="ml-2">Rectangle</span>
                </button>
                <button
                  onClick={() => addShape("circle")}
                  className="p-2 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <span className="ml-2">Circle</span>
                </button>
                <button
                  onClick={() => addShape("triangle")}
                  className="p-2 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <span className="ml-2">Triangle</span>
                </button>
                <button
                  onClick={() => addShape("line")}
                  className="p-2 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <span className="ml-2">Line</span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={addText}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Add Text"
          >
            <IoTextOutline className="w-5 h-5" />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Upload Image"
          >
            <IoImageOutline className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-md hover:bg-gray-100 flex items-center"
              title="Color Picker"
            >
              <IoColorPaletteOutline className="w-5 h-5 mr-1" />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: brushColor }}
              ></div>
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md p-2 z-20">
                <div className="mb-2">
                  <p className="text-xs mb-1 text-gray-600">Stroke Color</p>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-full h-8"
                  />
                </div>
                <div>
                  <p className="text-xs mb-1 text-gray-600">Fill Color</p>
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-full h-8"
                  />
                </div>
                <div className="mt-2">
                  <p className="text-xs mb-1 text-gray-600">
                    Brush Size: {brushSize}px
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUndo}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Undo"
            disabled={historyIndex <= 0}
          >
            <IoArrowUndoOutline
              className={`w-5 h-5 ${historyIndex <= 0 ? "text-gray-300" : ""}`}
            />
          </button>
          <button
            onClick={handleRedo}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Redo"
            disabled={historyIndex >= history.length - 1}
          >
            <IoArrowRedoOutline
              className={`w-5 h-5 ${
                historyIndex >= history.length - 1 ? "text-gray-300" : ""
              }`}
            />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Delete"
          >
            <IoTrashOutline className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Zoom In"
          >
            <IoAddCircleOutline className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Zoom Out"
          >
            <IoRemoveCircleOutline className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={exportCanvas}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Export"
          >
            <IoDownloadOutline className="w-5 h-5" />
          </button>
          <button
            onClick={clearCanvas}
            className="ml-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="mt-16 relative">
        <canvas ref={canvasRef} className="border-0" />
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-1 text-xs text-gray-600 flex justify-between">
        <span>
          Mode: {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)}
        </span>
        <span>VoiceBoard | Built with Fabric.js</span>
      </div>
    </div>
  );
};

export default Whiteboard;
