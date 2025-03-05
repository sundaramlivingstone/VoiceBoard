import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenRuler,
  faTableColumns,
  faUsers,
  faUpload,
  faFolderOpen,
  faFile,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    setProjects(storedProjects);
  }, []);

  // Create a new project
  const createNewProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: `Untitled-${projects.length + 1}`,
      type: "whiteboard",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    return newProject;
  };

  // Delete a project
  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
  };

  return (
    <div className="bg-gray-100 font-sans h-screen flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto">
          <ul>
            <li className="mb-1">
              <Link
                to="/whiteboard/new"
                onClick={createNewProject}
                className="flex items-center py-2 px-4 bg-blue-100 text-blue-700"
              >
                <span className="text-sm">New Whiteboard</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Recently Viewed */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="font-medium text-sm mb-2">Recently Viewed</h3>
          <ul>
            {projects.length === 0 ? (
              <li className="text-xs text-gray-500 italic">No projects yet</li>
            ) : (
              projects.map((project) => (
                <li key={project.id} className="mb-1">
                  <Link
                    to={`/whiteboard/${project.id}`}
                    className="flex items-center py-1 hover:bg-gray-50"
                  >
                    <FontAwesomeIcon
                      icon={project.type === "whiteboard" ? faPenRuler : faFile}
                      className="w-6 text-sm text-gray-500"
                    />
                    <span className="text-sm truncate ml-2">
                      {project.name}
                    </span>
                  </Link>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-red-500 text-xs hover:text-red-700 ml-6"
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 bg-white">
          <h2 className="text-lg font-medium mb-4">Dashboard</h2>
          <div className="grid grid-cols-4 gap-4">
            {/* New Whiteboard */}
            <div
              className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center cursor-pointer hover:shadow-md transition"
              onClick={() => setShowNewBoardModal(true)}
            >
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FontAwesomeIcon icon={faPenRuler} className="text-xl" />
              </div>
              <p className="text-sm">New Whiteboard</p>
            </div>

            {/* New Template */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center cursor-pointer hover:shadow-md transition">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FontAwesomeIcon icon={faTableColumns} className="text-xl" />
              </div>
              <p className="text-sm">New Template</p>
            </div>

            {/* New Collaboration */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center cursor-pointer hover:shadow-md transition relative">
              <div className="absolute top-1 right-2 bg-gray-100 text-gray-800 text-xs px-1 rounded">
                Beta
              </div>
              <div className="bg-orange-500 text-white rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-xl" />
              </div>
              <p className="text-sm">New Collaboration</p>
            </div>

            {/* Import */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center cursor-pointer hover:shadow-md transition">
              <div className="bg-gray-200 text-gray-600 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FontAwesomeIcon icon={faUpload} className="text-xl" />
              </div>
              <p className="text-sm">Import</p>
            </div>
          </div>
        </div>
      </div>

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
                placeholder="Untitled"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewBoardModal(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  createNewProject();
                  setShowNewBoardModal(false);
                }}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
