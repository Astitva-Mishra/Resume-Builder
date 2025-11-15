import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const Resume = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchResume = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.RESUME.GET_BY_ID(id));
        if (mounted) setResume(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load resume"
        );
      }
    };
    fetchResume();
    return () => (mounted = false);
  }, [id]);

  if (error) return <div className="p-6">Error: {error}</div>;
  if (!resume) return <div className="p-6">Loading resume...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        {resume.title || "Untitled Resume"}
      </h1>
      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
        {JSON.stringify(resume, null, 2)}
      </pre>
    </div>
  );
};

export default Resume;
