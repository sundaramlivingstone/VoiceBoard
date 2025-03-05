import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faFileLines,
  faTableCells,
  faTrashCan,
  faPenRuler,
  faTableColumns,
  faUsers,
  faUpload,
  faChevronDown,
  faThLarge,
  faBars,
  faSearch,
  faBell,
  faStar as solidStar,
  faCopy,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import {
  faStar as regularStar,
  faFolderOpen,
  faFile,
  faBell as regularBell,
} from "@fortawesome/free-regular-svg-icons";

const Dashboard = () => {
  // Initialize state with default values
  const [userName, setUserName] = useState("User");
  const [projects, setProjects] = useState([]);
  const [starredProjects, setStarredProjects] = useState([]);
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [renameInput, setRenameInput] = useState("");
  const [contextMenuTarget, setContextMenuTarget] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load userName
        const storedUserName = localStorage.getItem("userName");
        if (storedUserName) {
          setUserName(storedUserName);
        }

        // Load projects
        const storedProjects = localStorage.getItem("projects");
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        }

        // Load starredProjects
        const storedStarredProjects = localStorage.getItem("starredProjects");
        if (storedStarredProjects) {
          setStarredProjects(JSON.parse(storedStarredProjects));
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem("projects");
        localStorage.removeItem("starredProjects");
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever projects or starredProjects change
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("starredProjects", JSON.stringify(starredProjects));
  }, [starredProjects]);

  // Generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Create a new board
  const createBoard = () => {
    const name = newBoardName.trim() || `Untitled-${projects.length + 1}`;
    const newProject = {
      id: generateId(),
      name,
      type: "board",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
    setShowNewBoardModal(false);
    setNewBoardName("");
    alert(
      `Opening new board: ${name}\nIn a full implementation, this would navigate to a whiteboard editor.`
    );
  };

  // Handle file import
  const handleFileImport = (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    const newProjects = Array.from(files).map((file) => ({
      id: generateId(),
      name: file.name,
      type: "import",
      fileType: file.type,
      size: file.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setProjects([...projects, ...newProjects]);
    e.target.value = "";
  };

  // Handle context menu
  const handleContextMenu = (e, projectId) => {
    e.preventDefault();
    setContextMenuTarget(projectId);
    setContextMenuPosition({ top: e.clientY, left: e.clientX });
  };

  // Handle rename
  const handleRename = () => {
    const projectIndex = projects.findIndex((p) => p.id === contextMenuTarget);
    if (projectIndex > -1) {
      const updatedProjects = [...projects];
      updatedProjects[projectIndex].name = renameInput.trim();
      setProjects(updatedProjects);
    }
    setShowRenameModal(false);
    setRenameInput("");
  };

  // Handle star/unstar
  const handleStar = () => {
    const isStarred = starredProjects.includes(contextMenuTarget);
    if (isStarred) {
      setStarredProjects(
        starredProjects.filter((id) => id !== contextMenuTarget)
      );
    } else {
      setStarredProjects([...starredProjects, contextMenuTarget]);
    }
    setContextMenuTarget(null);
  };

  // Handle delete click
  const handleDeleteClick = (projectId) => {
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      setProjects(projects.filter((p) => p.id !== projectToDelete));
      setStarredProjects(
        starredProjects.filter((id) => id !== projectToDelete)
      );
      setProjectToDelete(null);
    }
    setShowDeleteModal(false);
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setProjectToDelete(null);
    setShowDeleteModal(false);
  };

  // Get time ago string
  const getTimeAgo = (date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return `${diffMonths} months ago`;
  };

  return (
    <div className="bg-gray-100 font-sans h-screen flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        {/* User Profile Section */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            <span>{userName.charAt(0)}</span>
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{userName}</span>
              <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
            </div>
          </div>
          <div className="ml-2">
            <FontAwesomeIcon icon={regularBell} className="text-gray-600" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="bg-gray-100 rounded-md px-3 py-2 flex items-center">
            <FontAwesomeIcon
              icon={faSearch}
              className="text-gray-400 mr-2 text-sm"
            />
            <input
              type="text"
              placeholder="Search for anything"
              className="bg-transparent w-full text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto">
          <ul>
            <li className="mb-1">
              <a
                href="#"
                className="flex items-center py-2 px-4 bg-blue-100 text-blue-700"
              >
                <FontAwesomeIcon icon={faClock} className="w-6 text-sm" />
                <span className="text-sm">Recents</span>
              </a>
            </li>
            <li className="mb-1">
              <a
                href="#"
                className="flex items-center py-2 px-4 hover:bg-gray-50"
              >
                <FontAwesomeIcon
                  icon={faFileLines}
                  className="w-6 text-sm text-gray-500"
                />
                <span className="text-sm">Drafts</span>
              </a>
            </li>
            <li className="mb-1">
              <a
                href="#"
                className="flex items-center py-2 px-4 hover:bg-gray-50"
              >
                <FontAwesomeIcon
                  icon={faTableCells}
                  className="w-6 text-sm text-gray-500"
                />
                <span className="text-sm">All projects</span>
              </a>
            </li>
            <li className="mb-1">
              <a
                href="#"
                className="flex items-center py-2 px-4 hover:bg-gray-50"
              >
                <FontAwesomeIcon
                  icon={faTrashCan}
                  className="w-6 text-sm text-gray-500"
                />
                <span className="text-sm">Trash</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Starred section */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="font-medium text-sm mb-2">Starred</h3>
          <ul>
            {starredProjects.length === 0 ? (
              <li className="text-xs text-gray-500 italic">No starred items</li>
            ) : (
              starredProjects.map((id) => {
                const project = projects.find((p) => p.id === id);
                if (!project) return null;
                return (
                  <li key={id} className="mb-1">
                    <a
                      href="#"
                      className="flex items-center py-1 hover:bg-gray-50"
                    >
                      <FontAwesomeIcon
                        icon={project.type === "board" ? faPenRuler : faFile}
                        className="w-6 text-sm text-gray-500"
                      />
                      <span className="text-sm truncate">{project.name}</span>
                    </a>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Creation Options */}
        <div className="p-6 bg-white">
          <h2 className="text-lg font-medium mb-4">Dashboard</h2>
          <div className="grid grid-cols-4 gap-4">
            <div
              className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center cursor-pointer hover:shadow-md transition"
              onClick={() => setShowNewBoardModal(true)}
            >
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FontAwesomeIcon icon={faPenRuler} className="text-xl" />
              </div>
              <p className="text-sm">New Whiteboard</p>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center cursor-pointer hover:shadow-md transition">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FontAwesomeIcon icon={faTableColumns} className="text-xl" />
              </div>
              <p className="text-sm">New Template</p>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center cursor-pointer hover:shadow-md transition relative">
              <div className="absolute top-1 right-2 bg-gray-100 text-gray-800 text-xs px-1 rounded">
                Beta
              </div>
              <div className="bg-orange-500 text-white rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-xl" />
              </div>
              <p className="text-sm">New Collaboration</p>
            </div>
            <div
              className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center cursor-pointer hover:shadow-md transition"
              onClick={() => document.getElementById("fileInput").click()}
            >
              <div className="bg-gray-200 text-gray-600 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FontAwesomeIcon icon={faUpload} className="text-xl" />
              </div>
              <p className="text-sm">Import</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 bg-white border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button className="px-3 py-3 text-sm font-medium text-gray-800 border-b-2 border-gray-800">
                Recently viewed
              </button>
              <button className="px-3 py-3 text-sm text-gray-500">
                My files
              </button>
              <button className="px-3 py-3 text-sm text-gray-500">
                Shared with me
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                <span>Last viewed</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-xs ml-1"
                />
              </button>
              <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                <FontAwesomeIcon icon={faThLarge} className="text-sm" />
              </button>
              <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                <FontAwesomeIcon icon={faBars} className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Project Grid */}
        <div className="flex-1 p-6 bg-gray-100 overflow-auto">
          <div className="grid grid-cols-4 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-4 text-center py-12">
                <div className="text-gray-400 mb-2">
                  <FontAwesomeIcon icon={faFolderOpen} className="text-4xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">
                  No projects yet
                </h3>
                <p className="text-sm text-gray-500">
                  Create a new board or import files to get started
                </p>
              </div>
            ) : (
              projects.map((project) => {
                const isStarred = starredProjects.includes(project.id);
                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition project-card"
                    onContextMenu={(e) => handleContextMenu(e, project.id)}
                  >
                    <div className="h-40 bg-gray-50 p-3 flex items-center justify-center">
                      {project.type === "board" ? (
                        <FontAwesomeIcon
                          icon={faPenRuler}
                          className="text-6xl text-gray-300"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faFile}
                          className="text-6xl text-gray-300"
                        />
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium truncate">{project.name}</h3>
                        <p className="text-xs text-gray-500">
                          Edited {getTimeAgo(project.updatedAt)}
                        </p>
                      </div>
                      <div>
                        <button
                          className={`text-gray-400 hover:text-yellow-500 ${
                            isStarred ? "text-yellow-500" : ""
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={isStarred ? solidStar : regularStar}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* File Upload Input (Hidden) */}
      <input
        type="file"
        id="fileInput"
        className="hidden"
        multiple
        onChange={handleFileImport}
      />

      {/* Modal for New Board Creation */}
      {showNewBoardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Create New Board</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Board Name
              </label>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Untitled"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setShowNewBoardModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={createBoard}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Rename */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Rename Board</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Name
              </label>
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setShowRenameModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleRename}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Delete Board</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this board?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenuTarget && (
        <div
          className="fixed bg-white shadow-lg rounded-md py-2"
          style={{
            top: contextMenuPosition.top,
            left: contextMenuPosition.left,
            zIndex: 1000,
            minWidth: "150px",
          }}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => {
              setShowRenameModal(true);
              setContextMenuTarget(null);
            }}
          >
            <FontAwesomeIcon icon={faPen} className="text-gray-500 mr-2" />{" "}
            Rename
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => {
              /* Handle duplicate */ setContextMenuTarget(null);
            }}
          >
            <FontAwesomeIcon icon={faCopy} className="text-gray-500 mr-2" />{" "}
            Duplicate
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={handleStar}
          >
            <FontAwesomeIcon
              icon={
                starredProjects.includes(contextMenuTarget)
                  ? solidStar
                  : regularStar
              }
              className="text-gray-500 mr-2"
            />{" "}
            Star
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
            onClick={() => handleDeleteClick(contextMenuTarget)}
          >
            <FontAwesomeIcon icon={faTrashCan} className="mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
