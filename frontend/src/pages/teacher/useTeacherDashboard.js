// TeacherDashboard/hooks/useTeacherDashboard.js
import { useState, useEffect } from "react";
import api from "../../../src/services/api";

export const useTeacherDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rollNumberInput, setRollNumberInput] = useState("");
  const [markAs, setMarkAs] = useState("present");
  const [activeTab, setActiveTab] = useState("list");
  const [saveStatus, setSaveStatus] = useState("");
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState("");
  const [newSessionTopic, setNewSessionTopic] = useState("");
  const [pendingChanges, setPendingChanges] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { fetchAssignments(); }, []);
  useEffect(() => { if (selectedAssignment) fetchSessions(selectedAssignment); }, [selectedAssignment]);
  useEffect(() => {
    if (selectedSession) {
      fetchAttendance(selectedSession);
      setPendingChanges({});
      setHasChanges(false);
    }
  }, [selectedSession]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/teachers/assignments");
      setAssignments(res.data);
    } catch {
      setError("Failed to load teaching assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (assignmentId) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/teachers/sessions/${assignmentId}`);
      setSessions(res.data);
      setSelectedSession(null);
      setAttendanceRecords([]);
    } catch {
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (sessionId) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/teachers/sessions/${sessionId}/attendance`);
      setAttendanceRecords(res.data);
    } catch {
      setError("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const toggleNewSessionForm = () => {
    setShowNewSessionForm(!showNewSessionForm);
    if (!showNewSessionForm) {
      const today = new Date().toISOString().split("T")[0];
      setNewSessionDate(today);
    }
  };

  const createNewSession = async () => {
    if (!selectedAssignment || !newSessionDate) {
      setSaveStatus("Please select an assignment and enter a valid date");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/teachers/sessions", {
        assignmentId: selectedAssignment,
        date: newSessionDate,
        topic: newSessionTopic.trim() || "No topic",
      });
      setSessions([res.data, ...sessions]);
      setSelectedSession(res.data.id);
      setNewSessionDate("");
      setNewSessionTopic("");
      setShowNewSessionForm(false);
      setSaveStatus("New session created successfully");
    } catch {
      setError("Failed to create session");
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const toggleAttendance = (attendanceId, isPresent) => {
    setPendingChanges((prev) => ({ ...prev, [attendanceId]: isPresent }));
    setAttendanceRecords((records) =>
      records.map((record) =>
        record.id === attendanceId ? { ...record, present: isPresent } : record
      )
    );
    setHasChanges(true);
  };

  const submitAttendanceChanges = async () => {
    if (!selectedSession || Object.keys(pendingChanges).length === 0) return;
    setLoading(true);
    try {
      const updates = Object.entries(pendingChanges).map(([id, present]) => {
        const rec = attendanceRecords.find((r) => r.id === id);
        return { studentId: rec.studentId, present };
      });
      await api.put(`/api/teachers/attendance/batch/${selectedSession}`, {
        attendanceRecords: updates,
      });
      setPendingChanges({});
      setHasChanges(false);
      setSaveStatus(`Attendance updated successfully for ${updates.length} students`);
    } catch {
      setSaveStatus("Failed to update attendance");
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const processRollNumbers = async () => {
    if (!selectedSession || !rollNumberInput.trim()) {
      setSaveStatus("Please select a session and enter roll numbers");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }

    const rollNumbers = rollNumberInput.split(",").map((n) => n.trim()).filter(Boolean);
    if (!rollNumbers.length) {
      setSaveStatus("Please enter valid roll numbers");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const matched = attendanceRecords.filter((r) =>
        rollNumbers.includes(r.student?.rollNumber?.toString())
      );
      if (!matched.length) {
        setSaveStatus("No matching students found");
        setLoading(false);
        setTimeout(() => setSaveStatus(""), 3000);
        return;
      }

      const updates = matched.map((r) => ({
        studentId: r.studentId,
        present: markAs === "present",
      }));

      await api.put(`/api/teachers/attendance/batch/${selectedSession}`, {
        attendanceRecords: updates,
      });

      setAttendanceRecords((prev) =>
        prev.map((r) =>
          matched.find((m) => m.studentId === r.studentId)
            ? { ...r, present: markAs === "present" }
            : r
        )
      );

      setRollNumberInput("");
      setSaveStatus(`Marked ${matched.length} students as ${markAs}`);
    } catch {
      setSaveStatus("Failed to update attendance");
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  return {
    // States
    assignments, selectedAssignment, sessions, selectedSession,
    attendanceRecords, loading, error, saveStatus,
    rollNumberInput, setRollNumberInput,
    markAs, setMarkAs, activeTab, setActiveTab,
    showNewSessionForm, newSessionDate, setNewSessionDate,
    newSessionTopic, setNewSessionTopic,
    hasChanges,

    // Setters
    setSelectedAssignment, setSelectedSession,

    // Actions
    fetchAssignments, fetchSessions, fetchAttendance,
    toggleNewSessionForm, createNewSession,
    toggleAttendance, submitAttendanceChanges,
    processRollNumbers
  };
};
