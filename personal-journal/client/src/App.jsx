import { useState, useEffect } from "react";
import { API_URL } from "./api.js";
import "./App.css";

function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // viewing/editing in the right panel
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", body: "" });

  // New entry form 
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [createError, setCreateError] = useState(null);

  // fetch all entries 
  async function loadEntries() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/entries`);
      if (!res.ok) throw new Error("Failed to load entries");
      const data = await res.json();
      setEntries(data);
      if (data.length > 0 && !selectedEntry) {
        setSelectedEntry(data[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  // Create new entry
  async function handleCreate(e) {
    e.preventDefault();
    setCreateError(null);

    try {
      const res = await fetch(`${API_URL}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, body: newBody })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create entry");
      }

      const created = await res.json();
      setEntries([created, ...entries]);
      setSelectedEntry(created);
      setNewTitle("");
      setNewBody("");
    } catch (err) {
      console.error(err);
      setCreateError(err.message);
    }
  }

  // start editing
  function startEdit() {
    if (!selectedEntry) return;
    setEditForm({ title: selectedEntry.title, body: selectedEntry.body });
    setIsEditing(true);
  }

  // save edit
  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/entries/${selectedEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      if (!res.ok) throw new Error("Failed to update entry");
      const updated = await res.json();

      setEntries(entries.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedEntry(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Error saving updates.");
    }
  }

  // delete entry
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`${API_URL}/entries/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete entry");

      const remaining = entries.filter((item) => item.id !== id);
      setEntries(remaining);
      setSelectedEntry(remaining.length > 0 ? remaining[0] : null);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Error deleting entry.");
    }
  }


  return (
    <div className="app-container">
      <header className="header">
        <h1>Personal Journal</h1>
      </header>
      <section className="form-card">
        <h2>Write a New Entry</h2>
        {createError && <p className="error-text">{createError}</p>}
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Entry Title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Write your thoughts here..."
            rows={4}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            required
          />
          <button type="submit">Save Entry</button>
        </form>
      </section>

      {/* Main Journal View */}
      <div className="main-layout">
        <div className="list-panel">
          <h2>Entries</h2>
          {loading && <p>Loading entries...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && !error && entries.length === 0 && (
            <p className="empty-state">No journal entries yet. Write one above</p>
          )}

          <div className="entry-list">
            {entries.map((item) => (
              <div
                key={item.id}
                className={`entry-item ${selectedEntry?.id === item.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedEntry(item);
                  setIsEditing(false);
                }}
              >
                <h4>{item.title}</h4>
                <small>{new Date(item.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Detail / Edit View */}
        <div className="detail-panel">
          {selectedEntry ? (
            isEditing ? (
              <form onSubmit={handleUpdate} className="edit-form">
                <h2>Editing Entry</h2>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
                <textarea
                  rows={8}
                  value={editForm.body}
                  onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                  required
                />
                <div className="button-group">
                  <button type="submit">Save Changes</button>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="detail-view">
                <h2>{selectedEntry.title}</h2>
                <p className="date-subtitle">
                  Written on: {new Date(selectedEntry.createdAt).toLocaleString()}
                </p>
                <div className="entry-body">
                  <p>{selectedEntry.body}</p>
                </div>
                <div className="button-group">
                  <button onClick={startEdit}>Edit Entry</button>
                  <button className="btn-danger" onClick={() => handleDelete(selectedEntry.id)}>
                    Delete Entry
                  </button>
                </div>
              </div>
            )
          ) : (
            <p className="empty-state">Select an entry from the list to view it.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;